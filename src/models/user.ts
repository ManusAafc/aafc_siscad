export interface IUser {
  id: string;
  uuid: string;
  email: string;
  nameShort: string;
  nameFull: string;
  profileImgPath: string;
  profileImgName: string;
  statusId: number;
  isAdminSuper: boolean;
  isAdmin: boolean;
  mobile: string;
  mobileFull: string;
  mobileMask: string;
  mobileWhatsapp: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  dbMemberPlanId: number;
  dbMemberStatusId: number;
  isManagerMembers: boolean;
  isManagerMeetings: boolean;
  profile_id?: number | null;
}

export const EMPTY_USER: IUser = {
  id: '',
  uuid: '',
  email: '',
  nameShort: '',
  nameFull: '',
  profileImgPath: '',
  profileImgName: '',
  statusId: 0,
  isAdminSuper: false,
  isAdmin: false,
  mobile: '',
  mobileFull: '',
  mobileMask: '',
  mobileWhatsapp: '',
  createdAt: '',
  updatedAt: '',
  deletedAt: '',
  dbMemberPlanId: 0,
  dbMemberStatusId: 0,
  isManagerMembers: false,
  isManagerMeetings: false,
  profile_id: null,
};
