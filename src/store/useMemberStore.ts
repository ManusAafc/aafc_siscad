import { create } from 'zustand';
import { IMember, IUserMembersFilters, EMPTY_FILTERS } from '../models';
import { memberService } from '../services/memberService';

interface MemberState {
  searchResults: IMember[];
  searchTotal: number;
  memberSelected: IMember | null;
  isLoading: boolean;
  filters: IUserMembersFilters;
  searchTerm: string;
  currentPage: number;
  hasMore: boolean;

  searchMembers: (searchTerm: string, page?: number, filters?: IUserMembersFilters) => Promise<void>;
  loadMoreMembers: (searchTerm: string) => Promise<void>;
  getMemberById: (id: string) => Promise<IMember | null>;
  createMember: (member: Partial<IMember>) => Promise<IMember | null>;
  updateMember: (id: string, member: Partial<IMember>) => Promise<IMember | null>;
  deleteMember: (id: string) => Promise<boolean>;
  setFilters: (filters: IUserMembersFilters) => void;
  clearFilters: () => void;
  clearSearch: () => void;
  setSelectedMember: (member: IMember | null) => void;
}

export const useMemberStore = create<MemberState>((set, get) => ({
  searchResults: [],
  searchTotal: 0,
  memberSelected: null,
  isLoading: false,
  filters: EMPTY_FILTERS,
  searchTerm: '',
  currentPage: 1,
  hasMore: true,

  searchMembers: async (searchTerm, page = 1, filters) => {
    set({ isLoading: true });
    try {
      const activeFilters = filters || get().filters;
      const result = await memberService.searchMembers(searchTerm, page, 20, activeFilters);
      set({
        searchResults: result.data,
        searchTotal: result.total,
        searchTerm: searchTerm,
        currentPage: page,
        hasMore: result.data.length >= 20,
        filters: activeFilters,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  loadMoreMembers: async (searchTerm) => {
    const { currentPage, searchResults, filters } = get();
    const nextPage = currentPage + 1;

    try {
      const result = await memberService.searchMembers(searchTerm, nextPage, 20, filters);
      set({
        searchResults: [...searchResults, ...result.data],
        searchTotal: result.total,
        currentPage: nextPage,
        hasMore: result.data.length >= 20,
      });
    } catch (error) {
      console.error('Erro ao carregar mais membros:', error);
    }
  },

  getMemberById: async (id) => {
    set({ isLoading: true });
    try {
      const member = await memberService.getMemberById(id);
      set({ memberSelected: member, isLoading: false });
      return member;
    } catch (error) {
      set({ isLoading: false });
      return null;
    }
  },

  createMember: async (member) => {
    set({ isLoading: true });
    try {
      const newMember = await memberService.createMember(member);
      set({ isLoading: false });
      return newMember;
    } catch (error) {
      set({ isLoading: false });
      return null;
    }
  },

  updateMember: async (id, member) => {
    set({ isLoading: true });
    try {
      const updatedMember = await memberService.updateMember(id, member);
      set({ isLoading: false });
      return updatedMember;
    } catch (error) {
      set({ isLoading: false });
      return null;
    }
  },

  deleteMember: async (id) => {
    set({ isLoading: true });
    try {
      const success = await memberService.deleteMember(id);
      if (success) {
        set((state) => ({
          searchResults: state.searchResults.filter((m) => m.id !== parseInt(id, 10)),
          isLoading: false,
        }));
      }
      return success;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },

  setFilters: (filters) => set({ filters }),

  clearFilters: () => set({ filters: EMPTY_FILTERS }),

  clearSearch: () =>
    set({
      searchResults: [],
      searchTotal: 0,
      searchTerm: '',
      currentPage: 1,
      hasMore: true,
      filters: EMPTY_FILTERS,
    }),

  setSelectedMember: (member) => set({ memberSelected: member }),
}));
