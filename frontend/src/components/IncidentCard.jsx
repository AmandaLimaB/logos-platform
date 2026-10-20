import React from 'react';
import { CRITICALITIES, STATUSES } from '../constants/incidentConfig';

export function IncidentCard({ incident, onSelect }) {
  const critConfig = CRITICALITIES[incident.criticality] || CRITICALITIES.BAIXA;
  const statusConfig = STATUSES[incident.status] || STATUSES.ABERTO;

  return (
    <div
      className={`incident-card incident-card-compact ${critConfig.borderClass}`}
      onClick={() => onSelect(incident)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(incident);
        }
      }}
    >
      {/* Badges de Triagem Imediata: Criticidade, Categoria e Status */}
      <div className="card-top">
        <div className="badges-group">
          {/* Criticidade */}
          <span className={`badge ${critConfig.badgeClass}`}>
            {incident.criticality === 'ALTA' && <span className="pulse-bullet"></span>}
            {incident.criticality}
          </span>

          {/* Categoria do Incidente */}
          <span className="badge-category">
            {incident.category}
          </span>

          {/* Status do Ciclo de Vida */}
          <span className={`badge-status ${statusConfig.badgeClass}`}>
            {incident.status}
          </span>
        </div>
      </div>

      {/* Título do Incidente */}
      <h3 className="card-title-compact">{incident.title}</h3>

      {/* Dica sutil de clique */}
      <div className="card-compact-footer">
        <span className="compact-action-hint">Clique para gerenciar detalhes e ações →</span>
      </div>
    </div>
  );
}
