import apiClient from '../api/client';
import { ICity } from '../models';

export const cityService = {
  async getCitiesByRegion(regionId: number): Promise<ICity[]> {
    try {
      const response = await apiClient.get(
        `/v_cities?select=*&region_id=eq.${regionId}&order=city_description.asc`
      );
      return (response.data || []).map((item: any) => ({
        id: item.city_id,
        regionId: item.region_id,
        regionCode: item.region_code || '',
        regionDescription: item.region_description || '',
        cityId: item.city_id,
        cityDescription: item.city_description || '',
        name: item.city_description || '',
        stateCode: item.state_code || '',
        stateDescription: item.state_description || '',
      }));
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      return [];
    }
  },

  async getAllCities(): Promise<ICity[]> {
    try {
      const response = await apiClient.get('/v_cities?select=*&order=city_description.asc');
      return (response.data || []).map((item: any) => ({
        id: item.city_id,
        regionId: item.region_id,
        regionCode: item.region_code || '',
        regionDescription: item.region_description || '',
        cityId: item.city_id,
        cityDescription: item.city_description || '',
        name: item.city_description || '',
        stateCode: item.state_code || '',
        stateDescription: item.state_description || '',
      }));
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      return [];
    }
  },
};
