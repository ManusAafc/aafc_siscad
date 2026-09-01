import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { formatFullDate } from '../../utils/formatters';
import { Search, CalendarPlus, ChevronRight, Calendar, MapPin, Filter, X } from 'lucide-react';
import { meetingService } from '../../services/meetingService';

export const MeetingsSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const {
    searchResults,
    searchTotal,
    isLoading,
    searchMeetings,
    searchMeetingsWithFilters,
  } = useMeetingStore();

  const [meetingTypes, setMeetingTypes] = useState<{ id: number; code: string; description: string }[]>([]);

  useEffect(() => {
    loadMeetingTypes();
    searchMeetings('');
  }, [searchMeetings]);

  const loadMeetingTypes = async () => {
    try {
      const data = await meetingService.getMeetingById('1'); // placeholder to load types
      // The types would come from a types API or we can hardcode common ones
    } catch {
      // ignore
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (selectedTypeId) {
      searchMeetingsWithFilters({ searchTerms: value, typeIdsList: [selectedTypeId] });
    } else {
      searchMeetings(value);
    }
  };

  const handleTypeFilter = (typeId: number | undefined) => {
    setSelectedTypeId(typeId);
    if (typeId) {
      searchMeetingsWithFilters({ searchTerms: searchTerm, typeIdsList: [typeId] });
    } else {
      searchMeetings(searchTerm);
    }
  };

  const clearFilters = () => {
    setSelectedTypeId(undefined);
    searchMeetings(searchTerm);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Buscar Reuniões</h1>
          <p style={styles.subtitle}>{searchTotal} reuniões encontradas</p>
        </div>
        <button 
          onClick={() => navigate('/meetings/new')} 
          className="btn btn-primary"
          style={styles.newBtn}
        >
          <CalendarPlus size={18} />
          <span>Nova Reunião</span>
        </button>
      </div>

      {/* Control bar */}
      <div className="card" style={styles.controlsCard}>
        <div style={styles.filtersRow}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              className="input-control"
              style={styles.searchInput}
              placeholder="Pesquisar por título ou local..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div style={styles.filterWrapper}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
              style={styles.filterBtn}
            >
              <Filter size={16} />
              <span>Filtros</span>
              {selectedTypeId && <X size={14} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filterSection}>
              <label style={styles.filterLabel}>Tipo de OS/SS</label>
              <select
                className="input-control"
                value={selectedTypeId || ''}
                onChange={(e) => handleTypeFilter(e.target.value ? Number(e.target.value) : undefined)}
                style={{ width: '100%' }}
              >
                <option value="">Todos os tipos</option>
                <option value={1}>Ordem de Serviço (OS)</option>
                <option value={2}>Serviço Social (SS)</option>
                <option value={3}>SS Não Programada</option>
              </select>
            </div>
            {selectedTypeId && (
              <button onClick={clearFilters} className="btn btn-secondary" style={styles.clearBtn}>
                <X size={14} />
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading && searchResults.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div className="spinner" style={{ color: 'hsl(var(--primary))' }}></div>
          <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))' }}>Carregando reuniões...</p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="card" style={styles.emptyContainer}>
          <Calendar size={48} style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600 }}>Nenhuma reunião encontrada</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Tente pesquisar com outros termos</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {searchResults.map((meeting) => (
            <div 
              key={meeting.id} 
              className="card" 
              style={styles.meetingCard}
              onClick={() => navigate(`/meetings/${meeting.id}`)}
            >
              <div style={styles.meetingIcon}>
                <Calendar size={24} style={{ color: 'rgb(59, 130, 246)' }} />
              </div>
              <div style={styles.meetingInfo}>
                <h3 style={styles.meetingTitle}>{meeting.title || 'Sem título'}</h3>
                <div style={styles.meetingDetailsRow}>
                  <span>{meeting.meetingDate ? formatFullDate(meeting.meetingDate) : 'Data não definida'}</span>
                  <span style={styles.bullet}>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={14} />
                    {meeting.cityName || 'Local não definido'}
                  </span>
                </div>
              </div>
              <div style={styles.meetingStatus}>
                <span 
                  style={{
                    ...styles.badge,
                    backgroundColor: meeting.statusId === 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: meeting.statusId === 1 ? 'rgb(16, 185, 129)' : 'rgb(245, 158, 11)',
                  }}
                >
                  {meeting.status || 'N/A'}
                </span>
                <ChevronRight size={20} style={{ color: 'hsl(var(--muted-foreground))', marginLeft: '0.5rem' }} />
              </div>
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
    gap: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))',
  },
  newBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  controlsCard: {
    padding: '1.25rem',
  },
  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  filterWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 0.875rem',
    fontSize: '0.875rem',
  },
  filtersPanel: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1rem',
    flexWrap: 'wrap',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid hsl(var(--border))',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  filterLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'hsl(var(--muted-foreground))',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 0.875rem',
    fontSize: '0.875rem',
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
  meetingCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  meetingIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '1rem',
  },
  meetingInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  meetingTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'hsl(var(--foreground))',
  },
  meetingDetailsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'hsl(var(--muted-foreground))',
    flexWrap: 'wrap',
  },
  bullet: {
    color: 'hsl(var(--border))',
  },
  meetingStatus: {
    display: 'flex',
    alignItems: 'center',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: 600,
  }
};
