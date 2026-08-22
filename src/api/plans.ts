import apiClient from './client';
import { IPlan } from '../models';

export const plansApi = {
  async getAll(limit?: number, offset?: number) {
    let url = '/v_plans?select=*';
    if (limit !== undefined) url += `&limit=${limit}`;
    if (offset !== undefined) url += `&offset=${offset}`;

    const response = await apiClient.get<IPlan[]>(url);
    return response.data;
  },

  async getById(planId: number) {
    const response = await apiClient.get<IPlan[]>(
      `/v_plans?id=eq.${planId}&select=*`
    );
    return response.data?.[0];
  },
};
