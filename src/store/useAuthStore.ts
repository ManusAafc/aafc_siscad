import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { IUser, EMPTY_USER } from '../models/user';
import { usersApi } from '../api/users';

interface AuthState {
  user: IUser;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  setUser: (user: IUser) => void;
  initialize: () => Promise<void>;
}

const toBoolean = (val: unknown): boolean => val === true || val === 'true' || val === 1;

async function buildUserFromProfile(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string }): Promise<IUser> {
  try {
    const profile = await usersApi.getByEmail(authUser.email || '');
    if (profile) {
      return {
        id: authUser.id,
        uuid: authUser.id,
        email: authUser.email || '',
        nameShort: profile.name_short || profile.nameShort || (authUser.user_metadata?.name as string) || '',
        nameFull: profile.name_full || profile.nameFull || (authUser.user_metadata?.name as string) || '',
        profileImgPath: profile.profile_img_path || profile.profileImgPath || '',
        profileImgName: profile.profile_img_name || profile.profileImgName || '',
        statusId: profile.status_id ?? profile.statusId ?? 1,
        isAdminSuper: toBoolean(profile.is_admin_super ?? profile.isAdminSuper),
        isAdmin: toBoolean(profile.is_admin ?? profile.isAdmin),
        mobile: profile.mobile || '',
        mobileFull: '',
        mobileMask: '',
        mobileWhatsapp: '',
        createdAt: authUser.created_at || '',
        updatedAt: '',
        deletedAt: '',
        dbMemberPlanId: profile.db_member_plan_id ?? profile.dbMemberPlanId ?? 0,
        dbMemberStatusId: profile.db_member_status_id ?? profile.dbMemberStatusId ?? 0,
        isManagerMembers: toBoolean(profile.is_manager_members ?? profile.isManagerMembers),
        isManagerMeetings: toBoolean(profile.is_manager_meetings ?? profile.isManagerMeetings),
      };
    }
  } catch (e) {
    console.warn('[useAuthStore] Falha ao buscar perfil:', e);
  }

  return {
    id: authUser.id,
    uuid: authUser.id,
    email: authUser.email || '',
    nameShort: (authUser.user_metadata?.name as string) || '',
    nameFull: (authUser.user_metadata?.name as string) || '',
    profileImgPath: '',
    profileImgName: '',
    statusId: 1,
    isAdminSuper: toBoolean(authUser.user_metadata?.is_admin_super),
    isAdmin: toBoolean(authUser.user_metadata?.is_admin),
    mobile: (authUser.user_metadata?.mobile as string) || '',
    mobileFull: '',
    mobileMask: '',
    mobileWhatsapp: '',
    createdAt: authUser.created_at || '',
    updatedAt: '',
    deletedAt: '',
    dbMemberPlanId: 0,
    dbMemberStatusId: 0,
    isManagerMembers: toBoolean(authUser.user_metadata?.is_manager_members),
    isManagerMeetings: toBoolean(authUser.user_metadata?.is_manager_meetings),
  };
}

let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: EMPTY_USER,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      if (data.user) {
        const userResponse = await buildUserFromProfile(data.user);
        set({ user: userResponse, session: data.session, isAuthenticated: true, isLoading: false });
      }
      return {};
    } catch {
      return { error: 'Erro ao fazer login' };
    }
  },

  signUp: async (email, password, name) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) return { error: error.message };
      return {};
    } catch {
      return { error: 'Erro ao criar conta' };
    }
  },

  signOut: async () => {
    if (authSubscription) {
      authSubscription.unsubscribe();
      authSubscription = null;
    }
    await supabase.auth.signOut();
    set({ user: EMPTY_USER, session: null, isAuthenticated: false, isLoading: false });
  },

  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-new`,
      });
      if (error) {
        const messages: Record<string, string> = {
          'User not found': 'Email não cadastrado no sistema',
          'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos',
          'Invalid email': 'Email inválido',
        };
        return { error: messages[error.message] || error.message };
      }
      return {};
    } catch {
      return { error: 'Erro ao enviar email de recuperação' };
    }
  },

  updatePassword: async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      return {};
    } catch {
      return { error: 'Erro ao atualizar senha' };
    }
  },

  setUser: (user) => set({ user }),

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const userResponse = await buildUserFromProfile(session.user);
        set({ user: userResponse, session, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }

      // Limpar listener anterior se existir
      if (authSubscription) {
        authSubscription.unsubscribe();
      }

      authSubscription = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const userResponse = await buildUserFromProfile(session.user);
          set({ user: userResponse, session, isAuthenticated: true, isLoading: false });
        } else {
          set({ user: EMPTY_USER, session: null, isAuthenticated: false, isLoading: false });
        }
      }).data.subscription;
    } catch {
      set({ isLoading: false });
    }
  },
}));
