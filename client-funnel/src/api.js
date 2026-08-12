// Base API fetch wrapper with session credential handling
const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  // Set credentials parameter to include to pass session cookies
  options.credentials = 'include';
  
  if (options.body && typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json'
    };
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMsg = 'An API error occurred';
    try {
      const data = await response.json();
      errorMsg = data.error || errorMsg;
    } catch (e) {
      // Response was not JSON
    }
    throw new Error(errorMsg);
  }

  try {
    return await response.json();
  } catch (e) {
    return null; // Empty or text response
  }
}

export const api = {
  // Auth API
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me', { method: 'GET' }),

  // Businesses API
  getBusinesses: () => request('/businesses', { method: 'GET' }),
  getPublicBusiness: (id) => request(`/businesses/public/${id}`, { method: 'GET' }),
  createBusiness: (bizData) => request('/businesses', { method: 'POST', body: bizData }),
  updateBusiness: (id, bizData) => request(`/businesses/${id}`, { method: 'PUT', body: bizData }),
  deleteBusiness: (id) => request(`/businesses/${id}`, { method: 'DELETE' }),
  incrementScan: (id) => request(`/businesses/public/${id}/scan`, { method: 'POST' }),

  // Feedbacks API
  getFeedbacks: () => request('/feedbacks', { method: 'GET' }),
  getConversions: () => request('/feedbacks/conversions', { method: 'GET' }),
  submitFeedback: (feedbackData) => request('/feedbacks/submit', { method: 'POST', body: feedbackData }),
  submitConversion: (conversionData) => request('/feedbacks/convert', { method: 'POST', body: conversionData })
};
