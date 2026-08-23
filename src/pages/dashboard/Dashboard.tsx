import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Users, 
  CheckCircle, 
  Calendar, 
  CreditCard, 
  UserSearch, 
  UserPlus, 
  CalendarSearch, 
  CalendarPlus,
  RefreshCw
} from 'lucide-react';
import aafcLogo from '../../assets/aafc_logo.jpg';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { memberStats, meetingStats, loadDashboardData, isLoading } = useAppStore();

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    await loadDashboardData();
  };

  const getTotalMembers = () => {
    if (!memberStats) return 0;
    return memberStats.totalCount || 0;
  };

  const getConfirmedMembers = () => {
    if (!memberStats || !memberStats.byStatus) return 0;
    const confirmed = memberStats.byStatus.find(s => s.statusId === 1);
    return confirmed ? confirmed.count || 0 : 0;
  };

  const getActivePlans = () => {
    if (!memberStats || !memberStats.byPlan) return 0;
    return memberStats.byPlan.length;
  };

  if (isLoading && !memberStats) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={{ color: 'hsl(var(--primary))' }}></div>
        <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))' }}>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <img src={aafcLogo} alt="AAFCorsan" style={styles.logoImage} />
        </div>
        <button 
          onClick={onRefresh} 
          className="btn btn-secondary" 
          style={styles.refreshBtn}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? 'spinner' : ''} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div style={styles.statsGrid}>
        <div className="card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>
              <Users size={22} />
            </div>
            <span style={styles.statLabel}>Total Socios</span>
          </div>
          <h2 style={styles.statValue}>{getTotalMembers()}</h2>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'rgb(16, 185, 129)' }}>
              <CheckCircle size={22} />
            </div>
            <span style={styles.statLabel}>Confirmados</span>
          </div>
          <h2 style={styles.statValue}>{getConfirmedMembers()}</h2>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)' }}>
              <Calendar size={22} />
            </div>
            <span style={styles.statLabel}>Reuniões</span>
          </div>
          <h2 style={styles.statValue}>{meetingStats?.totalCount || 0}</h2>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'rgb(245, 158, 11)' }}>
              <CreditCard size={22} />
            </div>
            <span style={styles.statLabel}>Planos Ativos</span>
          </div>
          <h2 style={styles.statValue}>{getActivePlans()}</h2>
        </div>
      </div>

      {/* Timeline Chart */}
      {memberStats && memberStats.timeline && memberStats.timeline.length > 0 && (
        <div className="card" style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>Linha do Tempo - Últimos 12 Meses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberStats.timeline} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                  return `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`;
                }}
              />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelFormatter={(value) => {
                  const [year, month] = value.split('-');
                  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                  return `${monthNames[parseInt(month) - 1]} ${year}`;
                }}
              />
              <Legend />
              <Bar dataKey="entradas" name="Entradas" fill="rgb(16, 185, 129)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saidas" name="Desligamentos" fill="rgb(239, 68, 68)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Content Section: Quick Actions & Status */}
      <div style={styles.contentGrid}>
        {/* Quick Actions */}
        <div className="card" style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>Ações Rápidas</h3>
          <div style={styles.actionsGrid}>
            <button onClick={() => navigate('/members')} style={styles.actionBtn}>
              <UserSearch size={28} style={{ color: 'hsl(var(--primary))' }} />
              <span style={styles.actionLabel}>Buscar Socios</span>
            </button>

            <button onClick={() => navigate('/members/new')} style={styles.actionBtn}>
              <UserPlus size={28} style={{ color: 'rgb(16, 185, 129)' }} />
              <span style={styles.actionLabel}>Novo Socio</span>
            </button>

            <button onClick={() => navigate('/meetings')} style={styles.actionBtn}>
              <CalendarSearch size={28} style={{ color: 'rgb(59, 130, 246)' }} />
              <span style={styles.actionLabel}>Buscar Reuniões</span>
            </button>

            <button onClick={() => navigate('/meetings/new')} style={styles.actionBtn}>
              <CalendarPlus size={28} style={{ color: 'rgb(245, 158, 11)' }} />
              <span style={styles.actionLabel}>Nova Reunião</span>
            </button>
          </div>
        </div>

        {/* Status Distribution */}
        {memberStats && memberStats.byPlan && memberStats.byPlan.length > 0 && (
          <div className="card" style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Socios Ativos por Plano</h3>
            <div style={styles.statusList}>
              {memberStats.byPlan.map((plan: any) => (
                <div key={plan.id} style={styles.statusRow}>
                  <div style={styles.statusInfo}>
                    <div 
                      style={{ 
                        ...styles.statusIndicator, 
                        backgroundColor: 'hsl(var(--primary))'
                      }} 
                    />
                    <span style={styles.statusName}>
                      {plan.name || plan.description || ''}
                    </span>
                  </div>
                  <span style={styles.statusCount}>{plan.count || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'hsl(var(--foreground))',
  },
  date: {
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))',
    marginTop: '0.25rem',
  },
  logoImage: {
    height: '70px',
    width: '70px',
    borderRadius: '12px',
  },
  refreshBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.5rem',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--muted-foreground))',
  },
  statValue: {
    fontSize: '2.25rem',
    fontWeight: 700,
    color: 'hsl(var(--foreground))',
    lineHeight: 1,
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  sectionCard: {
    padding: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: '1.25rem',
    color: 'hsl(var(--foreground))',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  actionBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1.5rem 1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--background))',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  actionLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--foreground))',
  },
  statusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'between',
    padding: '0.75rem 0',
    borderBottom: '1px solid hsl(var(--border))',
  },
  statusInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
  },
  statusIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  statusName: {
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  statusCount: {
    fontSize: '0.9rem',
    fontWeight: 600,
  }
};
