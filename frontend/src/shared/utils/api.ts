import axios from 'axios';

const BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor to automatically attach authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || 'test-token-123';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function apiFetch(path: string, options: RequestInit = {}) {
  const method = (options.method || 'GET') as any;
  const data = options.body ? JSON.parse(options.body as string) : undefined;

  try {
    const response = await api({
      url: path,
      method,
      data,
      headers: options.headers as any,
    });
    return response.data;
  } catch (error: any) {
    const errMsg = error.response?.data?.error || error.message || 'API Error';
    throw new Error(errMsg);
  }
}

export default api;

