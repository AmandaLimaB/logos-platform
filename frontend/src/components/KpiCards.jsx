import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, Activity, AlertCircle } from './Icons';

export function KpiCards({ incidents = [], allIncidents = [], filters = {}, setFilters = () => {} }) {
  // Usamos allIncidents para que os números reflitam sempre o total real da frota
  const dataSource = allIncidents?.length > 0 ? allIncidents : (incidents || []);

  const total = dataSource.length;
  const criticalCount = dataSource.filter(i => i.criticality === 'ALTA' && i.status !== 'Fechado').length;
  const inInvestigation = dataSource.filter(i => i.status === 'Em Investigação').length;
  const openCount = dataSource.filter(i => i.status === 'Aberto').length;
  const closedCount = dataSource.filter(i => i.status === 'Fechado').length;

  // Verificações seguras de filtro ativo
  const isCriticalActive = filters?.criticality === 'ALTA' && (filters?.status === 'TODAS' || !filters?.status);
  const isInvestigationActive = filters?.status === 'Em Investigação' && (filters?.criticality === 'TODAS' || !filters?.criticality);
  const isOpenActive = filters?.status === 'Aberto' && (filters?.criticality === 'TODAS' || !filters?.criticality);
  const isClosedActive = filters?.status === 'Fechado' && (filters?.criticality === 'TODAS' || !filters?.criticality);
  const isTotalActive = 
    (filters?.criticality === 'TODAS' || !filters?.criticality) && 
    (filters?.status === 'TODAS' || !filters?.status) && 
    (filters?.category === 'TODAS' || !filters?.category) && 
    !filters?.search;

  // Handlers para abrir o filtro com 1 clique
  const handleToggleCritical = () => {
    if (isCriticalActive) {
      setFilters(prev => ({ ...prev, criticality: 'TODAS' }));
    } else {
      setFilters(prev => ({ ...prev, criticality: 'ALTA', status: 'TODAS' }));
    }
  };

  const handleToggleInvestigation = () => {
    if (isInvestigationActive) {
      setFilters(prev => ({ ...prev, status: 'TODAS' }));
    } else {
      setFilters(prev => ({ ...prev, status: 'Em Investigação', criticality: 'TODAS' }));
    }
  };

  const handleToggleOpen = () => {
    if (isOpenActive) {
      setFilters(prev => ({ ...prev, status: 'TODAS' }));
    } else {
      setFilters(prev => ({ ...prev, status: 'Aberto', criticality: 'TODAS' }));
    }
  };

  const handleToggleClosed = () => {
    if (isClosedActive) {
      setFilters(prev => ({ ...prev, status: 'TODAS' }));
    } else {
      setFilters(prev => ({ ...prev, status: 'Fechado', criticality: 'TODAS' }));
    }
  };

  const handleShowAll = () => {
    setFilters({
      search: '',
      criticality: 'TODAS',
      category: 'TODAS',
      status: 'TODAS',
    });
  };

  return (
    <div className="kpi-grid">
      {/* 1. Críticos Ativos */}
      <div 
        className={`kpi-card kpi-critical ${isCriticalActive ? 'kpi-card-active' : ''}`}
        onClick={handleToggleCritical}
        role="button"
        tabIndex={0}
        title="Clique para filtrar apenas incidentes de ALTA criticidade"
        style={{ '--kpi-active-color': '#ef4444' }}
      >
        <div className="kpi-info-box">
          <p>Críticos Ativos</p>
          <div className="kpi-number">{criticalCount}</div>
        </div>
        <div className="kpi-icon">
          <AlertTriangle size={24} />
        </div>
      </div>

      {/* 2. Em Investigação */}
      <div 
        className={`kpi-card kpi-warning ${isInvestigationActive ? 'kpi-card-active' : ''}`}
        onClick={handleToggleInvestigation}
        role="button"
        tabIndex={0}
        title="Clique para filtrar ocorrências Em Investigação"
        style={{ '--kpi-active-color': '#f59e0b' }}
      >
        <div className="kpi-info-box">
          <p>Em Investigação</p>
          <div className="kpi-number">{inInvestigation}</div>
        </div>
        <div className="kpi-icon">
          <Clock size={24} />
        </div>
      </div>

      {/* 3. Abertos / Fila */}
      <div 
        className={`kpi-card kpi-info ${isOpenActive ? 'kpi-card-active' : ''}`}
        onClick={handleToggleOpen}
        role="button"
        tabIndex={0}
        title="Clique para filtrar ocorrências com status Aberto"
        style={{ '--kpi-active-color': '#38bdf8' }}
      >
        <div className="kpi-info-box">
          <p>Abertos / Fila</p>
          <div className="kpi-number">{openCount}</div>
        </div>
        <div className="kpi-icon">
          <AlertCircle size={24} />
        </div>
      </div>

      {/* 4. Resolvidos / Fechados */}
      <div 
        className={`kpi-card kpi-success ${isClosedActive ? 'kpi-card-active' : ''}`}
        onClick={handleToggleClosed}
        role="button"
        tabIndex={0}
        title="Clique para filtrar ocorrências Fechadas / Resolvidas"
        style={{ '--kpi-active-color': '#10b981' }}
      >
        <div className="kpi-info-box">
          <p>Resolvidos / Fechados</p>
          <div className="kpi-number">{closedCount}</div>
        </div>
        <div className="kpi-icon">
          <CheckCircle2 size={24} />
        </div>
      </div>

      {/* 5. Total na Operação */}
      <div 
        className={`kpi-card ${isTotalActive ? 'kpi-card-active' : ''}`}
        onClick={handleShowAll}
        role="button"
        tabIndex={0}
        title="Clique para remover todos os filtros e exibir toda a frota"
        style={{ '--kpi-active-color': '#60a5fa' }}
      >
        <div className="kpi-info-box">
          <p>Total na Operação</p>
          <div className="kpi-number">{total}</div>
        </div>
        <div className="kpi-icon">
          <Activity size={24} />
        </div>
      </div>
    </div>
  );
}
