import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401/419 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 419) {
      // CSRF token mismatch, get a new one
      await api.get('/sanctum/csrf-cookie');
      // Retry the original request
      return api(error.config);
    }
    if (error.response?.status === 401) {
      // Unauthorized, clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const labsAPI = {
  async create(formData: FormData) {
    try {
      // First get CSRF token
      await api.get('/sanctum/csrf-cookie');
      
      // Then create the lab
      const response = await api.post('/api/labs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating lab:', error);
      throw error;
    }
  },
  
  async getAll() {
    const response = await api.get('/api/labs');
    return response.data;
  }
};

export default api;
