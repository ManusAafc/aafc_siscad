import { meetingsApi } from '../api/meetings';
import { IMeeting, IMeetingCity, IMeetingPlan } from '../models';

export const meetingService = {
  async getMeetings(limit = 20, offset = 0): Promise<{ data: IMeeting[]; total: number }> {
    try {
      const data = await meetingsApi.getAll(limit, offset);
      return { data: data || [], total: data?.length || 0 };
    } catch (error) {
      console.error('Erro ao buscar reuniões:', error);
      return { data: [], total: 0 };
    }
  },

  async getMeetingById(id: string): Promise<IMeeting | null> {
    try {
      const data = await meetingsApi.getById(parseInt(id, 10));
      return data || null;
    } catch (error) {
      console.error('Erro ao buscar reunião:', error);
      return null;
    }
  },

  async searchMeetings(
    searchTerm: string,
    limit = 20,
    offset = 0
  ): Promise<{ data: IMeeting[]; total: number }> {
    try {
      const data = await meetingsApi.search(searchTerm, limit, offset);
      return { data: data || [], total: data?.length || 0 };
    } catch (error) {
      console.error('Erro ao buscar reuniões:', error);
      return { data: [], total: 0 };
    }
  },

  async createMeeting(meeting: Partial<IMeeting>): Promise<IMeeting | null> {
    try {
      const data = await meetingsApi.create(meeting);
      return data;
    } catch (error) {
      console.error('Erro ao criar reunião:', error);
      return null;
    }
  },

  async updateMeeting(id: string, meeting: Partial<IMeeting>): Promise<IMeeting | null> {
    try {
      const data = await meetingsApi.update(parseInt(id, 10), meeting);
      return data;
    } catch (error) {
      console.error('Erro ao atualizar reunião:', error);
      return null;
    }
  },

  async deleteMeeting(id: string): Promise<boolean> {
    try {
      await meetingsApi.delete(parseInt(id, 10));
      return true;
    } catch (error) {
      console.error('Erro ao deletar reunião:', error);
      return false;
    }
  },

  async getMeetingCities(meetingId: string): Promise<IMeetingCity[]> {
    try {
      const data = await meetingsApi.getCitiesByMeetingId(parseInt(meetingId, 10));
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar cidades da reunião:', error);
      return [];
    }
  },

  async getMeetingPlans(meetingId: string): Promise<IMeetingPlan[]> {
    try {
      const data = await meetingsApi.getPlansByMeetingId(parseInt(meetingId, 10));
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar planos da reunião:', error);
      return [];
    }
  },
};
