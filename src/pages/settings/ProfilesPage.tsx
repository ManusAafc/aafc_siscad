import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  CheckCircle,
  Circle,
  ChevronRight,
  Users,
  Calendar,
  Settings,
  FileText,
  RefreshCw,
} from 'lucide-react';
import {
  profilesApi,
  permissionsApi,
  IProfile,
  IPermission,
} from '../../api/profiles';

// ─── Módulos disponíveis no sistema ────────────────────────────────────────────
const MODULES = [
  { key: 'members',  label: 'Socios',   icon: Users },
  { key: 'meetings', label: 'Reuniões',  icon: Calendar },
  { key: 'reports',  label: 'Relatórios', icon: FileText },
  { key: 'settings', label: 'Ajustes',   icon: Settings },
];

const EMPTY_PROFILE: Omit<IProfile, 'id'> = {
  name: '',
  description: '',
  is_active: true,
};

const defaultPermission = (profileId: number, module: string): IPermission => ({
  profile_id: profileId,
  module,
  can_view: false,
  can_create: false,
  can_edit: false,
  can_delete: false,
  can_export: false,
});

// ─── Componente Toggle ─────────────────────────────────────────────────────────
const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  color?: string;
}> = ({ checked, onChange, label, color = '#3b82f6' }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.3rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.4rem',
      borderRadius: '8px',
      transition: 'background 0.15s',
      minWidth: '64px',
    }}
  >
    {checked ? (
      <CheckCircle size={22} style={{ color }} />
    ) : (
      <Circle size={22} style={{ color: 'hsl(var(--border))' }} />
    )}
    <span style={{ fontSize: '0.7rem', fontWeight: 500, color: checked ? color : 'hsl(var(--muted-foreground))' }}>
      {label}
    </span>
  </button>
);

// ─── Componente Principal ──────────────────────────────────────────────────────
export const ProfilesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [selected, setSelected] = useState<IProfile | null>(null);
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<IProfile, 'id'>>(EMPTY_PROFILE);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ── Carregar perfis ─────────────────────────────────────────────────────────
  const loadProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await profilesApi.getAll();
      setProfiles(data);
    } catch {
      showToast('Erro ao carregar perfis.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  // ── Carregar permissões do perfil selecionado ───────────────────────────────
  useEffect(() => {
    if (!selected?.id) return;
    permissionsApi.getByProfile(selected.id).then((data) => {
      // Garante que todos os módulos existam
      const filled = MODULES.map((m) => {
        const existing = data.find((p) => p.module === m.key);
        return existing ?? defaultPermission(selected.id!, m.key);
      });
      setPermissions(filled);
    });
  }, [selected]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── CRUD de Perfil ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_PROFILE);
    setShowForm(true);
  };

  const openEdit = (profile: IProfile) => {
    setEditingId(profile.id ?? null);
    setFormData({ name: profile.name, description: profile.description ?? '', is_active: profile.is_active ?? true });
    setShowForm(true);
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) return;
    setIsSaving(true);
    try {
      if (editingId) {
        const updated = await profilesApi.update(editingId, formData);
        setProfiles((p) => p.map((x) => (x.id === editingId ? { ...x, ...updated } : x)));
        if (selected?.id === editingId) setSelected((s) => s ? { ...s, ...updated } : s);
        showToast('Perfil atualizado!', 'success');
      } else {
        const created = await profilesApi.create(formData);
        setProfiles((p) => [...p, created]);
        showToast('Perfil criado!', 'success');
      }
      setShowForm(false);
    } catch {
      showToast('Erro ao salvar perfil.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await permissionsApi.deleteByProfile(id);
      await profilesApi.delete(id);
      setProfiles((p) => p.filter((x) => x.id !== id));
      if (selected?.id === id) setSelected(null);
      setDeleteConfirm(null);
      showToast('Perfil removido!', 'success');
    } catch {
      showToast('Erro ao remover perfil.', 'error');
    }
  };

  // ── Salvar permissões ───────────────────────────────────────────────────────
  const handleSavePermissions = async () => {
    if (!selected?.id) return;
    setIsSaving(true);
    try {
      await permissionsApi.upsert(permissions.map((p) => ({ ...p, profile_id: selected.id! })));
      showToast('Permissões salvas!', 'success');
    } catch {
      showToast('Erro ao salvar permissões.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePerm = (module: string, field: keyof IPermission, value: boolean) => {
    setPermissions((prev) =>
      prev.map((p) => (p.module === module ? { ...p, [field]: value } : p))
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Toast */}
      {toast && (
        <div style={{
          ...s.toast,
          backgroundColor: toast.type === 'success' ? '#16a34a' : '#dc2626',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Perfis de Acesso</h2>
          <p style={s.subtitle}>Gerencie perfis e suas permissões por módulo</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} />
          Novo Perfil
        </button>
      </div>

      <div style={s.layout}>
        {/* ── Lista de Perfis ── */}
        <div style={s.list}>
          {isLoading ? (
            <div style={s.center}><RefreshCw size={20} className="spinner" style={{ color: 'hsl(var(--primary))' }} /></div>
          ) : profiles.length === 0 ? (
            <div style={s.empty}>
              <Shield size={40} style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }} />
              <p style={{ color: 'hsl(var(--muted-foreground))' }}>Nenhum perfil cadastrado</p>
            </div>
          ) : (
            profiles.map((profile) => (
              <div
                key={profile.id}
                style={{
                  ...s.profileCard,
                  ...(selected?.id === profile.id ? s.profileCardActive : {}),
                }}
                onClick={() => setSelected(profile)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{profile.name}</div>
                  {profile.description && (
                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.15rem' }}>
                      {profile.description}
                    </div>
                  )}
                  <div style={{ marginTop: '0.4rem' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '100px',
                      backgroundColor: profile.is_active ? '#dcfce7' : '#fee2e2',
                      color: profile.is_active ? '#16a34a' : '#dc2626',
                    }}>
                      {profile.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    style={s.iconBtn}
                    title="Editar"
                    onClick={() => openEdit(profile)}
                  >
                    <Pencil size={15} />
                  </button>
                  {deleteConfirm === profile.id ? (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        style={{ ...s.iconBtn, color: '#dc2626' }}
                        title="Confirmar exclusão"
                        onClick={() => handleDelete(profile.id!)}
                      >
                        <Trash2 size={15} />
                      </button>
                      <button
                        style={s.iconBtn}
                        title="Cancelar"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <button
                      style={s.iconBtn}
                      title="Excluir"
                      onClick={() => setDeleteConfirm(profile.id!)}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <ChevronRight size={16} style={{ color: 'hsl(var(--muted-foreground))', alignSelf: 'center' }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Painel de Permissões ── */}
        <div style={s.permPanel}>
          {!selected ? (
            <div style={s.empty}>
              <Shield size={48} style={{ color: 'hsl(var(--border))', marginBottom: '1rem' }} />
              <p style={{ color: 'hsl(var(--muted-foreground))' }}>Selecione um perfil para configurar as permissões</p>
            </div>
          ) : (
            <>
              <div style={s.permHeader}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Permissões — {selected.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                    Defina o que este perfil pode fazer em cada módulo
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleSavePermissions}
                  disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.6rem 1.2rem' }}
                >
                  {isSaving ? <RefreshCw size={14} className="spinner" /> : <Save size={14} />}
                  Salvar
                </button>
              </div>

              {/* Tabela de permissões */}
              <div style={s.permTable}>
                {/* Cabeçalho */}
                <div style={s.permTableHeader}>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))' }}>
                    Módulo
                  </span>
                  {['Visualizar', 'Criar', 'Editar', 'Excluir', 'Exportar'].map((h) => (
                    <span key={h} style={{ width: '68px', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'hsl(var(--muted-foreground))' }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Linhas */}
                {MODULES.map((mod) => {
                  const perm = permissions.find((p) => p.module === mod.key) ?? defaultPermission(selected.id!, mod.key);
                  const Icon = mod.icon;
                  return (
                    <div key={mod.key} style={s.permRow}>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={s.modIcon}>
                          <Icon size={16} style={{ color: 'hsl(var(--primary))' }} />
                        </div>
                        <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{mod.label}</span>
                      </div>
                      <Toggle
                        checked={perm.can_view}
                        onChange={(v) => updatePerm(mod.key, 'can_view', v)}
                        label="Ver"
                        color="#3b82f6"
                      />
                      <Toggle
                        checked={perm.can_create}
                        onChange={(v) => updatePerm(mod.key, 'can_create', v)}
                        label="Criar"
                        color="#16a34a"
                      />
                      <Toggle
                        checked={perm.can_edit}
                        onChange={(v) => updatePerm(mod.key, 'can_edit', v)}
                        label="Editar"
                        color="#f59e0b"
                      />
                      <Toggle
                        checked={perm.can_delete}
                        onChange={(v) => updatePerm(mod.key, 'can_delete', v)}
                        label="Excluir"
                        color="#dc2626"
                      />
                      <Toggle
                        checked={perm.can_export ?? false}
                        onChange={(v) => updatePerm(mod.key, 'can_export', v)}
                        label="Export."
                        color="#8b5cf6"
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Modal de Criar/Editar Perfil ── */}
      {showForm && (
        <div style={s.overlay} onClick={() => setShowForm(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={{ fontWeight: 700 }}>{editingId ? 'Editar Perfil' : 'Novo Perfil'}</h3>
              <button style={s.iconBtn} onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="input-group">
              <label className="input-label">Nome do Perfil *</label>
              <input
                className="input-control"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Coordenador, Secretário..."
                autoFocus
              />
            </div>

            <div className="input-group">
              <label className="input-label">Descrição</label>
              <input
                className="input-control"
                value={formData.description ?? ''}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descrição breve do perfil..."
              />
            </div>

            <div className="input-group">
              <label className="input-label">Status</label>
              <select
                className="input-control"
                value={formData.is_active ? 'true' : 'false'}
                onChange={(e) => setFormData((f) => ({ ...f, is_active: e.target.value === 'true' }))}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={handleSaveProfile}
                disabled={isSaving || !formData.name.trim()}
              >
                {isSaving ? <RefreshCw size={14} className="spinner" /> : <Save size={14} />}
                {editingId ? 'Salvar Alterações' : 'Criar Perfil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: '1.25rem', fontWeight: 700 },
  subtitle: { fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.2rem' },
  layout: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--card))',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: 'var(--shadow-sm)',
  },
  profileCardActive: {
    borderColor: 'hsl(var(--primary))',
    backgroundColor: 'hsla(var(--primary), 0.04)',
    boxShadow: '0 0 0 2px hsla(var(--primary), 0.15)',
  },
  permPanel: {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
  },
  permHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid hsl(var(--border))',
  },
  permTable: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.75rem 1rem',
    gap: '0.25rem',
  },
  permTableHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    marginBottom: '0.25rem',
  },
  permRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    borderRadius: '10px',
    transition: 'background 0.15s',
    gap: '0.25rem',
  },
  modIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'hsla(var(--primary), 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem',
    borderRadius: '6px',
    color: 'hsl(var(--muted-foreground))',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  },
  center: { display: 'flex', justifyContent: 'center', padding: '2rem' },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    textAlign: 'center',
    flex: 1,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  modal: {
    backgroundColor: 'hsl(var(--card))',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-lg)',
    padding: '1.75rem',
    width: '100%',
    maxWidth: '440px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  toast: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    zIndex: 300,
    boxShadow: 'var(--shadow-lg)',
    animation: 'slideInRight 0.3s ease',
  },
};
