import apiClient from './client';
import { IMeeting, IMeetingMember, IMeetingCity, IMeetingPlan, IMeetingMemberStatus } from '../models';

export const meetingsApi = {
  async getAll(limit = 10000, offset = 0) {
    const response = await apiClient.get<IMeeting[]>(
      `/v_meetings?select=*&limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  async getById(meetingId: number) {
    const response = await apiClient.get<IMeeting[]>(
      `/v_meetings?id=eq.${meetingId}&select=*`
    );
    return response.data?.[0];
  },

  async search(searchTerms = '', recordsByPage = 10, pageCurrentId = 0) {
    const response = await apiClient.post('/rpc/fc_meetings_search', {
      search_terms: searchTerms,
      records_by_page: recordsByPage,
      page_current_id: pageCurrentId,
    });
    return response.data;
  },

  async create(meeting: Partial<IMeeting>) {
    const response = await apiClient.post('/meetings', meeting);
    return response.data;
  },

  async update(id: number, meeting: Partial<IMeeting>) {
    const response = await apiClient.patch(`/meetings?id=eq.${id}`, meeting);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(`/meetings?id=eq.${id}`);
    return response.data;
  },

  async getCitiesByMeetingId(meetingId: number) {
    const response = await apiClient.get<IMeetingCity[]>(
      `/v_meetings_cities?meeting_id=eq.${meetingId}&select=*`
    );
    return response.data;
  },

  async getPlansByMeetingId(meetingId: number) {
    const response = await apiClient.get<IMeetingPlan[]>(
      `/v_meetings_plans?meeting_id=eq.${meetingId}&select=*`
    );
    return response.data;
  },

  async getMembersByMeetingId(meetingId: number, limit = 10000, offset = 0) {
    const response = await apiClient.get<IMeetingMember[]>(
      `/v_meetings_members?meeting_id=eq.${meetingId}&select=*&limit=${limit}&offset=${offset}`
    );
    return response.data;
  },

  async getMemberById(meetingMemberId: number) {
    const response = await apiClient.get<IMeetingMember[]>(
      `/v_meetings_members?id=eq.${meetingMemberId}&select=*`
    );
    return response.data?.[0];
  },

  async getMemberStatusesByMeetingId(meetingId: number) {
    const response = await apiClient.get<IMeetingMemberStatus[]>(
      `/v_meetings_members_statuses?meeting_id=eq.${meetingId}&select=*`
    );
    return response.data;
  },

  async addMember(meetingId: number, memberId: number) {
    const response = await apiClient.post('/meetings_members', {
      meeting_id: meetingId,
      member_id: memberId,
    });
    return response.data;
  },

  async updateMember(id: number, data: Partial<IMeetingMember>) {
    const response = await apiClient.patch(`/meetings_members?id=eq.${id}`, data);
    return response.data;
  },

  async removeMember(id: number) {
    const response = await apiClient.delete(`/meetings_members?id=eq.${id}`);
    return response.data;
  },
};
