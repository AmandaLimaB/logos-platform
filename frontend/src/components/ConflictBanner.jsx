import React from 'react';
import { AlertTriangle, X } from './Icons';

export function ConflictBanner({ conflictInfo, onDismiss }) {
  if (!conflictInfo) return null;

  return (
    <div className="conflict-banner">
      <div className="conflict-content">
        <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Bloqueio Otimista: Conflito de Concorrência Detectado (HTTP 409)</strong>
          <p>
            {conflictInfo.message || 
              'Outro analista modificou este incidente simultaneamente. Para preservar a integridade dos dados, sua alteração anterior foi rejeitada e a listagem foi atualizada com o estado mais recente.'}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="btn-close-modal"
        onClick={onDismiss}
        style={{ color: '#fca5a5' }}
        title="Fechar aviso"
      >
        <X size={18} />
      </button>
    </div>
  );
}
