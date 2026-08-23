import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { IMember } from '../../models';
import { memberService } from '../../services/memberService';
import { formatCPF, formatPhone, formatFullDate, formatBirthDateWithAge } from '../../utils/formatters';
import { 
  ArrowLeft, 
  Pencil, 
  User, 
  Calendar, 
  UserRound,
  Church, 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  ShieldAlert,
  Users,
  Award
} from 'lucide-react';
export const MemberShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<IMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMember();
    }
  }, [id]);

  const loadMember = async () => {
    setIsLoading(true);
    if (id) {
      const data = await memberService.getMemberById(id);
      setMember(data);
    }
    setIsLoading(false);
  };

  const handleSendWhatsApp = () => {
    if (member?.mobile) {
      const phone = member.mobile.replace(/\D/g, '');
      window.open(`https://api.whatsapp.com/send?phone=55${phone}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={{ color: 'hsl(var(--primary))' }}></div>
        <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))' }}>Carregando detalhes do socio...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/members" style={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Voltar para busca</span>
          </Link>
        </div>
        <div className="card" style={styles.emptyContainer}>
          <ShieldAlert size={48} style={{ color: 'hsl(var(--destructive))', marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600 }}>Socio não encontrado</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>O ID informado não corresponde a nenhum cadastro.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link to="/members" style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Voltar para busca</span>
        </Link>
      </div>

      {/* Profile summary card */}
      <div className="card" style={styles.profileSummaryCard}>
        <div style={styles.summaryInfo}>
          <h2 style={styles.memberName}>{member.name}</h2>
          <div style={styles.badgeRow}>
            {(() => {
              const statusId = Number(
                member.statusId ?? member.status ?? 0
              );
              let label = member.statusName || member.statusDescription;
              let color = '#000000';
              let bg = '#e2e8f0';

              if (statusId === 1) {
                color = '#dc2626'; // 1 = Vermelho
                bg = '#fee2e2';
                if (!label) label = 'Inativo';
              } else if (statusId === 2) {
                color = '#16a34a'; // 2 = Verde
                bg = '#dcfce7';
                if (!label) label = 'Ativo';
              } else if (statusId === 3) {
                color = '#000000'; // 3 = Preto
                bg = '#e2e8f0';
                if (!label) label = 'Não Sócio';
              } else {
                const text = (label || '').toUpperCase().trim();
                if (text.includes('INATIVO') || text.includes('SUSPENSO')) {
                  color = '#dc2626';
                  bg = '#fee2e2';
                } else if (text.includes('ATIVO')) {
                  color = '#16a34a';
                  bg = '#dcfce7';
                }
              }

              return (
                <span style={{ ...styles.badge, backgroundColor: bg, color, fontWeight: 700 }}>
                  {label || `Status ${statusId}`}
                </span>
              );
            })()}
            {(() => {
              const plan = member.planDescription || member.planName;
              return (
                <span style={styles.badgeSecondary}>{plan || 'Sem plano associado'}</span>
              );
            })()}
            {(() => {
              const region = member.regionDescription || member.regionName;
              return (
                <span style={styles.badgeSecondary}>{region || 'Sem região'}</span>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div style={styles.detailsGrid}>
        {/* Personal info */}
        <div className="card" style={styles.infoCard}>
          <h3 style={styles.infoCardTitle}>Informações Pessoais</h3>
          
          <div style={styles.infoRow}>
            <User size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>CPF</span>
              <span style={styles.infoValue}>{formatCPF(member.cpf || '')}</span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <Calendar size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Data de Nascimento</span>
              <span style={styles.infoValue}>
                {(member.birthday || member.birthDate) 
                  ? formatBirthDateWithAge((member.birthday || member.birthDate) as string) 
                  : 'Não informado'}
              </span>
            </div>
          </div>

          <div style={styles.infoRow}>
            {(() => {
              const rawGender = String(member.genderCode || member.gender || '').toLowerCase().trim();
              const isMale = rawGender === 'm' || rawGender === 'masculino' || rawGender.includes('masc');
              const isFemale = rawGender === 'f' || rawGender === 'feminino' || rawGender.includes('fem');
              const genderLabel = isMale ? 'MASCULINO' : isFemale ? 'FEMININO' : (member.genderCode || member.gender || 'Não informado');
              return (
                <>
                  <UserRound size={18} style={styles.infoIcon} />
                  <div style={styles.infoContent}>
                    <span style={styles.infoLabel}>Gênero</span>
                    <span style={styles.infoValue}>{genderLabel}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Contact info */}
        <div className="card" style={styles.infoCard}>
          <h3 style={styles.infoCardTitle}>Contato</h3>
          
          <div style={styles.infoRow}>
            <Phone size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Telefone</span>
              <span style={styles.infoValue}>
                {(member.mobile || member.phone) 
                  ? formatPhone(member.mobile || member.phone) 
                  : 'Não informado'}
              </span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <Mail size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Email</span>
              <span style={styles.infoValue}>
                {member.email || 'Não informado'}
              </span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <MessageCircle size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>WhatsApp</span>
              <span style={styles.infoValue}>
                {member.whatsappId || member.whatsapp || 'Não informado'}
              </span>
            </div>
          </div>

          {(member.mobile || member.phone) && (
            <button 
              onClick={handleSendWhatsApp} 
              style={styles.whatsappBtn}
            >
              <MessageCircle size={18} />
              <span>Enviar Mensagem WhatsApp</span>
            </button>
          )}
        </div>

        {/* Address */}
        <div className="card" style={styles.infoCard}>
          <h3 style={styles.infoCardTitle}>Endereço</h3>
          
          <div style={styles.infoRow}>
            <MapPin size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Logradouro</span>
              <span style={styles.infoValue}>
                {member.address || 'Não informado'}
              </span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <MapPin size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Bairro</span>
              <span style={styles.infoValue}>
                {member.neighborhood || 'Não informado'}
              </span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <MapPin size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Cidade / UF</span>
              <span style={styles.infoValue}>
                {(member.cityName || member.cityDescription || '') + 
                 ((member.cityName || member.cityDescription) && 
                  (member.stateDescription || member.stateCode) ? ' / ' : '') + 
                  (member.stateDescription || member.stateCode || '') 
                  || 'Não informado'}
              </span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <MapPin size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>CEP</span>
              <span style={styles.infoValue}>
                {member.zipCodeMask || member.zipCode || 'Não informado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Edit button */}
      <div style={styles.footer}>
        <button onClick={() => navigate(`/members/${id}/edit`)} className="btn btn-primary" style={styles.footerBtn}>
          <Pencil size={16} />
          <span>Editar</span>
        </button>
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
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--muted-foreground))',
  },
  actionGroup: {
    display: 'flex',
    gap: '0.75rem',
  },
  profileSummaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '2rem 1.5rem',
  },
  summaryInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  memberName: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  badgeRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  badgeSecondary: {
    padding: '0.25rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: 'hsl(var(--secondary))',
    color: 'hsl(var(--secondary-foreground))',
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
  whatsappBtn: {
    width: '100%',
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: 'var(--radius)',
    backgroundColor: '#25D366',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  },
  modalContent: {
    width: '100%',
    maxWidth: '440px',
    padding: '1.75rem',
    boxShadow: 'var(--shadow-lg)',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '1.5rem',
    borderTop: '1px solid hsl(var(--border))',
  },
  footerBtn: {
    width: '100%',
  }
};
