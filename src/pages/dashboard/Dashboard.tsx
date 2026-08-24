import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Users, 
  UserSearch, 
  UserPlus, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Gift,
  User,
  ChevronDown
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
import { membersApi } from '../../api/members';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { memberStats, loadDashboardData, isLoading } = useAppStore();

  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Birthdays
  const [birthdays, setBirthdays] = useState<Array<{ id: number; name: string; birthday: string; imgPath?: string; imgName?: string; planDescription?: string; regionDescription?: string }>>([]);
  const [birthdayMonth, setBirthdayMonth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboardBirthdayMonth');
      if (saved) return parseInt(saved, 10);
    }
    return new Date().getMonth() + 1;
  });
  const [loadingBirthdays, setLoadingBirthdays] = useState(false);
  const [showBirthdays, setShowBirthdays] = useState(true);

  // Gender counts
  const [genderCounts, setGenderCounts] = useState({ male: 0, female: 0 });
  const [loadingGenderCounts, setLoadingGenderCounts] = useState(false);

  const loadGenderCounts = async () => {
    setLoadingGenderCounts(true);
    try {
      const data = await membersApi.getGenderCounts();
      setGenderCounts(data);
    } catch (error) {
      console.error('Erro ao carregar contagem por gênero:', error);
    } finally {
      setLoadingGenderCounts(false);
    }
  };

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

  // Load birthdays for selected month
  const loadBirthdays = async (month: number) => {
    setLoadingBirthdays(true);
    try {
      const data = await membersApi.getBirthdaysByMonth(month);
      const sorted = [...data].sort((a, b) => {
        const dayA = new Date(a.birthday).getDate();
        const dayB = new Date(b.birthday).getDate();
        return dayA - dayB;
      });
      setBirthdays(sorted);
    } catch (error) {
      console.error('Erro ao carregar aniversariantes:', error);
      setBirthdays([]);
    } finally {
      setLoadingBirthdays(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    loadBirthdays(birthdayMonth);
  }, [birthdayMonth]);

  useEffect(() => {
    loadGenderCounts();
  }, []);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const calculateAge = (birthday: string) => {
    const today = new Date();
    const birth = new Date(birthday);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getBirthdayDay = (birthday: string) => {
    const date = new Date(birthday);
    return date.getDate();
  };

  const changeBirthdayMonth = (month: number) => {
    setBirthdayMonth(month);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardBirthdayMonth', month.toString());
    }
  };

  const [navDirection, setNavDirection] = useState<'prev' | 'next' | null>(null);

  const handleNavClick = (direction: 'prev' | 'next', month: number) => {
    setNavDirection(direction);
    changeBirthdayMonth(month);
    setTimeout(() => setNavDirection(null), 300);
  };

  const getNavButtonStyle = (direction: 'prev' | 'next') => {
    if (navDirection === direction) {
      return direction === 'prev' ? styles.navButtonAnimPrev : styles.navButtonAnimNext;
    }
    return {};
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

      {/* Birthday Carousel */}
      <div className="card" style={styles.birthdaySection}>
        <div style={styles.birthdayHeader}>
          <div style={styles.birthdayTitle}>
            <Gift size={20} style={{ color: 'hsl(var(--primary))' }} />
            <span>Aniversariantes do Mês</span>
            {birthdays.length > 0 && (
              <button 
                onClick={() => setShowBirthdays(!showBirthdays)}
                style={styles.birthdayCountButton}
                aria-label={showBirthdays ? 'Colapsar lista' : 'Expandir lista'}
              >
                <span style={styles.birthdayCountBadge}>{birthdays.length}</span>
                <ChevronDown 
                  size={14} 
                  style={{
                    ...styles.birthdayToggleIcon,
                    transform: showBirthdays ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }} 
                />
              </button>
            )}
          </div>
          <div style={styles.birthdayNav}>
            <button 
              onClick={() => handleNavClick('prev', birthdayMonth === 1 ? 12 : birthdayMonth - 1)}
              style={{
                ...styles.navButton,
                ...getNavButtonStyle('prev'),
              }}
              aria-label="Mês anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={styles.monthLabel}>{monthNames[birthdayMonth - 1]}</span>
            <button 
              onClick={() => handleNavClick('next', birthdayMonth === 12 ? 1 : birthdayMonth + 1)}
              style={{
                ...styles.navButton,
                ...getNavButtonStyle('next'),
              }}
              aria-label="Próximo mês"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        {showBirthdays && (
          <div>
            {loadingBirthdays ? (
              <div style={styles.birthdayLoading}>
                <div className="spinner" style={{ color: 'hsl(var(--primary))' }}></div>
                <p style={{ marginTop: '0.5rem', color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Carregando...</p>
              </div>
            ) : birthdays.length === 0 ? (
              <div style={styles.birthdayEmpty}>
                <Calendar size={32} style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }} />
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Nenhum aniversariante neste mês</p>
              </div>
            ) : (
              <div style={styles.birthdayCarousel}>
                {birthdays.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => navigate(`/members/${member.id}`)}
                    style={styles.birthdayCard}
                  >
                    <div style={styles.birthdayBadgeContainer}>
                      <div style={styles.birthdayBadge}>
                        <span style={styles.birthdayDay}>{getBirthdayDay(member.birthday)}</span>
                        <span style={styles.birthdayMonthShort}>{monthNames[new Date(member.birthday).getMonth()].slice(0, 3)}</span>
                      </div>
                    </div>
                    <div style={styles.birthdayInfo}>
                      <span style={styles.birthdayName}>{member.name}</span>
                      <div style={styles.birthdayDetails}>
                        <span style={styles.birthdayAge}>
                          <span>{calculateAge(member.birthday)}</span> anos
                        </span>
                        {member.planDescription && (
                          <span style={styles.birthdayPlan}>{member.planDescription}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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
            <div style={{ ...styles.iconWrapper, backgroundColor: 'hsla(200, 90%, 50%, 0.1)', color: 'hsl(200, 90%, 50%)' }}>
              <Users size={22} />
            </div>
            <span style={styles.statLabel}>Homens</span>
          </div>
          <h2 style={styles.statValue}>{loadingGenderCounts ? '—' : genderCounts.male}</h2>
        </div>

        <div className="card" style={styles.statCard}>
          <div style={styles.statHeader}>
            <div style={{ ...styles.iconWrapper, backgroundColor: 'hsla(330, 90%, 50%, 0.1)', color: 'hsl(330, 90%, 50%)' }}>
              <Users size={22} />
            </div>
            <span style={styles.statLabel}>Mulheres</span>
          </div>
          <h2 style={styles.statValue}>{loadingGenderCounts ? '—' : genderCounts.female}</h2>
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
  },
  birthdaySection: {
    padding: '1.5rem',
  },
  birthdayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  birthdayTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'hsl(var(--foreground))',
  },
  birthdayCountBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    height: '24px',
    padding: '0 0.5rem',
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  birthdayCountButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '100px',
    transition: 'background-color 0.2s',
  },
  birthdayToggleIcon: {
    color: 'hsl(var(--primary))',
    transition: 'transform 0.2s ease',
  },
  birthdayNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'hsl(var(--secondary))',
    color: 'hsl(var(--secondary-foreground))',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navButtonAnimPrev: {
    transform: 'translateX(-4px) scale(0.95)',
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
  },
  navButtonAnimNext: {
    transform: 'translateX(4px) scale(0.95)',
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
  },
  monthLabel: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'hsl(var(--foreground))',
    minWidth: '100px',
    textAlign: 'center',
  },
  birthdayLoading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '0.5rem',
  },
  birthdayEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '0.5rem',
  },
  birthdayCarousel: {
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto',
    padding: '0.5rem 0.25rem 1rem',
    scrollbarWidth: 'thin',
    scrollbarColor: 'hsl(var(--border)) transparent',
  },
  birthdayCard: {
    flex: '0 0 160px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.25rem 0.75rem',
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  birthdayBadgeContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  birthdayBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary-foreground))',
    borderRadius: 'var(--radius)',
    fontSize: '0.625rem',
    lineHeight: 1,
    fontWeight: 700,
  },
  birthdayDay: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  birthdayMonthShort: {
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    marginTop: '0.125rem',
  },
  birthdayInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    textAlign: 'center',
    width: '100%',
  },
  birthdayName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'hsl(var(--foreground))',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
  },
  birthdayDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
    width: '100%',
  },
  birthdayAge: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'hsl(var(--primary))',
  },
  birthdayPlan: {
    fontSize: '0.7rem',
    color: 'hsl(var(--muted-foreground))',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};
