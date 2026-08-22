import { meetingsApi } from '../api/meetings';
import { IMeetingMember, IMeetingMemberStatus } from '../models';

export const meetingMemberService = {
  async getMeetingMembers(
    meetingId: string,
    limit = 50,
    offset = 0
  ): Promise<{ data: IMeetingMember[]; total: number }> {
    try {
      const data = await meetingsApi.getMembersByMeetingId(
        parseInt(meetingId, 10),
        limit,
        offset
      );
      return { data: data || [], total: data?.length || 0 };
    } catch (error) {
      console.error('Erro ao buscar membros da reunião:', error);
      return { data: [], total: 0 };
    }
  },

  async getMeetingMemberById(meetingMemberId: string): Promise<IMeetingMember | null> {
    try {
      const data = await meetingsApi.getMemberById(parseInt(meetingMemberId, 10));
      return data || null;
    } catch (error) {
      console.error('Erro ao buscar membro da reunião:', error);
      return null;
    }
  },

  async addMemberToMeeting(meetingId: string, memberId: string): Promise<IMeetingMember | null> {
    try {
      const data = await meetingsApi.addMember(
        parseInt(meetingId, 10),
        parseInt(memberId, 10)
      );
      return data;
    } catch (error) {
      console.error('Erro ao adicionar membro à reunião:', error);
      return null;
    }
  },

  async confirmParticipation(meetingMemberId: string, statusId: number): Promise<boolean> {
    try {
      await meetingsApi.updateMember(parseInt(meetingMemberId, 10), {
        confirmed: statusId,
      });
      return true;
    } catch (error) {
      console.error('Erro ao confirmar participação:', error);
      return false;
    }
  },

  async registerParticipation(meetingMemberId: string, participated: boolean): Promise<boolean> {
    try {
      await meetingsApi.updateMember(parseInt(meetingMemberId, 10), {
        participated: participated ? 1 : 0,
      });
      return true;
    } catch (error) {
      console.error('Erro ao registrar participação:', error);
      return false;
    }
  },

  async removeMemberFromMeeting(meetingMemberId: string): Promise<boolean> {
    try {
      await meetingsApi.removeMember(parseInt(meetingMemberId, 10));
      return true;
    } catch (error) {
      console.error('Erro ao remover membro da reunião:', error);
      return false;
    }
  },

  async getMemberStatusesByMeeting(meetingId: string): Promise<IMeetingMemberStatus[]> {
    try {
      const data = await meetingsApi.getMemberStatusesByMeetingId(parseInt(meetingId, 10));
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar status dos membros:', error);
      return [];
    }
  },

  async updateInvitation(
    meetingMemberId: string,
    invitationReady: number,
    invitationSentAt?: string
  ): Promise<boolean> {
    try {
      const updateData: Partial<IMeetingMember> = {
        invitationReady,
      };
      if (invitationSentAt) {
        updateData.invitationSentAt = invitationSentAt;
      }
      await meetingsApi.updateMember(parseInt(meetingMemberId, 10), updateData);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar convite:', error);
      return false;
    }
  },
};
