import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Settings,
  Users,
  MessageCircle
} from 'lucide-react';
import { formatENDateToBR } from '../../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuthStore();

  const getRoleLabel = () => {
    if (user.isAdminSuper) return 'Super Admin';
    if (user.isAdmin) return 'Admin';
    return 'Socio';
  };

  const getRoleColor = () => {
    if (user.isAdminSuper) return { bg: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' };
    if (user.isAdmin) return { bg: 'hsla(24, 95%, 53%, 0.1)', color: 'hsl(24, 95%, 53%)' };
    return { bg: 'hsla(var(--muted-foreground), 0.1)', color: 'hsl(var(--muted-foreground))' };
  };

  const roleStyle = getRoleColor();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link to="/" style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Voltar</span>
        </Link>
      </div>

      {/* Profile Summary Card */}
      <div className="card" style={styles.profileSummaryCard}>
        <div style={styles.avatarLarge}>
          <User size={36} />
        </div>
        <div style={styles.summaryInfo}>
          <h1 style={styles.userName}>{user.nameFull || user.nameShort || 'Usuario'}</h1>
          <p style={styles.userEmail}>{user.email}</p>
          <div style={styles.badgeRow}>
            <span style={{ ...styles.badge, backgroundColor: roleStyle.bg, color: roleStyle.color }}>
              <Shield size={12} />
              {getRoleLabel()}
            </span>
            <span style={{ ...styles.badge, backgroundColor: user.statusId === 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: user.statusId === 1 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)' }}>
              {user.statusId === 1 ? <CheckCircle size={12} /> : <XCircle size={12} />}
              {user.statusId === 1 ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div style={styles.detailsGrid}>
        {/* Dados Pessoais */}
        <div className="card" style={styles.infoCard}>
          <h3 style={styles.infoCardTitle}>Dados Pessoais</h3>
          
          <div style={styles.infoRow}>
            <User size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Nome Completo</span>
              <span style={styles.infoValue}>{user.nameFull || '-'}</span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <User size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Nome Curto</span>
              <span style={styles.infoValue}>{user.nameShort || '-'}</span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <Mail size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Email</span>
              <span style={styles.infoValue}>{user.email || '-'}</span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <Phone size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Celular</span>
              <span style={styles.infoValue}>{user.mobileMask || user.mobile || '-'}</span>
            </div>
          </div>
        </div>

        {/* Permissoes */}
        <div className="card" style={styles.infoCard}>
          <h3 style={styles.infoCardTitle}>Permissoes</h3>
          
          <div style={styles.infoRow}>
            <Shield size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Perfil de Acesso</span>
              <span style={styles.infoValue}>{getRoleLabel()}</span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <Users size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Gerenciar Socios</span>
              <span style={{ ...styles.infoValue, color: user.isManagerMembers ? 'rgb(16, 185, 129)' : 'hsl(var(--muted-foreground))' }}>
                {user.isManagerMembers ? 'Sim' : 'Nao'}
              </span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <Calendar size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Gerenciar Reunioes</span>
              <span style={{ ...styles.infoValue, color: user.isManagerMeetings ? 'rgb(16, 185, 129)' : 'hsl(var(--muted-foreground))' }}>
                {user.isManagerMeetings ? 'Sim' : 'Nao'}
              </span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <Settings size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Acesso Ajustes</span>
              <span style={{ ...styles.infoValue, color: user.isAdminSuper ? 'rgb(16, 185, 129)' : 'hsl(var(--muted-foreground))' }}>
                {user.isAdminSuper ? 'Sim' : 'Nao'}
              </span>
            </div>
          </div>
        </div>

        {/* Conta */}
        <div className="card" style={styles.infoCard}>
          <h3 style={styles.infoCardTitle}>Conta</h3>
          
          <div style={styles.infoRow}>
            <MessageCircle size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>WhatsApp</span>
              <span style={styles.infoValue}>{user.mobileWhatsapp || '-'}</span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <Calendar size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Membro desde</span>
              <span style={styles.infoValue}>{formatENDateToBR(user.createdAt) || '-'}</span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <Calendar size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Ultima atualizacao</span>
              <span style={styles.infoValue}>{formatENDateToBR(user.updatedAt) || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--muted-foreground))',
  },
  profileSummaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '2rem 1.5rem',
  },
  avatarLarge: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: 'hsla(var(--primary), 0.1)',
    color: 'hsl(var(--primary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  summaryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  userName: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  userEmail: {
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))',
  },
  badgeRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginTop: '0.25rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  infoCard: {
    padding: '1.5rem',
  },
  infoCardTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '1.25rem',
    borderBottom: '1px solid hsl(var(--border))',
    paddingBottom: '0.5rem',
  },
  infoRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    padding: '0.75rem 0',
    borderBottom: '1px solid hsla(var(--border), 0.5)',
  },
  infoIcon: {
    color: 'hsl(var(--muted-foreground))',
    marginTop: '0.15rem',
  },
  infoContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: 'hsl(var(--muted-foreground))',
  },
  infoValue: {
    fontSize: '0.95rem',
    fontWeight: 500,
  },
};
