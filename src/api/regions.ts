import apiClient from './client';
import { IRegion } from '../models';

export const regionsApi = {
  async getAll(limit?: number, offset?: number) {
    let url = '/v_regions?select=*';
    if (limit !== undefined) url += `&limit=${limit}`;
    if (offset !== undefined) url += `&offset=${offset}`;

    const response = await apiClient.get<IRegion[]>(url);
    return response.data;
  },
};
