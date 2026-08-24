import apiClient from '../api/client';
import { memberService } from './memberService';
import { meetingService } from './meetingService';
import { IMemberStatus } from '../models/member';

export interface MemberStats {
  byStatus: IMemberStatus[];
  byPlan: any[];
  byRegion: any[];
  totalCount: number;
  timeline: TimelineEntry[];
}

export interface TimelineEntry {
  month: string;
  entradas: number;
  saidas: number;
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
      const response = await apiClient.get('/v_members?status_id=eq.2&is_deleted=eq.false&select=plan_id');
      const members = response.data || [];
      const planCounts: Record<number, number> = {};
      members.forEach((m: any) => {
        const planId = m.planId;
        if (planId) {
          planCounts[planId] = (planCounts[planId] || 0) + 1;
        }
      });
      const plansResponse = await apiClient.get('/v_plans?select=*');
      const plans = plansResponse.data || [];
      return plans.map((p: any) => ({
        ...p,
        count: planCounts[p.id] || 0,
      }));
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
      const response = await apiClient.get('/v_members?status_id=eq.2&is_deleted=eq.false&select=id');
      return response.data?.length || 0;
    } catch (error) {
      console.error('Ao contar membros:', error);
      return 0;
    }
  },

  async getMemberTimeline(): Promise<TimelineEntry[]> {
    try {
      const now = new Date();
      const months: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }

      const [activeRes, inactiveRes] = await Promise.all([
        apiClient.get('/v_members?status_id=eq.2&is_deleted=eq.false&select=date_aafc_start'),
        apiClient.get('/v_members?status_id=eq.1&is_deleted=eq.false&select=date_aafc_end'),
      ]);

      const entradasPorMes: Record<string, number> = {};
      const saidasPorMes: Record<string, number> = {};

      (activeRes.data || []).forEach((m: any) => {
        const dateStr = m.dateAafcStart || '';
        if (dateStr) {
          const ym = dateStr.split('T')[0].substring(0, 7);
          entradasPorMes[ym] = (entradasPorMes[ym] || 0) + 1;
        }
      });

      (inactiveRes.data || []).forEach((m: any) => {
        const dateStr = m.dateAafcEnd || '';
        if (dateStr) {
          const ym = dateStr.split('T')[0].substring(0, 7);
          saidasPorMes[ym] = (saidasPorMes[ym] || 0) + 1;
        }
      });

      return months.map((ym) => ({
        month: ym,
        entradas: entradasPorMes[ym] || 0,
        saidas: saidasPorMes[ym] || 0,
      }));
    } catch (error) {
      console.error('Erro ao buscar timeline:', error);
      return [];
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
      const [byStatus, byPlan, byRegion, memberTotal, meetingTotal, timeline] =
        await Promise.all([
          this.getMemberStatsByStatus(),
          this.getMemberStatsByPlan(),
          this.getMemberStatsByRegion(),
          this.getMemberTotalCount(),
          this.getMeetingTotalCount(),
          this.getMemberTimeline(),
        ]);

      return {
        memberStats: {
          byStatus,
          byPlan,
          byRegion,
          totalCount: memberTotal,
          timeline,
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
          timeline: [],
        },
        meetingStats: {
          statuses: [],
          totalCount: 0,
        },
      };
    }
  },
};
