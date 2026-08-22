import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { supabase } from '../config/supabase';
import { ENV } from '../config/environment';

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
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      supabase.auth.signOut();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
