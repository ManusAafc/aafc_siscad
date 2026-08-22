export interface IRegion {
  id: number;
  code: string;
  description: string;
  name?: string;
}

export const EMPTY_REGION: IRegion = {
  id: 0,
  code: '',
  description: '',
};
