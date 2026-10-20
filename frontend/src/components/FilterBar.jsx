import React from 'react';
import { Search, Filter, X } from './Icons';
import { CATEGORIES, CRITICALITIES, STATUSES } from '../constants/incidentConfig';

export function FilterBar({ filters, setFilters }) {
  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleCriticalityClick = (crit) => {
    setFilters(prev => ({
      ...prev,
      criticality: prev.criticality === crit ? 'TODAS' : crit
    }));
  };

  const handleCategoryChange = (e) => {
    setFilters(prev => ({ ...prev, category: e.target.value }));
  };

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };

  const hasActiveFilters = 
    filters.search || 
    (filters.criticality && filters.criticality !== 'TODAS') || 
    (filters.category && filters.category !== 'TODAS') || 
    (filters.status && filters.status !== 'TODAS');

  const clearFilters = () => {
    setFilters({
      search: '',
      criticality: 'TODAS',
      category: 'TODAS',
      status: 'TODAS'
    });
  };

  return (
    <div className="filter-bar">
      <div className="filter-top-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por rodovia, KM, placa, carga ou descrição..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        <select
          className="filter-select"
          value={filters.category}
          onChange={handleCategoryChange}
        >
          <option value="TODAS">Todas as Categorias</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.status}
          onChange={handleStatusChange}
        >
          <option value="TODAS">Todos os Status</option>
          {Object.values(STATUSES).map(st => (
            <option key={st.value} value={st.value}>{st.label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button 
            type="button" 
            className="chip-btn" 
            onClick={clearFilters}
            title="Limpar todos os filtros"
          >
            <X size={14} />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      <div className="filter-chips-row">
        <span className="filter-label">
          <Filter size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Gestão por Exceção:
        </span>

        <button
          type="button"
          className={`chip-btn ${filters.criticality === 'TODAS' ? 'active' : ''}`}
          onClick={() => handleCriticalityClick('TODAS')}
        >
          Todas
        </button>

        <button
          type="button"
          className={`chip-btn ${filters.criticality === 'ALTA' ? 'active-critical' : ''}`}
          onClick={() => handleCriticalityClick('ALTA')}
        >
          <span className="pulse-bullet"></span>
          🚨 ALTA (Prioridade Máxima)
        </button>

        <button
          type="button"
          className={`chip-btn ${filters.criticality === 'MEDIA' ? 'active-warning' : ''}`}
          onClick={() => handleCriticalityClick('MEDIA')}
        >
          ⚠️ Média
        </button>

        <button
          type="button"
          className={`chip-btn ${filters.criticality === 'BAIXA' ? 'active-info' : ''}`}
          onClick={() => handleCriticalityClick('BAIXA')}
        >
          ℹ️ Baixa
        </button>
      </div>
    </div>
  );
}
