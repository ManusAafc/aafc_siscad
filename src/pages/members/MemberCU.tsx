import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { IMember, IPlan, ICity, IGender, IMemberStatus } from '../../models';
import { memberService } from '../../services/memberService';
import { planService } from '../../services/planService';
import { genderService } from '../../services/genderService';
import { statusService } from '../../services/statusService';
import { dispatchLoadingStart, dispatchLoadingEnd } from '../../components/common/ButtonLoading';
import { cityService } from '../../services/cityService';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { formatCEP, formatMobile, formatCPF } from '../../utils/formatters';

function isoToDateInput(iso: string | undefined): string {
  if (!iso) return '';
  return iso.split('T')[0];
}

function dateInputToIso(dateStr: string): string {
  if (!dateStr) return '';
  return `${dateStr}T00:00:00`;
}

function toDisplayDate(iso: string | undefined): string {
  if (!iso) return '';
  const parts = iso.split('T')[0].split('-');
  if (parts.length !== 3) return '';
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export const MemberCU: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Partial<IMember>>({
    name: '',
    cpf: '',
    birthDate: '',
    gender: '',
    mobile: '',
    email: '',
    address: '',
    neighborhood: '',
    zipCode: '',
    cityId: undefined,
    planId: undefined,
    status: undefined,
    dateAafcStart: '',
    dateAafcEnd: '',
    statusReasonDescription: '',
  });

  const [plans, setPlans] = useState<IPlan[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [genders, setGenders] = useState<IGender[]>([]);
  const [statuses, setStatuses] = useState<IMemberStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plansData, gendersData, statusesData] = await Promise.all([
        planService.getAllPlans(),
        genderService.getAllGenders(),
        statusService.getAllStatuses(),
      ]);
      setPlans(plansData);
      setGenders(gendersData);
      setStatuses(statusesData);

      if (isEditing && id) {
        const member = await memberService.getMemberById(id);
        if (member) {
          // Mapeia genderId do banco para a descrição do genders table
          // Usa gendersData local (ja carregado) em vez do state genders
          let genderValue = '';
          const genderId = member.genderId;
          if (genderId) {
            const foundGender = gendersData.find((g) => g.id === genderId);
            if (foundGender) {
              genderValue = foundGender.description;
            }
          }
          
          // Mapeia os campos da API para os campos do formulario (suporta camelCase e snake_case do banco)
          const birthDateFormatted = (member.birthday || member.birthDate || '').split('T')[0];
          
          const statusId = member.statusId ?? member.status ?? 1;
          
          setFormData({
            name: member.name || '',
            cpf: member.cpfMask || member.cpf || '',
            birthDate: birthDateFormatted,
            gender: genderValue,
            mobile: member.mobileMask || member.mobile || '',
            email: member.email || '',
            address: member.address || '',
            neighborhood: member.neighborhood || '',
            zipCode: member.zipCodeMask || member.zipCode || '',
            cityId: member.cityId,
            planId: member.planId,
            status: statusId,
            dateAafcStart: isoToDateInput(member.dateAafcStart),
            dateAafcEnd: isoToDateInput(member.dateAafcEnd),
            statusReasonDescription: member.statusReasonDescription || '',
          });
        }
      }
    } catch (error) {
      alert('Não foi possível carregar os dados cadastrais.');
    }
    setIsLoading(false);
  };

  const loadAllCities = async () => {
    try {
      const citiesData = await cityService.getAllCities();
      setCities(citiesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadAllCities();
  }, []);

  const handleChange = (field: keyof IMember, value: any) => {
    // Aplica mascara de CEP ao digitar
    let formattedValue = value;
    if (field === 'zipCode') {
      formattedValue = formatCEP(value);
    }
    if (field === 'mobile') {
      formattedValue = formatMobile(value);
    }
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    }
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
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

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    // Prepara dados para envio ao banco (mapeia campos do formulario para colunas da tabela)
    const cpfNumbers = (formData.cpf || '').replace(/\D/g, '');
    const mobileNumbers = (formData.mobile || '').replace(/\D/g, '');
    const zipNumbers = (formData.zipCode || '').replace(/\D/g, '');

    const mobileDDI = mobileNumbers ? `55${mobileNumbers}` : '';
    const whatsappId = mobileNumbers && mobileNumbers.length === 11 
      ? `${mobileDDI.substring(0, 4)}${mobileDDI.substring(5)}@s.whatsapp.net` 
      : '';

    const submitData = {
      ...formData,
      // CPF
      cpf_mask: formData.cpf,
      cpf: cpfNumbers || undefined,
      // Celular
      mobile_mask: formData.mobile,
      mobile: mobileNumbers || undefined,
      mobile_ddi: mobileDDI || undefined,
      whatsapp_id: whatsappId || undefined,
      // CEP
      zip_code_mask: formData.zipCode,
      zip_code: zipNumbers || undefined,
      // Datas
      date_aafc_start: formData.dateAafcStart ? dateInputToIso(formData.dateAafcStart) : undefined,
      date_aafc_end: formData.dateAafcEnd ? dateInputToIso(formData.dateAafcEnd) : undefined,
      // Remove campos auxiliares do formulario
      zipCode: undefined,
      dateAafcStart: undefined,
      dateAafcEnd: undefined,
    };

    setIsSaving(true);
    dispatchLoadingStart();
    try {
      if (isEditing && id) {
        await memberService.updateMember(id, submitData);
        alert('Socio atualizado com sucesso!');
      } else {
        await memberService.createMember(submitData);
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
              {genders.map((g) => (
                <option key={g.id} value={g.description}>
                  {g.description}
                </option>
              ))}
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
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>
        </div>

        {/* Endereço */}
        <h3 style={styles.sectionTitle}>Endereço</h3>
        <div style={styles.formGrid}>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label className="input-label" htmlFor="address">Logradouro</label>
            <input
              id="address"
              type="text"
              className="input-control"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Rua, número, complemento"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="neighborhood">Bairro</label>
            <input
              id="neighborhood"
              type="text"
              className="input-control"
              value={formData.neighborhood || ''}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
              placeholder="Bairro"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="zipCode">CEP</label>
            <input
              id="zipCode"
              type="text"
              className="input-control"
              value={formData.zipCode || ''}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="00.000-000"
              maxLength={10}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="cityId">Cidade / UF</label>
            <select
              id="cityId"
              className="input-control"
              value={formData.cityId || ''}
              onChange={(e) => handleChange('cityId', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Selecione a cidade</option>
              {cities.map((c) => (
                <option key={c.cityId} value={c.cityId}>
                  {c.name || c.cityDescription}{c.stateCode ? `/${c.stateCode}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Plano & Situação */}
        <h3 style={styles.sectionTitle}>Plano & Situação</h3>
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
            <label className="input-label" htmlFor="status">Situação</label>
            <select
              id="status"
              className="input-control"
              value={formData.status ?? ''}
              onChange={(e) => handleChange('status', Number(e.target.value))}
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.description}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="dateAafcStart">Data Início</label>
            <input
              id="dateAafcStart"
              type="date"
              className="input-control"
              value={formData.dateAafcStart || ''}
              onChange={(e) => handleChange('dateAafcStart', e.target.value)}
            />
          </div>

          {statuses.find((s) => s.id === formData.status)?.description?.toUpperCase().includes('INATIVO') && (
            <>
              <div className="input-group">
                <label className="input-label" htmlFor="dateAafcEnd">Data Desligamento</label>
                <input
                  id="dateAafcEnd"
                  type="date"
                  className="input-control"
                  value={formData.dateAafcEnd || ''}
                  onChange={(e) => handleChange('dateAafcEnd', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="statusReasonDescription">Motivo Desligamento</label>
                <input
                  id="statusReasonDescription"
                  type="text"
                  className="input-control"
                  value={formData.statusReasonDescription || ''}
                  onChange={(e) => handleChange('statusReasonDescription', e.target.value)}
                  placeholder="Motivo do desligamento"
                />
              </div>
            </>
          )}
        </div>

        {/* Submit */}
        <div style={styles.actionsContainer}>
          <button 
            type="button" 
            onClick={() => navigate(isEditing ? `/members/${id}` : '/members')} 
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
