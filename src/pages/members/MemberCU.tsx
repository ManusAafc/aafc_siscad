import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IMember, IPlan, ICity, IGender, IMemberStatus } from '../../models';
import { memberService } from '../../services/memberService';
import { planService } from '../../services/planService';
import { genderService } from '../../services/genderService';
import { statusService } from '../../services/statusService';
import { dispatchLoadingStart, dispatchLoadingEnd } from '../../components/common/ButtonLoading';
import { cityService } from '../../services/cityService';
import { Save, UserPlus, Calendar } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';
import { formatCEP, formatMobile, formatCPF } from '../../utils/formatters';
import { validateCPF } from '../../utils/validators';

function isValidDate(dd: string, mm: string, yyyy: string): boolean {
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  const year = parseInt(yyyy, 10);
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
}

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('T')[0].split('-');
  if (parts.length !== 3) return '';
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function parseDisplayToIso(display: string): string {
  if (!display) return '';
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return '';
  const [, dd, mm, yyyy] = match;
  if (!isValidDate(dd, mm, yyyy)) return '';
  return `${yyyy}-${mm}-${dd}T00:00:00`;
}

function isoToDateInput(iso: string | undefined): string {
  if (!iso) return '';
  return iso.split('T')[0];
}

function dateInputToIso(dateStr: string): string {
  if (!dateStr) return '';
  return `${dateStr}T00:00:00`;
}

function toDisplayDate(iso: string | undefined): string {
  return formatDisplayDate(iso || '');
}

interface DateInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (isoValue: string) => void;
}

const DateInput: React.FC<DateInputProps> = ({ id, label, value, onChange }) => {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    setDisplayValue(formatDisplayDate(value));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 8) input = input.substring(0, 8);

    let formatted = input;
    if (input.length > 4) {
      formatted = `${input.substring(0, 2)}/${input.substring(2, 4)}/${input.substring(4)}`;
    } else if (input.length > 2) {
      formatted = `${input.substring(0, 2)}/${input.substring(2)}`;
    }

    setDisplayValue(formatted);

    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      const dd = clean.substring(0, 2);
      const mm = clean.substring(2, 4);
      const yyyy = clean.substring(4, 8);
      if (isValidDate(dd, mm, yyyy)) {
        onChange(`${yyyy}-${mm}-${dd}T00:00:00`);
      }
    } else {
      onChange('');
    }
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value ? `${e.target.value}T00:00:00` : '';
    onChange(iso);
  };

  const openPicker = () => {
    hiddenRef.current?.showPicker?.();
  };

  return (
    <div className="input-group">
      <label className="input-label" htmlFor={id}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          id={id}
          type="text"
          className="input-control"
          value={displayValue}
          onChange={handleTextChange}
          placeholder="dd/mm/aaaa"
          maxLength={10}
          style={{ paddingRight: '2.5rem', flex: 1 }}
        />
        <span
          onClick={openPicker}
          style={{
            position: 'absolute',
            right: '0.5rem',
            cursor: 'pointer',
            color: 'hsl(var(--muted-foreground))',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Calendar size={18} />
        </span>
        <input
          ref={hiddenRef}
          type="date"
          value={value ? value.split('T')[0] : ''}
          onChange={handleCalendarChange}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
};

export const MemberCU: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const addToast = useToastStore((s) => s.addToast);

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
  const [originalFormData, setOriginalFormData] = useState<Partial<IMember> | null>(null);

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
          // Salva copia dos dados originais para comparacao posterior
          setOriginalFormData({
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
      addToast('Não foi possível carregar os dados cadastrais.', 'error');
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

    if (formData.cpf) {
      const cpfDigits = formData.cpf.replace(/\D/g, '');
      if (cpfDigits.length !== 11) {
        newErrors.cpf = 'CPF deve conter 11 dígitos';
      } else if (!validateCPF(cpfDigits)) {
        newErrors.cpf = 'CPF inválido';
      }
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

    // Verifica se houve alteracoes nos dados (edicao)
    if (isEditing && originalFormData) {
      const hasChanges = Object.keys(formData).some((key) => {
        const k = key as keyof IMember;
        const current = formData[k];
        const original = originalFormData[k];
        return String(current ?? '') !== String(original ?? '');
      });

      if (!hasChanges) {
        addToast('Nenhuma alteração detectada.', 'info');
        navigate(`/members/${id}`, { replace: true });
        return;
      }
    }

    // Prepara dados para envio ao banco (mapeia campos do formulario para colunas da tabela)
    const cpfNumbers = (formData.cpf || '').replace(/\D/g, '');
    const mobileNumbers = (formData.mobile || '').replace(/\D/g, '');
    const zipNumbers = (formData.zipCode || '').replace(/\D/g, '');

    const mobileDDI = mobileNumbers ? `55${mobileNumbers}` : '';
    const whatsappId = mobileNumbers && mobileNumbers.length === 11 
      ? `${mobileDDI.substring(0, 4)}${mobileDDI.substring(5)}@s.whatsapp.net` 
      : '';

    // Mapeia gender (texto) para gender_id
    let genderId: number | undefined;
    if (formData.gender) {
      const found = genders.find((g) => g.description === formData.gender);
      genderId = found?.id;
    }

    // Mapeia status (texto/numero do formulario) para status_id
    const statusId = formData.status ? Number(formData.status) : undefined;

    const submitData = {
      // Dados pessoais
      name: formData.name || undefined,
      cpf: cpfNumbers || undefined,
      cpf_mask: formData.cpf || undefined,
      birthday: formData.birthDate || undefined,
      gender_id: genderId || undefined,
      // Contato
      mobile: mobileNumbers || undefined,
      mobile_mask: formData.mobile || undefined,
      mobile_ddi: mobileDDI || undefined,
      whatsapp_id: whatsappId || undefined,
      email: formData.email || undefined,
      // Endereco
      address: formData.address || undefined,
      neighborhood: formData.neighborhood || undefined,
      zip_code: zipNumbers || undefined,
      zip_code_mask: formData.zipCode || undefined,
      city_id: formData.cityId || undefined,
      // Dados da AAFC
      plan_id: formData.planId || undefined,
      status_id: statusId || undefined,
      date_aafc_start: formData.dateAafcStart ? dateInputToIso(formData.dateAafcStart) : undefined,
      date_aafc_end: formData.dateAafcEnd ? dateInputToIso(formData.dateAafcEnd) : undefined,
    };

    setIsSaving(true);
    dispatchLoadingStart();
    try {
      if (isEditing && id) {
        await memberService.updateMember(id, submitData);
        addToast('Socio atualizado com sucesso!', 'success');
        navigate(`/members/${id}`, { replace: true });
      } else {
        await memberService.createMember(submitData);
        addToast('Socio criado com sucesso!', 'success');
        navigate('/members');
      }
    } catch (error) {
      addToast('Não foi possível salvar o socio.', 'error');
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
        <h1 style={styles.title}>{isEditing ? 'Editar Socio' : 'Novo Socio'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card" style={styles.formCard}>
        {/* Pessoal */}
        <h3 style={styles.sectionTitle}>Informações Pessoais</h3>
        <div style={styles.formGrid}>
          <div className="input-group">
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
              type="tel"
              inputMode="numeric"
              className="input-control"
              value={formData.cpf || ''}
              onChange={(e) => handleChange('cpf', e.target.value.replace(/\D/g, ''))}
              onBlur={() => {
                const cpfDigits = (formData.cpf || '').replace(/\D/g, '');
                if (cpfDigits.length === 0) {
                  setErrors((prev) => { const { cpf, ...rest } = prev; return rest; });
                } else if (cpfDigits.length !== 11) {
                  setErrors((prev) => ({ ...prev, cpf: 'CPF deve conter 11 dígitos' }));
                } else if (!validateCPF(cpfDigits)) {
                  setErrors((prev) => ({ ...prev, cpf: 'CPF inválido' }));
                } else {
                  setErrors((prev) => { const { cpf, ...rest } = prev; return rest; });
                }
              }}
              placeholder="000.000.000-00"
              maxLength={14}
            />
            {errors.cpf && <span style={styles.errorText}>{errors.cpf}</span>}
          </div>

          <DateInput
            id="birthDate"
            label="Data de Nascimento"
            value={formData.birthDate || ''}
            onChange={(v) => handleChange('birthDate', v)}
          />

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
              type="tel"
              inputMode="numeric"
              className="input-control"
              value={formData.mobile || ''}
              onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
              placeholder="(00) 00000-0000"
            />
            {errors.mobile && <span style={styles.errorText}>{errors.mobile}</span>}
          </div>

          <div className="input-group">
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
          <div className="input-group">
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
              type="tel"
              inputMode="numeric"
              className="input-control"
              value={formData.zipCode || ''}
              onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, ''))}
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

          <DateInput
            id="dateAafcStart"
            label="Data Início"
            value={formData.dateAafcStart || ''}
            onChange={(v) => handleChange('dateAafcStart', v)}
          />

          {statuses.find((s) => s.id === formData.status)?.description?.toUpperCase().includes('INATIVO') && (
            <>
              <DateInput
                id="dateAafcEnd"
                label="Data Desligamento"
                value={formData.dateAafcEnd || ''}
                onChange={(v) => handleChange('dateAafcEnd', v)}
              />

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
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%' }}
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
    display: 'flex',
    flexDirection: 'column',
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
