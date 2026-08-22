export interface IMeeting {
  id: number;
  description: string;
  comments: string;
  address: string;
  zipCode: string;
  zipCodeMask: string;
  neighborhood: string;
  phone: string;
  phoneMask: string;
  mobile: string;
  mobileMask: string;
  typeId: number;
  typeCode: string;
  typeDescription: string;
  statusId: number;
  statusCode: string;
  statusDescription: string;
  cityId: number;
  cityDescription: string;
  stateId: number;
  stateCode: string;
  regionId: number;
  regionCode: string;
  regionDescription: string;
  dateHourStart: string;
  dateHourEnd: string;
  amountMembers: number;
  amountInvited: number;
  amountRevised: number;
  amountInvitationsErrors: number;
  amountInvitationsReady: number;
  amountConfirmed: number;
  amountConfirmedExtra: number;
  amountParticipated: number;
  amountParticipatedExtra: number;
  isInvitationSending: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  dateHourStartDatetime: string | null;
  dateHourEndDatetime: string | null;

  title?: string;
  meetingDate?: string;
  cityName?: string;
  planName?: string;
  planId?: number;
  memberInsertName?: string;
  status?: string;
}

export interface IMeetingMember {
  id: number;
  meetingId: number;
  memberId: number;
  memberCode: string;
  memberName: string;
  cpfMask: string;
  mobileMask: string;
  invited: number;
  revised: number;
  confirmed: number;
  confirmedExtra: number;
  participated: number;
  participatedExtra: number;
  invitationErrorMsg: string;
  invitationReady: number;
  whatsappId: string;
  invitationSentAt: string;
  isInvitationError: boolean;
  statusName?: string;
}

export interface IMeetingMemberStatus {
  id: number;
  meetingId: number;
  memberStatusId: number;
  memberStatusDescription: string;
}

export interface IMeetingPlan {
  id: number;
  meetingId: number;
  planId: number;
  planDescription: string;
  planName?: string;
}

export interface IMeetingCity {
  id: number;
  meetingId: number;
  cityId: number;
  cityDescription: string;
  cityName?: string;
  stateId: number;
  stateCode: string;
}

export const EMPTY_MEETING: IMeeting = {
  id: 0,
  description: '',
  comments: '',
  address: '',
  zipCode: '',
  zipCodeMask: '',
  neighborhood: '',
  phone: '',
  phoneMask: '',
  mobile: '',
  mobileMask: '',
  typeId: 0,
  typeCode: '',
  typeDescription: '',
  statusId: 0,
  statusCode: '',
  statusDescription: '',
  cityId: 0,
  cityDescription: '',
  stateId: 0,
  stateCode: '',
  regionId: 0,
  regionCode: '',
  regionDescription: '',
  dateHourStart: '',
  dateHourEnd: '',
  amountMembers: 0,
  amountInvited: 0,
  amountRevised: 0,
  amountInvitationsErrors: 0,
  amountInvitationsReady: 0,
  amountConfirmed: 0,
  amountConfirmedExtra: 0,
  amountParticipated: 0,
  amountParticipatedExtra: 0,
  isInvitationSending: false,
  createdAt: '',
  updatedAt: '',
  deletedAt: '',
  dateHourStartDatetime: null,
  dateHourEndDatetime: null,
};
