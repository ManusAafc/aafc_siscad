import apiClient from './client';
import { ICity } from '../models';

export const citiesApi = {
  async getAll(limit?: number, offset?: number) {
    let url = '/v_cities?select=*';
    if (limit !== undefined) url += `&limit=${limit}`;
    if (offset !== undefined) url += `&offset=${offset}`;

    const response = await apiClient.get<ICity[]>(url);
    return response.data;
  },

  async getByRegionId(regionId: number) {
    const response = await apiClient.get<ICity[]>(
      `/v_cities?region_id=eq.${regionId}&select=*`
    );
    return response.data;
  },
};
