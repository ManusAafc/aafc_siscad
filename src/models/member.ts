export interface IMember {
  id: number;
  name: string;
  code: string;
  cpf: string;
  cpfMask: string;
  address: string;
  zipCode: string;
  zipCodeMask: string;
  neighborhood: string;
  phone: string;
  phoneMask: string;
  mobile: string;
  mobileMask: string;
  whatsappId: string;
  email: string;
  planId: number;
  planCode: string;
  planDescription: string;
  statusId: number;
  statusCode: string;
  statusDescription: string;
  cityId: number;
  cityDescription: string;
  stateId: number;
  stateCode: string;
  stateDescription: string;
  regionId: number;
  regionCode: string;
  regionDescription: string;
  statusReasonId: number;
  statusReasonCode: string;
  statusReasonDescription: string;
  genderId: number;
  genderCode: string;
  dateAafcStart: string;
  dateAafcStartDatetime: string | null;
  dateAafcEnd: string;
  dateAafcEndDatetime: string | null;
  dateInss: string;
  dateInssDatetime: string | null;
  dateFundacao: string;
  dateFundacaoDatetime: string | null;
  birthday: string;
  birthdayDatetime: string | null;
  bankId: number;
  bankAgency: string;
  bankAccount: string;
  comments: string;
  imgPath: string;
  imgName: string;
  createdAt: string;
  createdAtDatetime: string | null;
  updatedAt: string;
  updatedAtDatetime: string | null;

  status?: number;
  statusName?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  baptismStatus?: string;
  whatsapp?: string;
  cityName?: string;
  regionName?: string;
  planName?: string;
  totalFamilyMembers?: number;
  memberInsertName?: string;
}

export interface IMemberStatus {
  id: number;
  code: string;
  description: string;
  statusId?: number;
  statusName?: string;
  count?: number;
  color?: string;
}

export const EMPTY_MEMBER: IMember = {
  id: 0,
  name: '',
  code: '',
  cpf: '',
  cpfMask: '',
  address: '',
  zipCode: '',
  zipCodeMask: '',
  neighborhood: '',
  phone: '',
  phoneMask: '',
  mobile: '',
  mobileMask: '',
  whatsappId: '',
  email: '',
  planId: 0,
  planCode: '',
  planDescription: '',
  statusId: 0,
  statusCode: '',
  statusDescription: '',
  cityId: 0,
  cityDescription: '',
  stateId: 0,
  stateCode: '',
  stateDescription: '',
  regionId: 0,
  regionCode: '',
  regionDescription: '',
  statusReasonId: 0,
  statusReasonCode: '',
  statusReasonDescription: '',
  genderId: 0,
  genderCode: '',
  dateAafcStart: '',
  dateAafcStartDatetime: null,
  dateAafcEnd: '',
  dateAafcEndDatetime: null,
  dateInss: '',
  dateInssDatetime: null,
  dateFundacao: '',
  dateFundacaoDatetime: null,
  birthday: '',
  birthdayDatetime: null,
  bankId: 0,
  bankAgency: '',
  bankAccount: '',
  comments: '',
  imgPath: '',
  imgName: '',
  createdAt: '',
  createdAtDatetime: null,
  updatedAt: '',
  updatedAtDatetime: null,
};
