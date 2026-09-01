import React, { useState } from 'react';
import { Settings, Shield, Database, Bell, Info, History } from 'lucide-react';
import { ProfilesPage } from './ProfilesPage';
import { LogsSearch } from '../logs/LogsSearch';

type Tab = 'overview' | 'profiles' | 'logs';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { key: Tab; label: string; icon: React.FC<any> }[] = [
    { key: 'overview', label: 'Visão Geral', icon: Info },
    { key: 'profiles', label: 'Perfis & Permissões', icon: Shield },
    { key: 'logs', label: 'Auditoria', icon: History },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Settings size={22} style={{ color: 'hsl(var(--primary))' }} />
        </div>
        <div>
          <h1 style={styles.title}>Ajustes</h1>
          <p style={styles.subtitle}>Configurações e administração do sistema</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...styles.tab,
                ...(isActive ? styles.tabActive : {}),
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {activeTab === 'overview' && <OverviewTab onNavigate={setActiveTab} />}
        {activeTab === 'profiles' && <ProfilesPage />}
        {activeTab === 'logs' && <LogsSearch />}
      </div>
    </div>
  );
};

// ─── Aba: Visão Geral ──────────────────────────────────────────────────────────
const OverviewTab: React.FC<{ onNavigate: (tab: Tab) => void }> = ({ onNavigate }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
    <div style={overviewGrid}>
      {[
        { icon: Shield, label: 'Perfis & Permissões', desc: 'Gerencie perfis de acesso e permissões por módulo.', tab: 'profiles' as Tab },
        { icon: History, label: 'Auditoria', desc: 'Visualize o histórico de alterações realizadas no sistema.', tab: 'logs' as Tab },
        { icon: Database, label: 'Banco de Dados', desc: 'Visualize tabelas e integridade dos dados.', tab: null },
        { icon: Bell, label: 'Notificações', desc: 'Configure alertas e e-mails automáticos.', tab: null },
      ].map(({ icon: Icon, label, desc, tab }) => (
        <div key={label} className="card" style={cardStyle}>
          <div style={iconBox}>
            <Icon size={22} style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{label}</h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', flex: 1 }}>{desc}</p>
          <button
            className="btn btn-secondary"
            style={{ alignSelf: 'flex-start', fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
            disabled={!tab}
            onClick={() => tab && onNavigate(tab)}
          >
            {tab ? 'Acessar' : 'Em breve'}
          </button>
        </div>
      ))}
    </div>

    {/* Info do sistema */}
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid hsl(var(--border))' }}>
        <Info size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Informações do Sistema</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          ['Aplicação', 'SISCAD AAFC'],
          ['Versão', '1.0.0'],
          ['Ambiente', 'Produção'],
          ['Banco de Dados', 'Supabase (PostgreSQL)'],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '0.2rem' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const overviewGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: '1.25rem',
};
const cardStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' };
const iconBox: React.CSSProperties = {
  width: '44px', height: '44px', borderRadius: '10px',
  backgroundColor: 'hsla(var(--primary), 0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  header: { display: 'flex', alignItems: 'center', gap: '1rem' },
  headerIcon: {
    width: '48px', height: '48px', borderRadius: '12px',
    backgroundColor: 'hsla(var(--primary), 0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  title: { fontSize: '1.5rem', fontWeight: 700 },
  subtitle: { fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.15rem' },
  tabs: {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '2px solid hsl(var(--border))',
    paddingBottom: '0',
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1.1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--muted-foreground))',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    borderRadius: '6px 6px 0 0',
  },
  tabActive: {
    color: 'hsl(var(--primary))',
    borderBottomColor: 'hsl(var(--primary))',
    backgroundColor: 'hsla(var(--primary), 0.05)',
  },
  content: { paddingTop: '0.25rem' },
};
