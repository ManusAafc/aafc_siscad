export interface IUserMembersFilters {
  memberStatusesIds: number[];
  plansIds: number[];
  regionsIds: number[];
  statesIds: number[];
  citiesIds: number[];
  gendersIds: number[];
  statusesReasonsIds: number[];
  searchTerms: string;
  filtersAmount: number;
}

export const EMPTY_FILTERS: IUserMembersFilters = {
  memberStatusesIds: [],
  plansIds: [],
  regionsIds: [],
  statesIds: [],
  citiesIds: [],
  gendersIds: [],
  statusesReasonsIds: [],
  searchTerms: '',
  filtersAmount: 0,
};
