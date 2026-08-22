export interface IPlan {
  id: number;
  code: string;
  description: string;
  name?: string;
}

export const EMPTY_PLAN: IPlan = {
  id: 0,
  code: '',
  description: '',
};
