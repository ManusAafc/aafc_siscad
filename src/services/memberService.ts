import { membersApi } from '../api/members';
import { IMember, IUserMembersFilters } from '../models';

export const memberService = {
  async searchMembers(
    searchTerm: string,
    page: number = 1,
    limit: number = 20,
    filters?: IUserMembersFilters
  ): Promise<{ data: IMember[]; total: number }> {
    try {
      if (filters && hasActiveFilters(filters)) {
        const filterParams = {
          searchTerms: searchTerm,
          statusesIdsList: filters.memberStatusesIds,
          planIdsList: filters.plansIds,
          regionsIdsList: filters.regionsIds,
          statesIdsList: filters.statesIds,
          citiesIdsList: filters.citiesIds,
          gendersIdsList: filters.gendersIds,
          statusesReasonsIdList: filters.statusesReasonsIds,
          recordsByPage: limit,
          pageCurrentId: (page - 1) * limit,
        };

        const [data, total] = await Promise.all([
          membersApi.searchWithFilters(filterParams),
          membersApi.searchWithFiltersTotal(filterParams),
        ]);

        return { data: data || [], total: total || 0 };
      }

      const data = await membersApi.search(searchTerm, limit, (page - 1) * limit);
      return { data: data || [], total: data?.length || 0 };
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      return { data: [], total: 0 };
    }
  },

  async searchAllMembers(
    searchTerm: string,
    filters?: IUserMembersFilters
  ): Promise<IMember[]> {
    try {
      const pageSize = 1000;
      const allMembers: IMember[] = [];
      let page = 1;

      while (true) {
        const result = await this.searchMembers(searchTerm, page, pageSize, filters);
        allMembers.push(...result.data);

        if (result.data.length < pageSize) {
          break;
        }

        page += 1;
      }

      return allMembers;
    } catch (error) {
      console.error('Erro ao buscar todos os membros:', error);
      return [];
    }
  },

  async getMemberById(id: string): Promise<IMember | null> {
    try {
      const data = await membersApi.getById(parseInt(id, 10));
      return data || null;
    } catch (error) {
      console.error('Erro ao buscar membro:', error);
      return null;
    }
  },

  async getMembersByCpf(cpf: string): Promise<IMember[]> {
    try {
      const data = await membersApi.getByCpf(cpf);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar membro por CPF:', error);
      return [];
    }
  },

  async createMember(member: Partial<IMember>): Promise<IMember | null> {
    try {
      const data = await membersApi.create(member);
      return data;
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      return null;
    }
  },

  async updateMember(id: string, member: Partial<IMember>): Promise<IMember | null> {
    try {
      const data = await membersApi.update(parseInt(id, 10), member);
      return data;
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      return null;
    }
  },

  async deleteMember(id: string): Promise<boolean> {
    try {
      await membersApi.delete(parseInt(id, 10));
      return true;
    } catch (error) {
      console.error('Erro ao deletar membro:', error);
      return false;
    }
  },

  async getMembersByStatusAndRegion(statusId: number, regionId: number): Promise<IMember[]> {
    try {
      const data = await membersApi.getByStatusIdAndRegionId(statusId, regionId);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar membros por status e região:', error);
      return [];
    }
  },

  async getMembersByStatusAndCity(statusId: number, cityId: number): Promise<IMember[]> {
    try {
      const data = await membersApi.getByStatusIdAndCityId(statusId, cityId);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar membros por status e cidade:', error);
      return [];
    }
  },

  async getAllMembers(): Promise<IMember[]> {
    try {
      const data = await membersApi.getAll();
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar todos os membros:', error);
      return [];
    }
  },
};

function hasActiveFilters(filters: IUserMembersFilters): boolean {
  return (
    (filters.memberStatusesIds?.length || 0) > 0 ||
    (filters.plansIds?.length || 0) > 0 ||
    (filters.regionsIds?.length || 0) > 0 ||
    (filters.statesIds?.length || 0) > 0 ||
    (filters.citiesIds?.length || 0) > 0 ||
    (filters.gendersIds?.length || 0) > 0 ||
    (filters.statusesReasonsIds?.length || 0) > 0
  );
}
