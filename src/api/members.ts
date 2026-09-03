import apiClient from './client';
import { IMember, IUserMembersFilters } from '../models';

export const membersApi = {
  async getAll(limit = 10000, offset = 0) {
    const response = await apiClient.get<IMember[]>(
      `/v_members?select=*&limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  async getById(memberId: number) {
    const response = await apiClient.get<IMember[]>(
      `/v_members?id=eq.${memberId}&select=*`
    );
    return response.data?.[0];
  },

  async getByCpf(cpf: string) {
    const response = await apiClient.get<IMember[]>(
      `/members?cpf=eq.${cpf}&select=id,cpf`
    );
    return response.data;
  },

  async getByStatusIdAndRegionId(statusId: number, regionId: number) {
    const response = await apiClient.get<IMember[]>(
      `/v_members?status_id=eq.${statusId}&region_id=eq.${regionId}&select=*`
    );
    return response.data;
  },

  async getByStatusIdAndCityId(statusId: number, cityId: number) {
    const response = await apiClient.get<IMember[]>(
      `/v_members?status_id=eq.${statusId}&city_id=eq.${cityId}&select=*`
    );
    return response.data;
  },

  async search(searchTerms = '', recordsByPage = 10, pageCurrentId = 0) {
    const response = await apiClient.post('/rpc/fc_members_search', {
      search_terms: searchTerms,
      records_by_page: recordsByPage,
      page_current_id: pageCurrentId,
    });
    return response.data;
  },

  async searchWithFilters(params: {
    searchTerms?: string;
    statusesIdsList?: number[];
    planIdsList?: number[];
    regionsIdsList?: number[];
    statesIdsList?: number[];
    citiesIdsList?: number[];
    gendersIdsList?: number[];
    statusesReasonsIdsList?: number[];
    recordsByPage?: number;
    pageCurrentId?: number;
  }) {
    const response = await apiClient.post('/rpc/fc_members_search_filters', {
      search_terms: params.searchTerms || '',
      statuses_ids: params.statusesIdsList || [],
      plans_ids: params.planIdsList || [],
      regions_ids: params.regionsIdsList || [],
      states_ids: params.statesIdsList || [],
      cities_ids: params.citiesIdsList || [],
      genders_ids: params.gendersIdsList || [],
      statuses_reasons_ids: params.statusesReasonsIdsList || [],
      records_by_page: params.recordsByPage || 10,
      page_current_id: params.pageCurrentId || 0,
    });
    return response.data;
  },

  async searchWithFiltersTotal(params: {
    searchTerms?: string;
    statusesIdsList?: number[];
    planIdsList?: number[];
    regionsIdsList?: number[];
    statesIdsList?: number[];
    citiesIdsList?: number[];
    gendersIdsList?: number[];
    statusesReasonsIdsList?: number[];
  }) {
    const response = await apiClient.post('/rpc/fc_members_search_filters_count', {
      search_terms: params.searchTerms || '',
      statuses_ids: params.statusesIdsList || [],
      plans_ids: params.planIdsList || [],
      regions_ids: params.regionsIdsList || [],
      states_ids: params.statesIdsList || [],
      cities_ids: params.citiesIdsList || [],
      genders_ids: params.gendersIdsList || [],
      statuses_reasons_ids: params.statusesReasonsIdsList || [],
    });
    return response.data;
  },

  async create(member: Partial<IMember>) {
    const response = await apiClient.post('/members', member);
    return response.data;
  },

  async update(id: number, member: Partial<IMember>) {
    const response = await apiClient.patch(`/members?id=eq.${id}`, member);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/members?id=eq.${id}`);
    return response.data;
  },

  async getBirthdaysByMonth(month: number, statusId = 2, limit = 50) {
    const response = await apiClient.get<IMember[]>(
      `/v_members?status_id=eq.${statusId}&select=id,name,birthday,img_path,img_name,plan_description,region_description&limit=${limit}`
    );
    const members = response.data || [];
    return members.filter((m: any) => {
      if (!m.birthday) return false;
      const bdayMonth = new Date(m.birthday).getMonth() + 1;
      return bdayMonth === month;
    });
  },

  async getGenderCounts(statusId = 2) {
    const response = await apiClient.get<IMember[]>(
      `/v_members?status_id=eq.${statusId}&select=*`
    );
    const members = response.data || [];
    let male = 0;
    let female = 0;
    members.forEach((m: any) => {
      const gender = (m.gender || m.genderCode || m.gender_code || '').toUpperCase();
      const id = m.genderId ?? m.gender_id;
      if (gender === 'M' || gender === 'MASCULINO' || gender.includes('MASC') || id === 1) male++;
      else if (gender === 'F' || gender === 'FEMININO' || gender.includes('FEM') || id === 2) female++;
    });
    return { male, female };
  },
};
