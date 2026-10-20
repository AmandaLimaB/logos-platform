import React, { useState } from 'react';
import { X, AlertTriangle } from './Icons';
import { CATEGORIES, CRITICALITIES } from '../constants/incidentConfig';

export function NewIncidentModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    criticality: 'ALTA',
    location: '',
    description: '',
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Por favor, informe o título do incidente.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Por favor, informe a rodovia / localização.');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 5) {
      setError('A descrição precisa conter pelo menos 5 caracteres.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Novo Incidente de Missão Crítica</h2>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.65rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título do Incidente *</label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="Ex: Carreta tombada bloqueando pista dupla"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="criticality">Criticidade *</label>
              <select
                id="criticality"
                name="criticality"
                className="form-select"
                value={formData.criticality}
                onChange={handleChange}
              >
                <option value="ALTA">🚨 ALTA (Prioridade Máxima)</option>
                <option value="MEDIA">⚠️ Média</option>
                <option value="BAIXA">ℹ️ Baixa</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Categoria do Incidente *</label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Rodovia / KM / Localização *</label>
            <input
              id="location"
              name="location"
              type="text"
              className="form-input"
              placeholder="Ex: BR-101, Km 180 - Feira de Santana/BA"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição Operacional *</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Detalhes sobre a situação, veículos envolvidos, condições de tráfego e recursos acionados..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Publicar Incidente na Rede'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
