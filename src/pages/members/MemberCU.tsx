import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { IMember, IPlan, IRegion, ICity } from '../../models';
import { memberService } from '../../services/memberService';
import { planService } from '../../services/planService';
import { dispatchLoadingStart, dispatchLoadingEnd } from '../../components/common/ButtonLoading';
import { regionService } from '../../services/regionService';
import { cityService } from '../../services/cityService';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

export const MemberCU: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<IMember>>({
    name: '',
    cpf: '',
    birthDate: '',
    gender: '',
    maritalStatus: '',
    baptismStatus: '',
    mobile: '',
    whatsapp: '',
    email: '',
    address: '',
    cityId: undefined,
    regionId: undefined,
    planId: undefined,
    status: 1,
  });

  const [plans, setPlans] = useState<IPlan[]>([]);
  const [regions, setRegions] = useState<IRegion[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (formData.regionId) {
      loadCities(Number(formData.regionId));
    } else {
      setCities([]);
    }
  }, [formData.regionId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plansData, regionsData] = await Promise.all([
        planService.getAllPlans(),
        regionService.getAllRegions(),
      ]);
      setPlans(plansData);
      setRegions(regionsData);

      if (isEditing && id) {
        const member = await memberService.getMemberById(id);
        if (member) {
          // Garante que se houver data de nascimento, venha formatada no padrao YYYY-MM-DD para o input type="date"
          const birthDateFormatted = member.birthDate ? member.birthDate.split('T')[0] : '';
          setFormData({
            ...member,
            birthDate: birthDateFormatted,
          });
        }
      }
    } catch (error) {
      alert('Não foi possível carregar os dados cadastrais.');
    }
    setIsLoading(false);
  };

  const loadCities = async (regionId: number) => {
    try {
      const citiesData = await cityService.getCitiesByRegion(regionId);
      setCities(citiesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

  const handleChange = (field: keyof IMember, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.cpf && !/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF deve conter 11 dígitos';
    }

    if (formData.mobile && !/^\d{10,11}$/.test(formData.mobile.replace(/\D/g, ''))) {
      newErrors.mobile = 'Telefone deve conter 10 ou 11 dígitos';
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
        await memberService.updateMember(id, formData);
        alert('Socio atualizado com sucesso!');
      } else {
        await memberService.createMember(formData);
        alert('Socio criado com sucesso!');
      }
      navigate('/members');
    } catch (error) {
      alert('Não foi possível salvar o socio.');
    }
    setIsSaving(false);
    dispatchLoadingEnd();
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" style={{ color: 'hsl(var(--primary))' }}></div>
        <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))' }}>Carregando dados cadastrais...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Link to={isEditing ? `/members/${id}` : '/members'} style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Cancelar</span>
        </Link>
        <h1 style={styles.title}>{isEditing ? 'Editar Socio' : 'Novo Socio'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card" style={styles.formCard}>
        {/* Pessoal */}
        <h3 style={styles.sectionTitle}>Informações Pessoais</h3>
        <div style={styles.formGrid}>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label" htmlFor="name">Nome Completo</label>
            <input
              id="name"
              type="text"
              className="input-control"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nome completo do socio"
              required
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="cpf">CPF</label>
            <input
              id="cpf"
              type="text"
              className="input-control"
              value={formData.cpf || ''}
              onChange={(e) => handleChange('cpf', e.target.value)}
              placeholder="Apenas números (11 dígitos)"
              maxLength={14}
            />
            {errors.cpf && <span style={styles.errorText}>{errors.cpf}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="birthDate">Data de Nascimento</label>
            <input
              id="birthDate"
              type="date"
              className="input-control"
              value={formData.birthDate || ''}
              onChange={(e) => handleChange('birthDate', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="gender">Gênero</label>
            <select
              id="gender"
              className="input-control"
              value={formData.gender || ''}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="">Selecione o gênero</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="maritalStatus">Estado Civil</label>
            <select
              id="maritalStatus"
              className="input-control"
              value={formData.maritalStatus || ''}
              onChange={(e) => handleChange('maritalStatus', e.target.value)}
            >
              <option value="">Selecione o estado civil</option>
              <option value="Solteiro(a)">Solteiro(a)</option>
              <option value="Casado(a)">Casado(a)</option>
              <option value="Divorciado(a)">Divorciado(a)</option>
              <option value="Viúvo(a)">Viúvo(a)</option>
              <option value="União Estável">União Estável</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="baptismStatus">Batismo</label>
            <select
              id="baptismStatus"
              className="input-control"
              value={formData.baptismStatus || ''}
              onChange={(e) => handleChange('baptismStatus', e.target.value)}
            >
              <option value="">Selecione o status</option>
              <option value="Batizado">Batizado</option>
              <option value="Não Batizado">Não Batizado</option>
              <option value="Em Catequese">Em Catequese</option>
            </select>
          </div>
        </div>

        {/* Contato */}
        <h3 style={styles.sectionTitle}>Informações de Contato</h3>
        <div style={styles.formGrid}>
          <div className="input-group">
            <label className="input-label" htmlFor="mobile">Celular</label>
            <input
              id="mobile"
              type="text"
              className="input-control"
              value={formData.mobile || ''}
              onChange={(e) => handleChange('mobile', e.target.value)}
              placeholder="(00) 00000-0000"
            />
            {errors.mobile && <span style={styles.errorText}>{errors.mobile}</span>}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="whatsapp">WhatsApp</label>
            <input
              id="whatsapp"
              type="text"
              className="input-control"
              value={formData.whatsapp || ''}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input-control"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="nome@exemplo.com"
            />
          </div>
        </div>

        {/* Endereço */}
        <h3 style={styles.sectionTitle}>Endereço</h3>
        <div style={styles.formGrid}>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label" htmlFor="address">Endereço Completo</label>
            <input
              id="address"
              type="text"
              className="input-control"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Rua, número, complemento, bairro"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="regionId">Região</label>
            <select
              id="regionId"
              className="input-control"
              value={formData.regionId || ''}
              onChange={(e) => handleChange('regionId', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Selecione a região</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name || r.description}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="cityId">Cidade</label>
            <select
              id="cityId"
              className="input-control"
              value={formData.cityId || ''}
              onChange={(e) => handleChange('cityId', e.target.value ? Number(e.target.value) : undefined)}
              disabled={!formData.regionId}
            >
              <option value="">Selecione a cidade</option>
              {cities.map((c) => (
                <option key={c.cityId} value={c.cityId}>{c.name || c.cityDescription}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Plano & Status */}
        <h3 style={styles.sectionTitle}>Plano & Status</h3>
        <div style={styles.formGrid}>
          <div className="input-group">
            <label className="input-label" htmlFor="planId">Plano Associado</label>
            <select
              id="planId"
              className="input-control"
              value={formData.planId || ''}
              onChange={(e) => handleChange('planId', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Selecione o plano</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.name || p.description}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="status">Status</label>
            <select
              id="status"
              className="input-control"
              value={formData.status || 1}
              onChange={(e) => handleChange('status', Number(e.target.value))}
            >
              <option value={1}>Ativo</option>
              <option value={2}>Pendente</option>
              <option value={3}>Inativo</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div style={styles.actionsContainer}>
          <button 
            type="button" 
            onClick={() => navigate(isEditing ? `/members/${id}` : '/members')} 
            className="btn btn-secondary"
            style={{ flex: 1 }}
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
                {isEditing ? <Save size={18} /> : <UserPlus size={18} />}
                <span>{isEditing ? 'Salvar Alterações' : 'Criar Socio'}</span>
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
    marginTop: '1.5rem',
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
