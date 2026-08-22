import { create } from 'zustand';
import { IMeeting, IMeetingMember, IMeetingCity, IMeetingPlan, IMeetingMemberStatus } from '../models';
import { meetingService } from '../services/meetingService';
import { meetingMemberService } from '../services/meetingMemberService';

interface MeetingState {
  searchResults: IMeeting[];
  searchTotal: number;
  meetingSelected: IMeeting | null;
  meetingMembers: IMeetingMember[];
  meetingMembersTotal: number;
  meetingCities: IMeetingCity[];
  meetingPlans: IMeetingPlan[];
  meetingMemberStatuses: IMeetingMemberStatus[];
  selectedMeetingMember: IMeetingMember | null;
  isLoading: boolean;

  searchMeetings: (searchTerm: string, limit?: number, offset?: number) => Promise<void>;
  getMeetingById: (id: string) => Promise<IMeeting | null>;
  createMeeting: (meeting: Partial<IMeeting>) => Promise<IMeeting | null>;
  updateMeeting: (id: string, meeting: Partial<IMeeting>) => Promise<IMeeting | null>;
  deleteMeeting: (id: string) => Promise<boolean>;

  loadMeetingMembers: (meetingId: string) => Promise<void>;
  loadMeetingCities: (meetingId: string) => Promise<void>;
  loadMeetingPlans: (meetingId: string) => Promise<void>;
  loadMeetingMemberStatuses: (meetingId: string) => Promise<void>;

  addMemberToMeeting: (meetingId: string, memberId: string) => Promise<IMeetingMember | null>;
  confirmParticipation: (meetingMemberId: string, statusId: number) => Promise<boolean>;
  registerParticipation: (meetingMemberId: string, participated: boolean) => Promise<boolean>;
  removeMemberFromMeeting: (meetingMemberId: string) => Promise<boolean>;

  setSelectedMeeting: (meeting: IMeeting | null) => void;
  setSelectedMeetingMember: (member: IMeetingMember | null) => void;
  clearMeetingData: () => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  searchResults: [],
  searchTotal: 0,
  meetingSelected: null,
  meetingMembers: [],
  meetingMembersTotal: 0,
  meetingCities: [],
  meetingPlans: [],
  meetingMemberStatuses: [],
  selectedMeetingMember: null,
  isLoading: false,

  searchMeetings: async (searchTerm, limit = 20, offset = 0) => {
    set({ isLoading: true });
    try {
      const result = await meetingService.searchMeetings(searchTerm, limit, offset);
      set({
        searchResults: result.data,
        searchTotal: result.total,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  getMeetingById: async (id) => {
    set({ isLoading: true });
    try {
      const meeting = await meetingService.getMeetingById(id);
      set({ meetingSelected: meeting, isLoading: false });
      return meeting;
    } catch (error) {
      set({ isLoading: false });
      return null;
    }
  },

  createMeeting: async (meeting) => {
    set({ isLoading: true });
    try {
      const newMeeting = await meetingService.createMeeting(meeting);
      set({ isLoading: false });
      return newMeeting;
    } catch (error) {
      set({ isLoading: false });
      return null;
    }
  },

  updateMeeting: async (id, meeting) => {
    set({ isLoading: true });
    try {
      const updatedMeeting = await meetingService.updateMeeting(id, meeting);
      set({ isLoading: false });
      return updatedMeeting;
    } catch (error) {
      set({ isLoading: false });
      return null;
    }
  },

  deleteMeeting: async (id) => {
    set({ isLoading: true });
    try {
      const success = await meetingService.deleteMeeting(id);
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

  loadMeetingMembers: async (meetingId) => {
    try {
      const { data, total } = await meetingMemberService.getMeetingMembers(meetingId);
      set({ meetingMembers: data, meetingMembersTotal: total });
    } catch (error) {
      console.error('Erro ao carregar membros da reunião:', error);
    }
  },

  loadMeetingCities: async (meetingId) => {
    try {
      const cities = await meetingService.getMeetingCities(meetingId);
      set({ meetingCities: cities });
    } catch (error) {
      console.error('Erro ao carregar cidades da reunião:', error);
    }
  },

  loadMeetingPlans: async (meetingId) => {
    try {
      const plans = await meetingService.getMeetingPlans(meetingId);
      set({ meetingPlans: plans });
    } catch (error) {
      console.error('Erro ao carregar planos da reunião:', error);
    }
  },

  loadMeetingMemberStatuses: async (meetingId) => {
    try {
      const statuses = await meetingMemberService.getMemberStatusesByMeeting(meetingId);
      set({ meetingMemberStatuses: statuses });
    } catch (error) {
      console.error('Erro ao carregar status dos membros:', error);
    }
  },

  addMemberToMeeting: async (meetingId, memberId) => {
    set({ isLoading: true });
    try {
      const result = await meetingMemberService.addMemberToMeeting(meetingId, memberId);
      if (result) {
        set((state) => ({
          meetingMembers: [...state.meetingMembers, result],
        }));
      }
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ isLoading: false });
      return null;
    }
  },

  confirmParticipation: async (meetingMemberId, statusId) => {
    try {
      const success = await meetingMemberService.confirmParticipation(meetingMemberId, statusId);
      if (success) {
        set((state) => ({
          meetingMembers: state.meetingMembers.map((m) =>
            m.id === parseInt(meetingMemberId, 10)
              ? { ...m, confirmed: statusId }
              : m
          ),
        }));
      }
      return success;
    } catch (error) {
      return false;
    }
  },

  registerParticipation: async (meetingMemberId, participated) => {
    try {
      const success = await meetingMemberService.registerParticipation(meetingMemberId, participated);
      if (success) {
        set((state) => ({
          meetingMembers: state.meetingMembers.map((m) =>
            m.id === parseInt(meetingMemberId, 10)
              ? { ...m, participated: participated ? 1 : 0 }
              : m
          ),
        }));
      }
      return success;
    } catch (error) {
      return false;
    }
  },

  removeMemberFromMeeting: async (meetingMemberId) => {
    set({ isLoading: true });
    try {
      const success = await meetingMemberService.removeMemberFromMeeting(meetingMemberId);
      if (success) {
        set((state) => ({
          meetingMembers: state.meetingMembers.filter(
            (m) => m.id !== parseInt(meetingMemberId, 10)
          ),
          isLoading: false,
        }));
      }
      return success;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },

  setSelectedMeeting: (meeting) => set({ meetingSelected: meeting }),
  setSelectedMeetingMember: (member) => set({ selectedMeetingMember: member }),

  clearMeetingData: () =>
    set({
      meetingSelected: null,
      meetingMembers: [],
      meetingCities: [],
      meetingPlans: [],
      meetingMemberStatuses: [],
      selectedMeetingMember: null,
    }),
}));
