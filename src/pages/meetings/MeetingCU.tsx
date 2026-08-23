import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { IMeeting, IMeetingCity, IMeetingPlan } from '../../models';
import { meetingService } from '../../services/meetingService';
import { ArrowLeft, Save, CalendarPlus } from 'lucide-react';
import { dispatchLoadingStart, dispatchLoadingEnd } from '../../components/common/ButtonLoading';

export const MeetingCU: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<IMeeting>>({
    title: '',
    meetingDate: '',
    cityId: undefined,
    planId: undefined,
    status: 'Pendente',
  });

  const [meetingCities, setMeetingCities] = useState<IMeetingCity[]>([]);
  const [meetingPlans, setMeetingPlans] = useState<IMeetingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [citiesData, plansData] = await Promise.all([
        meetingService.getMeetingCities(id || '0'),
        meetingService.getMeetingPlans(id || '0'),
      ]);
      setMeetingCities(citiesData);
      setMeetingPlans(plansData);

      if (isEditing && id) {
        const meetingData = await meetingService.getMeetingById(id);
        if (meetingData) {
          // Formata a data para YYYY-MM-DDTHH:MM para o input type="datetime-local"
          const dateFormatted = meetingData.meetingDate ? meetingData.meetingDate.slice(0, 16) : '';
          setFormData({
            ...meetingData,
            meetingDate: dateFormatted,
          });
        }
      }
    } catch (error) {
      alert('Não foi possível carregar os dados cadastrais.');
    }
    setIsLoading(false);
  };

  const handleChange = (field: keyof IMeeting, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.meetingDate) {
      newErrors.meetingDate = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    dispatchLoadingStart();
    try {
      if (isEditing && id) {
        await meetingService.updateMeeting(id, formData);
        alert('Reunião atualizada com sucesso!');
        navigate(`/meetings/${id}`);
      } else {
        await meetingService.createMeeting(formData);
        alert('Reunião criada com sucesso!');
        navigate('/meetings');
      }
    } catch (error) {
      alert('Não foi possível salvar a reunião.');
    }
    setIsSaving(false);
    dispatchLoadingEnd();
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={{ color: 'hsl(var(--primary))' }}></div>
        <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))' }}>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link to={isEditing ? `/meetings/${id}` : '/meetings'} style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Cancelar</span>
        </Link>
        <h1 style={styles.title}>{isEditing ? 'Editar Reunião' : 'Nova Reunião'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card" style={styles.formCard}>
        <h3 style={styles.sectionTitle}>Informações da Reunião</h3>
        
        <div style={styles.formGrid}>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label" htmlFor="title">Título da Reunião</label>
            <input
              id="title"
              type="text"
              className="input-control"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Assembleia Geral Extraordinária"
              required
            />
            {errors.title && <span style={styles.errorText}>{errors.title}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="meetingDate">Data e Horário</label>
            <input
              id="meetingDate"
              type="datetime-local"
              className="input-control"
              value={formData.meetingDate || ''}
              onChange={(e) => handleChange('meetingDate', e.target.value)}
              required
            />
            {errors.meetingDate && <span style={styles.errorText}>{errors.meetingDate}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="cityId">Cidade / Local</label>
            <select
              id="cityId"
              className="input-control"
              value={formData.cityId || ''}
              onChange={(e) => handleChange('cityId', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Selecione a cidade</option>
              {meetingCities.map((c) => (
                <option key={c.cityId} value={c.cityId}>
                  {c.cityName || c.cityDescription || 'Sem nome'}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="planId">Plano Vinculado</label>
            <select
              id="planId"
              className="input-control"
              value={formData.planId || ''}
              onChange={(e) => handleChange('planId', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Selecione o plano</option>
              {meetingPlans.map((p) => (
                <option key={p.planId} value={p.planId}>
                  {p.planName || p.planDescription || 'Sem nome'}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="status">Status</label>
            <select
              id="status"
              className="input-control"
              value={formData.status || 'Pendente'}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="Pendente">Pendente</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Realizada">Realizada</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div style={styles.actionsContainer}>
          <button 
            type="button" 
            onClick={() => navigate(isEditing ? `/meetings/${id}` : '/meetings')} 
            className="btn"
            style={{ flex: 1, backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
          >
            Cancelar
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ flex: 2 }}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="spinner" style={{ width: '1.25rem', height: '1.25rem' }}></div>
            ) : (
              <>
                {isEditing ? <Save size={18} /> : <CalendarPlus size={18} />}
                <span>{isEditing ? 'Salvar Alterações' : 'Criar Reunião'}</span>
              </>
            )}
          </button>
        </div>
      </form>
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
    alignItems: 'center',
    gap: '1.5rem',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--muted-foreground))',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  formCard: {
    padding: '2rem 1.5rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: '1rem',
    borderBottom: '1px solid hsl(var(--border))',
    paddingBottom: '0.5rem',
    color: 'hsl(var(--foreground))',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem',
  },
  errorText: {
    fontSize: '0.75rem',
    color: 'hsl(var(--destructive))',
    marginTop: '0.25rem',
  },
  actionsContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2.5rem',
  }
};
