export interface ICity {
  id?: number;
  regionId: number;
  regionCode: string;
  regionDescription: string;
  cityId: number;
  cityDescription: string;
  name?: string;
}

export const EMPTY_CITY: ICity = {
  regionId: 0,
  regionCode: '',
  regionDescription: '',
  cityId: 0,
  cityDescription: '',
};
