import { plansApi } from '../api/plans';
import { regionsApi } from '../api/regions';
import { memberService } from './memberService';
import { IPlan } from '../models/plan';
import { IRegion } from '../models/region';
import { IMember } from '../models/member';

const STORAGE_KEYS = {
  PLANS: '@manus_siscad_plans',
  REGIONS: '@manus_siscad_regions',
  MEMBERS: '@manus_siscad_members',
  MEMBERS_STATUSES: '@manus_siscad_members_statuses',
  LAST_SYNC: '@manus_siscad_last_sync',
};

export const offlineService = {
  async cachePlans(): Promise<IPlan[]> {
    try {
      const data = await plansApi.getAll();
      const plans = data || [];
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
      await this.updateLastSync();
      return plans;
    } catch (error) {
      console.error('Erro ao cache de planos:', error);
      return this.getCachedPlans();
    }
  },

  async getCachedPlans(): Promise<IPlan[]> {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.PLANS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  async cacheRegions(): Promise<IRegion[]> {
    try {
      const data = await regionsApi.getAll();
      const regions = data || [];
      localStorage.setItem(STORAGE_KEYS.REGIONS, JSON.stringify(regions));
      await this.updateLastSync();
      return regions;
    } catch (error) {
      console.error('Erro ao cache de regiões:', error);
      return this.getCachedRegions();
    }
  },

  async getCachedRegions(): Promise<IRegion[]> {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.REGIONS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  async cacheMembers(): Promise<IMember[]> {
    try {
      const data = await memberService.getAllMembers();
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data));
      await this.updateLastSync();
      return data;
    } catch (error) {
      console.error('Erro ao cache de membros:', error);
      return this.getCachedMembers();
    }
  },

  async getCachedMembers(): Promise<IMember[]> {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  async cacheMembersStatuses(statuses: any[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS_STATUSES, JSON.stringify(statuses));
    } catch (error) {
      console.error('Erro ao cache de status:', error);
    }
  },

  async getCachedMembersStatuses(): Promise<any[]> {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.MEMBERS_STATUSES);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  },

  async updateLastSync(): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  },

  async getLastSync(): Promise<string | null> {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  },

  async clearCache(): Promise<void> {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },

  async isCacheExpired(maxAgeHours: number = 24): Promise<boolean> {
    const lastSync = await this.getLastSync();
    if (!lastSync) return true;

    const lastSyncDate = new Date(lastSync);
    const now = new Date();
    const diffHours = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

    return diffHours > maxAgeHours;
  },
};
