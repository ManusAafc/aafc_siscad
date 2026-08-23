import apiClient from '../api/client';
import { IGender } from '../models';

export const genderService = {
  async getAllGenders(): Promise<IGender[]> {
    try {
      const response = await apiClient.get('/genders?select=*&order=id.asc');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar gêneros:', error);
      return [];
    }
  },
};