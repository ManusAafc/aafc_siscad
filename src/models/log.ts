export interface ILog {
  id: number;
  createdDate: string;
  userUuid: string | null;
  userName: string | null;
  userEmail: string | null;
  tableName: string | null;
  operation: string | null;
  dataOld: Record<string, unknown> | null;
  dataNew: Record<string, unknown> | null;
  userId: number | null;
}

export interface ILogFilters {
  tableName: string;
  operation: string;
  userSearch: string;
  startDate: string;
  endDate: string;
}

export const EMPTY_LOG_FILTERS: ILogFilters = {
  tableName: '',
  operation: '',
  userSearch: '',
  startDate: '',
  endDate: '',
};

export const TABLE_LABELS: Record<string, string> = {
  members: 'Socios',
  meetings: 'Reunioes',
  meetings_members: 'Reunioes x Socios',
  users: 'Usuarios',
  profiles: 'Perfis',
  permissions: 'Permissoes',
  plans: 'Planos',
  regions: 'Regioes',
  genders: 'Generos',
};

export const OPERATION_LABELS: Record<string, string> = {
  INSERT: 'Inserido',
  UPDATE: 'Alterado',
  DELETE: 'Excluido',
};

export const OPERATION_COLORS: Record<string, { bg: string; color: string }> = {
  INSERT: { bg: '#dcfce7', color: '#16a34a' },
  UPDATE: { bg: '#dbeafe', color: '#2563eb' },
  DELETE: { bg: '#fee2e2', color: '#dc2626' },
};
