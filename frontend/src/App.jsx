import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { KpiCards } from './components/KpiCards';
import { FilterBar } from './components/FilterBar';
import { IncidentCard } from './components/IncidentCard';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { NewIncidentModal } from './components/NewIncidentModal';
import { ConflictBanner } from './components/ConflictBanner';
import { RefreshCw, AlertTriangle } from './components/Icons';
import { fetchIncidents, createIncident, updateIncidentStatus, resetSeedData } from './services/api';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [allIncidents, setAllIncidents] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    criticality: 'TODAS',
    category: 'TODAS',
    status: 'TODAS',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  // Carrega incidentes da API com suporte a filtros combinados e status ATIVOS
  const loadIncidents = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    else setIsRefreshing(true);
    setConnectionError(null);

    try {
      // 1. Prepara parâmetros para a API: se status for 'ATIVOS', busca 'TODAS' para tratar localmente
      const apiFilters = {
        ...filters,
        status: filters.status === 'ATIVOS' ? 'TODAS' : filters.status,
      };

      const data = await fetchIncidents(apiFilters);

      // 2. Se o filtro for 'ATIVOS', mantém apenas incidentes em 'Aberto' ou 'Em Investigação'
      let filteredData = data;
      if (filters.status === 'ATIVOS') {
        filteredData = data.filter(
          item => item.status === 'Aberto' || item.status === 'Em Investigação'
        );
      }

      // 3. Ordena os incidentes por data de criação: mais antigos primeiro (ASC)
      const sortedData = [...filteredData].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      setIncidents(sortedData);

      // 4. Busca dados completos (sem filtros) para manter os KPIs consolidados
      const isUnfiltered = 
        filters.criticality === 'TODAS' && 
        filters.category === 'TODAS' && 
        filters.status === 'TODAS' && 
        !filters.search;

      if (isUnfiltered) {
        setAllIncidents(sortedData);
      } else {
        fetchIncidents({}).then(all => {
          const sortedAll = [...all].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
          setAllIncidents(sortedAll);
        }).catch(() => {});
      }

      // 5. Mantém o item selecionado sincronizado no modal se estiver aberto
      setSelectedIncident(curr => {
        if (!curr) return null;
        const fresh = data.find(i => i.id === curr.id);
        return fresh || null;
      });
    } catch (err) {
      console.error('Erro ao conectar com a API:', err);
      setConnectionError(
        'Falha ao sincronizar com a Central de Incidentes. Verifique se o servidor backend está operacional.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filters]);

  // Carrega sempre que os filtros mudarem
  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  // Atualização de Status com Optimistic UI e Tratamento de Concorrência (409)
  const handleStatusChange = async (incidentId, newStatus, currentVersion) => {
    const previousIncidents = [...incidents];
    const previousAll = [...allIncidents];

    // Optimistic UI: atualiza visualmente de imediato
    setIncidents(prev =>
      prev.map(item =>
        item.id === incidentId
          ? { ...item, status: newStatus, version: item.version + 1 }
          : item
      )
    );
    setAllIncidents(prev =>
      prev.map(item =>
        item.id === incidentId
          ? { ...item, status: newStatus, version: item.version + 1 }
          : item
      )
    );
    setSelectedIncident(prev =>
      prev && prev.id === incidentId
        ? { ...prev, status: newStatus, version: prev.version + 1 }
        : prev
    );

    setIsUpdating(true);
    setConflictInfo(null);

    try {
      const updated = await updateIncidentStatus(incidentId, {
        status: newStatus,
        expected_version: currentVersion,
      });

      // Confirms com os dados retornados do servidor
      setIncidents(prev =>
        prev.map(item => (item.id === incidentId ? updated : item))
      );
      setAllIncidents(prev =>
        prev.map(item => (item.id === incidentId ? updated : item))
      );
      setSelectedIncident(curr => (curr && curr.id === incidentId ? updated : curr));
    } catch (err) {
      // Rollback em caso de falha
      setIncidents(previousIncidents);
      setAllIncidents(previousAll);
      setSelectedIncident(previousIncidents.find(i => i.id === incidentId) || null);

      if (err.status === 409) {
        setConflictInfo({
          incidentId,
          message: err.message,
        });
        loadIncidents(true);
      } else {
        alert(err.message || 'Erro ao processar a atualização de status.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Simulação de Concorrência Otimista (409) para a apresentação/vídeo
  const handleSimulateConflict = async (incident) => {
    setConflictInfo(null);
    const staleVersion = incident.version - 1;

    try {
      await updateIncidentStatus(incident.id, {
        status: incident.status === 'Aberto' ? 'Em Investigação' : 'Fechado',
        expected_version: staleVersion,
      });
    } catch (err) {
      if (err.status === 409) {
        setConflictInfo({
          incidentId: incident.id,
          message: `Simulação de Conflito bem-sucedida! O analista tentou atualizar a versão ${staleVersion}, mas a versão atual no banco é ${incident.version}. A requisição foi bloqueada pelo servidor (HTTP 409 Conflict).`,
        });
        loadIncidents(true);
      } else {
        alert(err.message);
      }
    }
  };

  // Criação de Novo Incidente
  const handleCreateIncident = async (newIncidentData) => {
    setIsSubmitting(true);
    try {
      await createIncident(newIncidentData);
      setIsModalOpen(false);
      await loadIncidents();
    } catch (err) {
      alert(err.message || 'Erro ao criar incidente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restauração da Seed de Testes
  const handleResetSeed = async () => {
    if (!window.confirm('Deseja restaurar a base de dados com as ocorrências padrão de teste?')) {
      return;
    }
    try {
      setIsRefreshing(true);
      await resetSeedData();
      await loadIncidents();
      setSelectedIncident(null);
      setConflictInfo(null);
    } catch (err) {
      alert('Falha ao restaurar banco de dados.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        onNewIncident={() => setIsModalOpen(true)}
        onRefresh={() => loadIncidents(true)}
        onResetSeed={handleResetSeed}
        isRefreshing={isRefreshing}
      />

      <main className="main-content">
        {/* Banner de Aviso de Conflito de Concorrência (409) */}
        <ConflictBanner
          conflictInfo={conflictInfo}
          onDismiss={() => setConflictInfo(null)}
        />

        {/* Alerta de Queda de Conexão */}
        {connectionError && (
          <div className="conflict-banner" style={{ borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)' }}>
            <div className="conflict-content">
              <AlertTriangle size={22} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fde68a' }}>Aviso de Resiliência: Conexão Oscilando</strong>
                <p style={{ color: '#fef3c7' }}>{connectionError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Painel Superior de Métricas Operacionais com Filtros Interativos */}
        <KpiCards
          incidents={incidents}
          allIncidents={allIncidents}
          filters={filters}
          setFilters={setFilters}
        />

        {/* Barra de Filtros e Gestão por Exceção */}
        <FilterBar filters={filters} setFilters={setFilters} />

        {/* Cabeçalho da Listagem */}
        <div className="incidents-section-header">
          <span className="incidents-count">
            Exibindo <strong>{incidents.length}</strong> incidentes na operação
            {filters.criticality !== 'TODAS' && ` (Filtro: ${filters.criticality})`}
            {filters.status !== 'TODAS' && ` (Status: ${filters.status})`}
          </span>

          {isRefreshing && (
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={12} className="spin" />
              Sincronizando em segundo plano...
            </span>
          )}
        </div>

        {/* Grade de Incidentes Compacta */}
        {isLoading ? (
          <div className="loading-indicator">
            <RefreshCw size={24} className="spin" />
            <span>Carregando dados da Central Logos...</span>
          </div>
        ) : incidents.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={40} style={{ color: '#64748b', marginBottom: '0.5rem' }} />
            <h3>Nenhum incidente encontrado para os filtros selecionados</h3>
            <p>Tente ajustar a busca textual ou os filtros de criticidade e categoria.</p>
          </div>
        ) : (
          <div className="incidents-grid">
            {incidents.map(incident => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                onSelect={setSelectedIncident}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalhes e Ações Operacionais */}
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onStatusChange={handleStatusChange}
        onSimulateConflict={handleSimulateConflict}
        isUpdating={isUpdating}
      />

      {/* Modal para Registrar Novo Incidente */}
      <NewIncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateIncident}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default App;