import { IMeetingCity, IMeetingPlan, IMeetingMemberStatus } from '../models';

export const getListCitiesIdsFromMeetingCities = (
  meetingCities: IMeetingCity[]
): number[] => {
  return meetingCities.map((city) => city.cityId);
};

export const getListPlansIdsFromMeetingPlans = (
  meetingPlans: IMeetingPlan[]
): number[] => {
  return meetingPlans.map((plan) => plan.planId);
};

export const getListMemberStatusesIdsFromMeetingMemberStatuses = (
  memberStatuses: IMeetingMemberStatus[]
): number[] => {
  return memberStatuses.map((status) => status.memberStatusId);
};

export const searchInList = (
  textToSearch: string,
  textToSearchIn: string
): boolean => {
  return textToSearchIn.toLowerCase().includes(textToSearch.toLowerCase());
};

export const isItemInList = (list: number[], item: number): boolean => {
  return list.includes(item);
};

export const integerToIntegerList = (value: number | null): number[] | null => {
  return value !== null ? [value] : null;
};

export const setEmptyList = (): number[] => {
  return [];
};

export const getMemberResultList = <T>(
  list: T[] | null,
  offset: number,
  limit: number
): T[] => {
  if (!list || offset >= list.length) return [];
  return list.slice(offset, Math.min(offset + limit, list.length));
};

// Status unificado do sistema
type MemberStatusId = 1 | 2 | 3;

const STATUS_CONFIG: Record<MemberStatusId, { color: string; label: string }> = {
  1: { color: '#388E3C', label: 'Ativo' },
  2: { color: '#F57C00', label: 'Inativo' },
  3: { color: '#D32F2F', label: 'Suspenso' },
};

export const getStatusColor = (statusId: number): string => {
  return STATUS_CONFIG[statusId as MemberStatusId]?.color || '#757575';
};

export const getStatusLabel = (statusId: number): string => {
  return STATUS_CONFIG[statusId as MemberStatusId]?.label || 'N/A';
};

export const getStatusBgColor = (statusId: number): string => {
  const color = getStatusColor(statusId);
  return `${color}20`;
};
