const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchIncidents(filters = {}) {
  const params = new URLSearchParams();
  if (filters.criticality && filters.criticality !== 'TODAS') {
    params.append('criticality', filters.criticality);
  }
  if (filters.category && filters.category !== 'TODAS') {
    params.append('category', filters.category);
  }
  if (filters.status && filters.status !== 'TODAS') {
    params.append('status', filters.status);
  }
  if (filters.search && filters.search.trim()) {
    params.append('search', filters.search.trim());
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/v1/incidents${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erro ao buscar incidentes: ${response.statusText}`);
  }
  return response.json();
}

export async function createIncident(incidentData) {
  const response = await fetch(`${API_BASE_URL}/api/v1/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(incidentData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Falha ao cadastrar o incidente.');
  }

  return response.json();
}

export async function updateIncidentStatus(incidentId, { status, expected_version }) {
  const response = await fetch(`${API_BASE_URL}/api/v1/incidents/${incidentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status,
      expected_version,
    }),
  });

  if (response.status === 409) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.detail || 'Conflito de concorrência detectado.');
    error.status = 409;
    throw error;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Falha ao atualizar status do incidente.');
  }

  return response.json();
}

export async function resetSeedData() {
  const response = await fetch(`${API_BASE_URL}/api/v1/seed/reset`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Falha ao restaurar dados de teste.');
  }

  return response.json();
}
