import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMemberStore } from '../../store/useMemberStore';
import { formatCPF } from '../../utils/formatters';
import { meetingMemberService } from '../../services/meetingMemberService';
import { ArrowLeft, Search, UserPlus, User, RefreshCw } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export const MeetingMemberAdd: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const {
    searchResults,
    isLoading,
    searchMembers,
  } = useMemberStore();

  useEffect(() => {
    searchMembers('');
  }, [searchMembers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchMembers(value);
  };

  const handleAddMember = async (memberId: string) => {
    if (!id) return;
    setIsAdding(memberId);
    try {
      await meetingMemberService.addMemberToMeeting(id, memberId);
      addToast('Socio adicionado à reunião com sucesso!', 'success');
      navigate(`/meetings/${id}`);
    } catch (error) {
      addToast('Não foi possível adicionar o socio à reunião.', 'error');
    }
    setIsAdding(null);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link to={`/meetings/${id}`} style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Voltar para reunião</span>
        </Link>
        <h1 style={styles.title}>Adicionar Socio</h1>
        <p style={styles.subtitle}>Selecione o socio para adicionar à reunião</p>
      </div>

      {/* Control bar */}
      <div className="card" style={styles.controlsCard}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            className="input-control"
            style={styles.searchInput}
            placeholder="Pesquisar por nome ou CPF..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Results */}
      {isLoading && searchResults.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div className="spinner" style={{ color: 'hsl(var(--primary))' }}></div>
          <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))' }}>Carregando socios...</p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="card" style={styles.emptyContainer}>
          <User size={48} style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600 }}>Nenhum socio encontrado</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Tente pesquisar com outros termos</p>
        </div>
      ) : (
        <div style={styles.list}>
          {searchResults.map((member) => (
            <div key={member.id} className="card" style={styles.memberCard}>
              <div style={styles.memberAvatar}>
                <User size={20} style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <div style={styles.memberInfo}>
                <h3 style={styles.memberName}>{member.name || 'Sem nome'}</h3>
                <div style={styles.memberDetailsRow}>
                  <span>CPF: {member.cpf ? formatCPF(member.cpf) : 'Sem CPF'}</span>
                  <span style={styles.bullet}>•</span>
                  <span>{member.statusName || 'N/A'}</span>
                </div>
              </div>
              
              <button 
                onClick={() => handleAddMember(member.id?.toString() || '')}
                className="btn btn-primary"
                style={styles.addBtn}
                disabled={isAdding !== null}
              >
                {isAdding === member.id?.toString() ? (
                  <RefreshCw size={16} className="spinner" />
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Adicionar</span>
                  </>
                )}
              </button>
            </div>
          ))}
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
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--muted-foreground))',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))',
  },
  controlsCard: {
    padding: '1.25rem',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    color: 'hsl(var(--muted-foreground))',
  },
  searchInput: {
    paddingLeft: '2.5rem',
    width: '100%',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  memberCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.25rem',
  },
  memberAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: 'hsla(var(--primary), 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '1rem',
  },
  memberInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  memberName: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'hsl(var(--foreground))',
  },
  memberDetailsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'hsl(var(--muted-foreground))',
  },
  bullet: {
    color: 'hsl(var(--border))',
  },
  addBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }
};
