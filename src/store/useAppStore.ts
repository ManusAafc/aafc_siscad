import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IUser, EMPTY_USER } from '../models/user';
import { IPlan } from '../models/plan';
import { IMember } from '../models/member';
import { IMeeting } from '../models/meeting';
import { IRegion } from '../models/region';
import { IMemberStatus } from '../models/member';
import { MemberStats, MeetingStats, dashboardService } from '../services/dashboardService';
import { offlineService } from '../services/offlineService';

interface AppState {
  userCurrent: IUser;
  planSelected: IPlan | null;
  memberSelected: IMember | null;
  meetingSelected: IMeeting | null;

  memberSearchResults: IMember[];
  memberSearchTotal: number;
  meetingSearchResults: IMeeting[];
  meetingSearchTotal: number;

  offlinePlans: IPlan[];
  offlineRegions: IRegion[];
  offlineMembers: IMember[];
  offlineMembersStatuses: IMemberStatus[];

  memberStats: MemberStats | null;
  meetingStats: MeetingStats | null;

  isLoading: boolean;

  setUserCurrent: (user: IUser) => void;
  setPlanSelected: (plan: IPlan | null) => void;
  setMemberSelected: (member: IMember | null) => void;
  setMeetingSelected: (meeting: IMeeting | null) => void;

  setMemberSearchResults: (results: IMember[], total: number) => void;
  appendMemberSearchResults: (results: IMember[], total: number) => void;
  setMeetingSearchResults: (results: IMeeting[], total: number) => void;

  loadDashboardData: () => Promise<void>;
  loadOfflineData: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userCurrent: EMPTY_USER,
      planSelected: null,
      memberSelected: null,
      meetingSelected: null,

      memberSearchResults: [],
      memberSearchTotal: 0,
      meetingSearchResults: [],
      meetingSearchTotal: 0,

      offlinePlans: [],
      offlineRegions: [],
      offlineMembers: [],
      offlineMembersStatuses: [],

      memberStats: null,
      meetingStats: null,

      isLoading: false,

      setUserCurrent: (user) => set({ userCurrent: user }),
      setPlanSelected: (plan) => set({ planSelected: plan }),
      setMemberSelected: (member) => set({ memberSelected: member }),
      setMeetingSelected: (meeting) => set({ meetingSelected: meeting }),

      setMemberSearchResults: (results, total) =>
        set({ memberSearchResults: results, memberSearchTotal: total }),
      appendMemberSearchResults: (results, total) =>
        set((state) => ({
          memberSearchResults: [...state.memberSearchResults, ...results],
          memberSearchTotal: total,
        })),
      setMeetingSearchResults: (results, total) =>
        set({ meetingSearchResults: results, meetingSearchTotal: total }),

      loadDashboardData: async () => {
        set({ isLoading: true });
        try {
          const { memberStats, meetingStats } = await dashboardService.loadDashboardData();
          set({
            memberStats,
            meetingStats,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      loadOfflineData: async () => {
        set({ isLoading: true });
        try {
          const [plans, regions, members] = await Promise.all([
            offlineService.cachePlans(),
            offlineService.cacheRegions(),
            offlineService.cacheMembers(),
          ]);

          const memberStats = await dashboardService.getMemberStatsByStatus();

          set({
            offlinePlans: plans,
            offlineRegions: regions,
            offlineMembers: members,
            offlineMembersStatuses: memberStats,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      clearOfflineData: async () => {
        await offlineService.clearCache();
        set({
          offlinePlans: [],
          offlineRegions: [],
          offlineMembers: [],
          offlineMembersStatuses: [],
        });
      },
    }),
    {
      name: 'manus-siscad-app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userCurrent: state.userCurrent,
        planSelected: state.planSelected,
        offlinePlans: state.offlinePlans,
        offlineRegions: state.offlineRegions,
        offlineMembers: state.offlineMembers,
      }),
    }
  )
);
