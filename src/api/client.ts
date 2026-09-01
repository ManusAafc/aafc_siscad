import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { supabase } from '../config/supabase';
import { ENV } from '../config/environment';

function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj === null || typeof obj !== 'object') return obj;
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = snakeToCamel(value);
  }
  return result;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: `${ENV.SUPABASE_URL}/rest/v1`,
  headers: {
    'Content-Type': 'application/json',
    apikey: ENV.SUPABASE_ANON_KEY,
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data && typeof response.data === 'object') {
      response.data = snakeToCamel(response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      supabase.auth.signOut();
    }
    if (error.response?.status && error.response.status >= 400) {
      console.error('[API Error]', error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
