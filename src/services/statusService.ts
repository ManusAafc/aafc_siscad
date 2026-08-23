import apiClient from '../api/client';
import { IMemberStatus } from '../models';

export const statusService = {
  async getAllStatuses(): Promise<IMemberStatus[]> {
    // Tenta varias possiveis tabelas/views
    const possibleTables = ['statuses', 'member_status', 'member_statuses', 'v_member_statuses'];
    
    for (const table of possibleTables) {
      try {
        const response = await apiClient.get(`/${table}?select=*&order=id.asc`);
        if (response.data && response.data.length > 0) {
          console.log(`Status carregado de: ${table}`);
          return response.data;
        }
      } catch (e) {
        // continua tentando
      }
    }
    
    // Fallback: status hardcoded do sistema
    console.log('Usando status hardcoded como fallback');
    return [
      { id: 1, code: 'ATIVO', description: 'Ativo' },
      { id: 2, code: 'INATIVO', description: 'Inativo' },
      { id: 3, code: 'SUSPENSO', description: 'Suspenso' },
    ];
  },
};