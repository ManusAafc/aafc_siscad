import apiClient from '../api/client';
import { memberService } from './memberService';
import { meetingService } from './meetingService';
import { IMemberStatus } from '../models/member';

export interface MemberStats {
  byStatus: IMemberStatus[];
  byPlan: any[];
  byRegion: any[];
  totalCount: number;
}

export interface MeetingStats {
  statuses: IMemberStatus[];
  totalCount: number;
}

export const dashboardService = {
  async getMemberStatsByStatus(): Promise<IMemberStatus[]> {
    try {
      const response = await apiClient.get('/v_members_statuses?select=*');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar stats por status:', error);
      return [];
    }
  },

  async getMemberStatsByPlan(): Promise<any[]> {
    try {
      const response = await apiClient.get('/v_plans?select=*');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar stats por plano:', error);
      return [];
    }
  },

  async getMemberStatsByRegion(): Promise<any[]> {
    try {
      const response = await apiClient.get('/v_regions?select=*');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar stats por região:', error);
      return [];
    }
  },

  async getMemberTotalCount(): Promise<number> {
    try {
      const members = await memberService.getAllMembers();
      return members.length;
    } catch (error) {
      console.error('Erro ao contar membros:', error);
      return 0;
    }
  },

  async getMeetingTotalCount(): Promise<number> {
    try {
      const { data } = await meetingService.getMeetings(10000, 0);
      return data.length;
    } catch (error) {
      console.error('Erro ao contar reuniões:', error);
      return 0;
    }
  },

  async loadDashboardData(): Promise<{
    memberStats: MemberStats;
    meetingStats: MeetingStats;
  }> {
    try {
      const [byStatus, byPlan, byRegion, memberTotal, meetingTotal] =
        await Promise.all([
          this.getMemberStatsByStatus(),
          this.getMemberStatsByPlan(),
          this.getMemberStatsByRegion(),
          this.getMemberTotalCount(),
          this.getMeetingTotalCount(),
        ]);

      return {
        memberStats: {
          byStatus,
          byPlan,
          byRegion,
          totalCount: memberTotal,
        },
        meetingStats: {
          statuses: byStatus,
          totalCount: meetingTotal,
        },
      };
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      return {
        memberStats: {
          byStatus: [],
          byPlan: [],
          byRegion: [],
          totalCount: 0,
        },
        meetingStats: {
          statuses: [],
          totalCount: 0,
        },
      };
    }
  },
};
