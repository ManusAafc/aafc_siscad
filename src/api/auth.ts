import apiClient from './client';

export const authApi = {
  async signUpEmail(email: string, password: string) {
    const response = await apiClient.post('/auth/v1/signup', {
      email,
      password,
    });
    return response.data;
  },
};
