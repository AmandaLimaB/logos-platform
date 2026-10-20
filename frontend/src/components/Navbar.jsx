import React from 'react';
import { Shield, Plus, RefreshCw, RotateCcw } from './Icons';

export function Navbar({ onNewIncident, onRefresh, onResetSeed, isRefreshing }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand-section">
          <div className="logo-badge">
            <Shield size={20} />
            <span>LOGOS</span>
          </div>
          <div className="brand-title">
            <h1>Central de Resposta a Incidentes</h1>
            <p>AutoU Logistics • Centro de Operações e Gestão de Frota</p>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          <span>Rede Operacional Conectada</span>
        </div>

        <div className="header-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onResetSeed} 
            title="Restaura os incidentes iniciais de exemplo"
          >
            <RotateCcw size={15} />
            <span>Restaurar Mock</span>
          </button>

          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onRefresh} 
            title="Atualiza a lista imediatamente"
          >
            <RefreshCw size={15} className={isRefreshing ? "spin" : ""} />
            <span>Atualizar</span>
          </button>

          <button 
            type="button" 
            className="btn-primary" 
            onClick={onNewIncident}
          >
            <Plus size={16} />
            <span>Novo Incidente</span>
          </button>
        </div>
      </div>
    </header>
  );
}
