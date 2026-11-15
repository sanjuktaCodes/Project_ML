const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    throw new Error(`Cannot reach the Flask backend at ${API_URL}. Start it with: python backend/app.py`);
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    throw new Error(data?.error || data?.message ||
      `Backend returned HTTP ${response.status}. Check the Flask terminal for details.`);
  }
  if (!data) throw new Error('Backend did not return JSON. Check the Flask terminal.');
  return data;
}

export const checkHealth = () => request('/health');
export const getMetrics = () => request('/api/metrics');
export const predictPatient = (patient) => request('/api/predict', {
  method: 'POST', body: JSON.stringify(patient),
});
export const explainPatient = (patient) => request('/api/explain', {
  method: 'POST', body: JSON.stringify(patient),
});
