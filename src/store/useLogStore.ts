import { create } from 'zustand';
import { ILog, ILogFilters, EMPTY_LOG_FILTERS } from '../models/log';
import { logsApi } from '../api/logs';

interface LogState {
  logs: ILog[];
  total: number;
  isLoading: boolean;
  filters: ILogFilters;
  currentPage: number;
  hasMore: boolean;

  fetchLogs: (filters?: ILogFilters, page?: number) => Promise<void>;
  setFilters: (filters: ILogFilters) => void;
  clearFilters: () => void;
  loadMore: () => Promise<void>;
}

const PAGE_SIZE = 50;

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  total: 0,
  isLoading: false,
  filters: { ...EMPTY_LOG_FILTERS },
  currentPage: 1,
  hasMore: false,

  fetchLogs: async (filters, page = 1) => {
    const activeFilters = filters || get().filters;
    set({ isLoading: true });
    try {
      const [data, count] = await Promise.all([
        logsApi.getFiltered({
          tableName: activeFilters.tableName || undefined,
          operation: activeFilters.operation || undefined,
          startDate: activeFilters.startDate || undefined,
          endDate: activeFilters.endDate || undefined,
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        }),
        logsApi.count({
          tableName: activeFilters.tableName || undefined,
          operation: activeFilters.operation || undefined,
          startDate: activeFilters.startDate || undefined,
          endDate: activeFilters.endDate || undefined,
        }),
      ]);

      set({
        logs: page === 1 ? data : [...get().logs, ...data],
        total: count,
        currentPage: page,
        hasMore: data.length >= PAGE_SIZE,
        filters: activeFilters,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      set({ isLoading: false });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearFilters: () => set({ filters: { ...EMPTY_LOG_FILTERS } }),

  loadMore: async () => {
    const { currentPage, hasMore, isLoading, filters } = get();
    if (!hasMore || isLoading) return;
    await get().fetchLogs(filters, currentPage + 1);
  },
}));
