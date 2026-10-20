export const CRITICALITIES = {
  ALTA: {
    label: 'Alta',
    value: 'ALTA',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: '#dc2626',
    badgeClass: 'badge-alta',
    borderClass: 'border-alta',
  },
  MEDIA: {
    label: 'Média',
    value: 'MEDIA',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: '#d97706',
    badgeClass: 'badge-media',
    borderClass: 'border-media',
  },
  BAIXA: {
    label: 'Baixa',
    value: 'BAIXA',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: '#2563eb',
    badgeClass: 'badge-baixa',
    borderClass: 'border-baixa',
  },
};

export const CATEGORIES = [
  'Acidente com Veículo',
  'Acidente com Vítimas',
  'Acidente com Animal',
  'Derramamento de Carga',
  'Condição Climática Atípica',
  'Problema Mecânico',
  'Bloqueio de Pista',
];

export const STATUSES = {
  ABERTO: {
    label: 'Aberto',
    value: 'Aberto',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    badgeClass: 'status-aberto',
  },
  EM_INVESTIGACAO: {
    label: 'Em Investigação',
    value: 'Em Investigação',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    badgeClass: 'status-investigacao',
  },
  INCONCLUSIVO: {
    label: 'Inconclusivo',
    value: 'Inconclusivo',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    badgeClass: 'status-inconclusivo',
  },
  FECHADO: {
    label: 'Fechado',
    value: 'Fechado',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    badgeClass: 'status-fechado',
  },
};
