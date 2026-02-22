const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data.data;
}

export const metroApi = {
  async getStations() {
    const response = await fetch(`${API_BASE}/stations`);
    return handleResponse(response);
  },

  async getStation(id) {
    const response = await fetch(`${API_BASE}/stations/${id}`);
    return handleResponse(response);
  },

  async searchRoute(from, to) {
    const response = await fetch(`${API_BASE}/routes?from=${from}&to=${to}`);
    return handleResponse(response);
  },

  async createBooking(source, destination, route) {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source, destination, route }),
    });
    return handleResponse(response);
  },

  async getBooking(reference) {
    const response = await fetch(`${API_BASE}/bookings/${reference}`);
    return handleResponse(response);
  },

  async getNetwork() {
    const response = await fetch(`${API_BASE}/network`);
    return handleResponse(response);
  },

  async healthCheck() {
    const response = await fetch(`${API_BASE}/health`);
    return handleResponse(response);
  },
};

export default metroApi;
