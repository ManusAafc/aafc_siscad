import apiClient from './client';
import { ILog } from '../models';

export const logsApi = {
  async getFiltered(params: {
    tableName?: string;
    operation?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const filters: string[] = [];

    if (params.tableName) {
      filters.push(`table_name=eq.${params.tableName}`);
    }
    if (params.operation) {
      filters.push(`operation=eq.${params.operation}`);
    }
    if (params.startDate) {
      filters.push(`created_date=gte.${params.startDate}T00:00:00`);
    }
    if (params.endDate) {
      filters.push(`created_date=lte.${params.endDate}T23:59:59`);
    }

    const query = filters.length > 0 ? `?${filters.join('&')}` : '';
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    const response = await apiClient.get<ILog[]>(
      `/v_logs${query}&order=created_date.desc&limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  async count(params: {
    tableName?: string;
    operation?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const filters: string[] = [];

    if (params.tableName) {
      filters.push(`table_name=eq.${params.tableName}`);
    }
    if (params.operation) {
      filters.push(`operation=eq.${params.operation}`);
    }
    if (params.startDate) {
      filters.push(`created_date=gte.${params.startDate}T00:00:00`);
    }
    if (params.endDate) {
      filters.push(`created_date=lte.${params.endDate}T23:59:59`);
    }

    const query = filters.length > 0 ? `?${filters.join('&')}` : '';

    const response = await apiClient.get<ILog[]>(
      `/v_logs${query}&select=id`,
      {
        headers: {
          Prefer: 'count=exact',
        },
      }
    );

    const contentRange = response.headers['content-range'];
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/);
      if (match) return parseInt(match[1], 10);
    }

    return response.data?.length || 0;
  },
};
