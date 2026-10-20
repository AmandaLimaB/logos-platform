import React from 'react';
import { X, MapPin, Clock, Tag, Shield, AlertTriangle } from './Icons';
import { CRITICALITIES, STATUSES } from '../constants/incidentConfig';

export function IncidentDetailModal({
  incident,
  onClose,
  onStatusChange,
  onSimulateConflict,
  isUpdating,
}) {
  if (!incident) return null;

  const critConfig = CRITICALITIES[incident.criticality] || CRITICALITIES.BAIXA;
  const statusConfig = STATUSES[incident.status] || STATUSES.ABERTO;

  const formatDate = (dateString) => {
    if (!dateString) return 'Recentemente';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="modal-header">
          <div className="badges-group">
            <span className={`badge ${critConfig.badgeClass}`}>
              {incident.criticality === 'ALTA' && <span className="pulse-bullet"></span>}
              {incident.criticality}
            </span>

            <span className="badge-category-modal">
              <Tag size={13} style={{ display: 'inline', marginRight: '4px' }} />
              {incident.category}
            </span>

            <span className={`badge-status ${statusConfig.badgeClass}`}>
              {incident.status}
            </span>

            <span className="badge-version" title="Versão de concorrência">
              rev {incident.version}
            </span>
          </div>

          <button type="button" className="btn-close-modal" onClick={onClose} title="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Título Principal */}
        <h2 className="detail-modal-title">{incident.title}</h2>

        {/* Informações de Localização e Horário */}
        <div className="detail-meta-box">
          <div className="meta-item">
            <MapPin size={16} style={{ color: '#38bdf8' }} />
            <span><strong>Localização:</strong> {incident.location}</span>
          </div>
          <div className="meta-item">
            <Clock size={16} style={{ color: '#94a3b8' }} />
            <span><strong>Registrado em:</strong> {formatDate(incident.created_at)}</span>
          </div>
        </div>

        {/* Descrição Completa da Ocorrência */}
        <div className="detail-section">
          <h3>Descrição Operacional</h3>
          <p className="detail-description-text">{incident.description}</p>
        </div>

        {/* Ciclo de Vida e Ações */}
        <div className="detail-actions-section">
          <h3>Ações no Ciclo de Vida do Incidente</h3>
          <div className="action-buttons-modal">
            {incident.status === 'Aberto' && (
              <button
                type="button"
                className="btn-action btn-investigate-lg"
                disabled={isUpdating}
                onClick={() => onStatusChange(incident.id, 'Em Investigação', incident.version)}
              >
                Iniciar Investigação
              </button>
            )}

            {incident.status === 'Em Investigação' && (
              <>
                <button
                  type="button"
                  className="btn-action btn-close-lg"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(incident.id, 'Fechado', incident.version)}
                >
                  Resolver / Fechar Incidente
                </button>

                <button
                  type="button"
                  className="btn-action btn-inconclusive-lg"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(incident.id, 'Inconclusivo', incident.version)}
                >
                  Marcar como Inconclusivo
                </button>
              </>
            )}

            {(incident.status === 'Fechado' || incident.status === 'Inconclusivo') && (
              <button
                type="button"
                className="btn-action btn-reopen-lg"
                disabled={isUpdating}
                onClick={() => onStatusChange(incident.id, 'Em Investigação', incident.version)}
              >
                Reabrir para Investigação
              </button>
            )}
          </div>
        </div>

        {/* Rodapé com Teste de Concorrência e Fechar */}
        <div className="detail-modal-footer">
          <button
            type="button"
            className="btn-conflict-test-lg"
            title="Simula dois analistas tentando alterar o mesmo incidente ao mesmo tempo (HTTP 409)"
            onClick={() => onSimulateConflict(incident)}
          >
            ⚡ Simular Conflito de Concorrência (409)
          </button>

          <button type="button" className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
