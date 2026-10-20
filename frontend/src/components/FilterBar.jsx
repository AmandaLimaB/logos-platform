import React from 'react';
import { Search, X } from './Icons';
import { CATEGORIES, STATUSES } from '../constants/incidentConfig';

export function FilterBar({ filters, setFilters }) {
  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleCriticalityChange = (e) => {
    setFilters(prev => ({ ...prev, criticality: e.target.value }));
  };

  const handleCategoryChange = (e) => {
    setFilters(prev => ({ ...prev, category: e.target.value }));
  };

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };

  const hasActiveFilters = 
    Boolean(filters.search) || 
    (filters.criticality && filters.criticality !== 'TODAS') || 
    (filters.category && filters.category !== 'TODAS') || 
    (filters.status && filters.status !== 'TODAS');

  const clearFilters = () => {
    setFilters({
      search: '',
      criticality: 'TODAS',
      category: 'TODAS',
      status: 'TODAS',
    });
  };

  return (
    <div className="filter-bar">
      <div className="filter-top-row">
        {/* Campo de Busca Textual */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por rodovia, KM, placa ou ocorrência..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Dropdown de Criticidade / Prioridade */}
        <select
          className={`filter-select ${filters.criticality === 'ALTA' ? 'select-active-critical' : ''}`}
          value={filters.criticality}
          onChange={handleCriticalityChange}
        >
          <option value="TODAS">Todas as Criticidades</option>
          <option value="ALTA">🚨 ALTA (Prioridade Máxima)</option>
          <option value="MEDIA">⚠️ Média</option>
          <option value="BAIXA">ℹ️ Baixa</option>
        </select>

        {/* Dropdown de Categoria */}
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

        {/* Dropdown de Status */}
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

        {/* Botão de Limpar Filtros Ativos */}
        {hasActiveFilters && (
          <button 
            type="button" 
            className="chip-btn" 
            onClick={clearFilters}
            title="Limpar todos os filtros"
          >
            <X size={14} />
            <span>Limpar</span>
          </button>
        )}
      </div>
    </div>
  );
}
