import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { IMeeting, IMeetingMember } from '../../models';
import { meetingService } from '../../services/meetingService';
import { meetingMemberService } from '../../services/meetingMemberService';
import { formatFullDate } from '../../utils/formatters';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Calendar, 
  MapPin, 
  FileText, 
  User, 
  UserPlus, 
  Check, 
  CheckCircle, 
  Circle, 
  X,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { dispatchLoadingStart, dispatchLoadingEnd } from '../../components/common/ButtonLoading';

export const MeetingShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<IMeeting | null>(null);
  const [members, setMembers] = useState<IMeetingMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadMeeting();
    }
  }, [id]);

  const loadMeeting = async () => {
    setIsLoading(true);
    if (id) {
      const [meetingData, membersData] = await Promise.all([
        meetingService.getMeetingById(id),
        meetingMemberService.getMeetingMembers(id),
      ]);
      setMeeting(meetingData);
      setMembers(membersData.data);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (id) {
      setIsDeleting(true);
      dispatchLoadingStart();
      try {
        await meetingService.deleteMeeting(id);
        navigate('/meetings');
      } catch (error) {
        alert('Não foi possível excluir a reunião.');
      } finally {
        setIsDeleting(false);
        dispatchLoadingEnd();
      }
    }
    setShowDeleteModal(false);
  };

  const handleConfirmParticipation = async (meetingMemberId: string) => {
    setActionLoadingId(meetingMemberId);
    try {
      await meetingMemberService.confirmParticipation(meetingMemberId, 1);
      loadMeeting();
    } catch (error) {
      alert('Não foi possível confirmar participação.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRegisterParticipation = async (meetingMemberId: string, participated: boolean) => {
    setActionLoadingId(meetingMemberId);
    try {
      await meetingMemberService.registerParticipation(meetingMemberId, participated);
      loadMeeting();
    } catch (error) {
      alert('Não foi possível registrar participação.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveMember = async (meetingMemberId: string) => {
    if (confirm('Tem certeza que deseja remover este socio da reunião?')) {
      setActionLoadingId(meetingMemberId);
      try {
        await meetingMemberService.removeMemberFromMeeting(meetingMemberId);
        loadMeeting();
      } catch (error) {
        alert('Não foi possível remover o socio.');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={{ color: 'hsl(var(--primary))' }}></div>
        <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))' }}>Carregando detalhes da reunião...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <Link to="/meetings" style={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Voltar para reuniões</span>
          </Link>
        </div>
        <div className="card" style={styles.emptyContainer}>
          <ShieldAlert size={48} style={{ color: 'hsl(var(--destructive))', marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600 }}>Reunião não encontrada</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>O ID informado não corresponde a nenhuma reunião.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link to="/meetings" style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Voltar para reuniões</span>
        </Link>

        <div style={styles.actionGroup}>
          <button onClick={() => navigate(`/meetings/${id}/edit`)} className="btn btn-secondary">
            <Pencil size={16} />
            <span>Editar</span>
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="btn btn-secondary" style={{ color: 'hsl(var(--destructive))', borderColor: 'hsla(var(--destructive), 0.2)' }}>
            <Trash2 size={16} />
            <span>Excluir</span>
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="card" style={styles.infoCard}>
        <h2 style={styles.meetingTitle}>{meeting.title}</h2>
        
        <div style={styles.infoGrid}>
          <div style={styles.infoRow}>
            <Calendar size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Data e Horário</span>
              <span style={styles.infoValue}>
                {meeting.meetingDate ? formatFullDate(meeting.meetingDate) : 'Não definida'}
              </span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <MapPin size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Local</span>
              <span style={styles.infoValue}>{meeting.cityName || 'Não definido'}</span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <FileText size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Plano</span>
              <span style={styles.infoValue}>{meeting.planName || 'Não definido'}</span>
            </div>
          </div>

          <div style={styles.infoRow}>
            <User size={18} style={styles.infoIcon} />
            <div style={styles.infoContent}>
              <span style={styles.infoLabel}>Inserido por</span>
              <span style={styles.infoValue}>{meeting.memberInsertName || 'Não informado'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div style={styles.membersSection}>
        <div style={styles.membersHeader}>
          <h3 style={styles.sectionTitle}>Socios Participantes ({members.length})</h3>
          <button 
            onClick={() => navigate(`/meetings/${id}/add-member`)} 
            className="btn btn-primary"
            style={styles.addBtn}
          >
            <UserPlus size={16} />
            <span>Adicionar</span>
          </button>
        </div>

        {members.length === 0 ? (
          <div className="card" style={styles.emptyContainer}>
            <User size={40} style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }} />
            <h4 style={{ fontWeight: 600 }}>Nenhum socio adicionado</h4>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Adicione socios para participar desta reunião.</p>
          </div>
        ) : (
          <div style={styles.membersList}>
            {members.map((item) => (
              <div key={item.id} className="card" style={styles.memberCard}>
                <div style={styles.memberInfoCol}>
                  <div style={styles.avatarMini}>
                    <User size={18} />
                  </div>
                  <div style={styles.memberMeta}>
                    <span style={styles.memberName}>{item.memberName}</span>
                    <span style={styles.memberStatus}>{item.statusName || 'N/A'}</span>
                  </div>
                </div>

                <div style={styles.memberActions}>
                  {/* Confirmar Presença */}
                  {!item.confirmed && (
                    <button 
                      onClick={() => handleConfirmParticipation(item.id.toString())}
                      disabled={actionLoadingId === item.id.toString()}
                      style={{ ...styles.actionBtn, color: 'rgb(16, 185, 129)' }}
                      title="Confirmar Presença"
                    >
                      {actionLoadingId === item.id.toString() ? <RefreshCw size={18} className="spinner" /> : <Check size={18} />}
                    </button>
                  )}

                  {/* Participou (Toggle) */}
                  <button 
                    onClick={() => handleRegisterParticipation(item.id.toString(), item.participated !== 1)}
                    disabled={actionLoadingId === item.id.toString()}
                    style={{ 
                      ...styles.actionBtn, 
                      color: item.participated === 1 ? 'rgb(16, 185, 129)' : 'hsl(var(--muted-foreground))' 
                    }}
                    title={item.participated === 1 ? "Marcar Ausência" : "Marcar Presença"}
                  >
                    {actionLoadingId === item.id.toString() ? <RefreshCw size={18} className="spinner" /> : item.participated === 1 ? <CheckCircle size={18} /> : <Circle size={18} />}
                  </button>

                  {/* Remover da reunião */}
                  <button 
                    onClick={() => handleRemoveMember(item.id.toString())}
                    disabled={actionLoadingId === item.id.toString()}
                    style={{ ...styles.actionBtn, color: 'hsl(var(--destructive))' }}
                    title="Remover"
                  >
                    {actionLoadingId === item.id.toString() ? <RefreshCw size={18} className="spinner" /> : <X size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className="card" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Confirmar Exclusão</h3>
            <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
              Tem certeza que deseja excluir permanentemente a reunião <strong>{meeting.title}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleDelete} className="btn btn-primary" style={{ backgroundColor: 'hsl(var(--destructive))', color: '#fff' }} disabled={isDeleting}>
                {isDeleting ? <RefreshCw size={16} className="spinner" /> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
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
  infoCard: {
    padding: '2rem 1.5rem',
  },
  meetingTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    color: 'hsl(var(--foreground))',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
  },
  infoRow: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
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
  membersSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
  },
  membersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1.5rem',
    textAlign: 'center',
  },
  membersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  memberCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
  },
  memberInfoCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
  },
  avatarMini: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'hsl(var(--secondary))',
    color: 'hsl(var(--secondary-foreground))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberMeta: {
    display: 'flex',
    flexDirection: 'column',
  },
  memberName: {
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  memberStatus: {
    fontSize: '0.75rem',
    color: 'hsl(var(--muted-foreground))',
  },
  memberActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.5rem',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
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
  }
};
