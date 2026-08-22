import apiClient from '../api/client';
import { IRegion } from '../models';

export const regionService = {
  async getAllRegions(): Promise<IRegion[]> {
    try {
      const response = await apiClient.get('/regions?select=*&order=description.asc');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar regiões:', error);
      return [];
    }
  },

  async getRegionById(id: number): Promise<IRegion | null> {
    try {
      const response = await apiClient.get(`/regions?id=eq.${id}&select=*`);
      return response.data?.[0] || null;
    } catch (error) {
      console.error('Erro ao buscar região:', error);
      return null;
    }
  },
};
