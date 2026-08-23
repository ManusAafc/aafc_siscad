import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Users, 
  UserSearch, 
  UserPlus, 
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { memberStats, loadDashboardData, isLoading } = useAppStore();

  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const onRefresh = async () => {
    await loadDashboardData();
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling) return;
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    setPullDistance(Math.min(distance * 0.5, 100));
  }, [isPulling]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60) {
      await onRefresh();
    }
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance]);

  const getTotalMembers = () => {
    if (!memberStats) return 0;
    return memberStats.totalCount || 0;
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
    <div 
      ref={containerRef}
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div style={{ ...styles.pullIndicator, height: `${pullDistance}px`, opacity: pullDistance / 100 }}>
          <RefreshCw 
            size={24} 
            className={pullDistance > 60 ? 'spinner' : ''} 
            style={{ 
              transform: `rotate(${pullDistance * 3}deg)`,
              color: pullDistance > 60 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
            }} 
          />
          <span style={{ color: pullDistance > 60 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>
            {pullDistance > 60 ? 'Solte para atualizar' : 'Puxe para baixo'}
          </span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate('/members')} className="btn btn-secondary" style={styles.headerActionBtn}>
            <UserSearch size={18} />
            <span>Buscar Socios</span>
          </button>
          <button onClick={() => navigate('/members/new')} className="btn btn-primary" style={styles.headerActionBtn}>
            <UserPlus size={18} />
            <span>Novo Socio</span>
          </button>
        </div>
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

      </div>

      {/* Timeline Chart */}
      {memberStats && memberStats.timeline && memberStats.timeline.length > 0 && (
        <div className="card" style={styles.sectionCard}>
          <h3 style={styles.sectionTitle}>Linha do Tempo - Últimos 12 Meses</h3>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ width: `${Math.max(memberStats.timeline.length * 80, 600)}px`, height: '300px' }}>
              <BarChart data={memberStats.timeline} width={Math.max(memberStats.timeline.length * 80, 600)} height={300} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    const [year, month] = String(value).split('-');
                    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                    return `${monthNames[parseInt(month) - 1]} ${year}`;
                  }}
                />
                <Legend />
                <Bar dataKey="saidas" name="Desligamentos" fill="rgb(239, 68, 68)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="entradas" name="Entradas" fill="rgb(16, 185, 129)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </div>
          </div>
        </div>
      )}

      {/* Content Section: Status */}
      <div style={styles.contentGrid}>
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
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  headerActionBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  pullIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    overflow: 'hidden',
    transition: 'height 0.2s ease',
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
