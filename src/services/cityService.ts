import apiClient from '../api/client';
import { ICity } from '../models';

export const cityService = {
  async getCitiesByRegion(regionId: number): Promise<ICity[]> {
    try {
      const response = await apiClient.get(
        `/v_cities?select=*&region_id=eq.${regionId}&order=city_description.asc`
      );
      return (response.data || []).map((item: any) => ({
        id: item.cityId,
        regionId: item.regionId,
        regionCode: item.regionCode || '',
        regionDescription: item.regionDescription || '',
        cityId: item.cityId,
        cityDescription: item.cityDescription || '',
        name: item.cityDescription || '',
        stateCode: item.stateCode || '',
        stateDescription: item.stateDescription || '',
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
        id: item.cityId,
        regionId: item.regionId,
        regionCode: item.regionCode || '',
        regionDescription: item.regionDescription || '',
        cityId: item.cityId,
        cityDescription: item.cityDescription || '',
        name: item.cityDescription || '',
        stateCode: item.stateCode || '',
        stateDescription: item.stateDescription || '',
      }));
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      return [];
    }
  },
};
