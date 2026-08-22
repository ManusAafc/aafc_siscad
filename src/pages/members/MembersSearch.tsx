import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberStore } from '../../store/useMemberStore';
import { formatCPF, formatPhone } from '../../utils/formatters';
import { memberService } from '../../services/memberService';
import { planService } from '../../services/planService';
import { regionService } from '../../services/regionService';
import { cityService } from '../../services/cityService';
import { exportMembersToPDF, exportMembersToExcel, exportMembersToLabels } from '../../utils/exportUtils';
import { dispatchLoadingStart, dispatchLoadingEnd } from '../../components/common/ButtonLoading';
import { IPlan } from '../../models/plan';
import { IRegion } from '../../models/region';
import { ICity } from '../../models/city';
import { IUserMembersFilters, EMPTY_FILTERS } from '../../models/filters';
import {
  Search,
  UserPlus,
  ChevronRight,
  User,
  Filter,
  X,
  RefreshCw,
  ChevronDown,
  Check,
  FileText,
  FileDown,
  FileSpreadsheet,
  Sheet,
  Printer,
  Tags,
} from 'lucide-react';

// ─── Tipos internos ──────────────────────────────────────────────────────────
interface Option {
  id: number;
  label: string;
}

// ─── MultiSelect Component ───────────────────────────────────────────────────
interface MultiSelectProps {
  options: Option[];
  selected: number[];
  onChange: (ids: number[]) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  showColorDots?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder,
  disabled = false,
  loading = false,
  showColorDots = false,
}) => {
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFilterText('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (id: number) => {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  };

  const selectAll = () => {
    const allIds = filteredOptions.map((o) => o.id);
    const combined = Array.from(new Set([...selected, ...allIds]));
    onChange(combined);
  };

  const clearAll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange([]);
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(filterText.toLowerCase())
  );

  const getDotStyle = (id: number) => {
    if (id === 2) return { bg: '#16a34a', label: 'Verde' }; // Ativo
    if (id === 1) return { bg: '#dc2626', label: 'Vermelho' }; // Inativo
    return { bg: '#000000', label: 'Preto' }; // Não Sócio / Outros
  };

  const selectedLabels = options
    .filter((o) => selected.includes(o.id))
    .map((o) => o.label);

  const triggerText =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? selectedLabels[0]
      : `${selected.length} selecionados`;

  return (
    <div ref={ref} style={ms.wrapper}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((v) => !v)}
        style={{
          ...ms.trigger,
          ...(disabled || loading ? ms.triggerDisabled : {}),
          ...(selected.length > 0 ? ms.triggerActive : {}),
          ...(open ? ms.triggerOpen : {}),
        }}
      >
        <span style={ms.triggerTextWrapper}>
          <span
            style={{
              ...ms.triggerLabel,
              ...(selected.length === 0 ? ms.placeholderText : ms.selectedText),
            }}
          >
            {loading ? 'Carregando...' : triggerText}
          </span>
        </span>

        <span style={ms.triggerRight}>
          {selected.length > 0 && (
            <span
              style={ms.countBadge}
              title={`${selected.length} selecionados`}
            >
              {selected.length}
            </span>
          )}
          {selected.length > 0 && (
            <span
              style={ms.clearBtn}
              onClick={clearAll}
              role="button"
              title="Limpar seleção"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={15}
            style={{
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              color: open ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              flexShrink: 0,
            }}
          />
        </span>
      </button>

      {open && !disabled && !loading && (
        <div style={ms.dropdown}>
          {/* Busca rápida se houver mais de 5 opções */}
          {options.length > 5 && (
            <div style={ms.searchBox}>
              <Search size={14} style={ms.searchIcon} />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filtrar opções..."
                style={ms.searchInput}
                autoFocus
              />
              {filterText && (
                <button
                  type="button"
                  onClick={() => setFilterText('')}
                  style={ms.clearSearchBtn}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Cabeçalho de Ações Rápidas */}
          {options.length > 1 && (
            <div style={ms.actionHeader}>
              <button type="button" onClick={selectAll} style={ms.headerActionBtn}>
                Marcar todos
              </button>
              {selected.length > 0 && (
                <button type="button" onClick={() => onChange([])} style={ms.headerActionBtnDanger}>
                  Desmarcar todos
                </button>
              )}
            </div>
          )}

          {/* Lista de Opções */}
          <div style={ms.optionsList}>
            {filteredOptions.length === 0 ? (
              <p style={ms.emptyMsg}>Nenhuma opção encontrada</p>
            ) : (
              filteredOptions.map((opt) => {
                const checked = selected.includes(opt.id);
                const dot = showColorDots ? getDotStyle(opt.id) : null;

                return (
                  <div
                    key={opt.id}
                    onClick={() => toggle(opt.id)}
                    style={{
                      ...ms.optionItem,
                      ...(checked ? ms.optionItemChecked : {}),
                    }}
                    className="select-option-item"
                  >
                    <span
                      style={{
                        ...ms.checkbox,
                        ...(checked ? ms.checkboxChecked : {}),
                      }}
                    >
                      {checked && <Check size={11} strokeWidth={3} />}
                    </span>

                    {dot && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: dot.bg,
                          flexShrink: 0,
                        }}
                      />
                    )}

                    <span
                      style={{
                        ...ms.optionText,
                        ...(checked ? ms.optionTextChecked : {}),
                      }}
                    >
                      {opt.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Estilos do MultiSelect ───────────────────────────────────────────────────
const ms: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    userSelect: 'none',
  },
  trigger: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    padding: '0.55rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--background))',
    fontSize: '0.875rem',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease-in-out',
  },
  triggerActive: {
    borderColor: 'hsl(var(--primary))',
    backgroundColor: 'hsla(var(--primary), 0.02)',
  },
  triggerOpen: {
    borderColor: 'hsl(var(--primary))',
    boxShadow: '0 0 0 3px hsla(var(--primary), 0.12)',
  },
  triggerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  triggerTextWrapper: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    flex: 1,
  },
  triggerLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
  },
  placeholderText: {
    color: 'hsl(var(--muted-foreground))',
    fontWeight: 400,
  },
  selectedText: {
    color: 'hsl(var(--foreground))',
    fontWeight: 600,
  },
  triggerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    flexShrink: 0,
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    padding: '0 4px',
    borderRadius: '100px',
    backgroundColor: 'hsl(var(--primary))',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  clearBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: 'hsla(var(--muted-foreground), 0.2)',
    color: 'hsl(var(--muted-foreground))',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    zIndex: 120,
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '10px',
    boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  searchBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 0.625rem',
    borderBottom: '1px solid hsl(var(--border))',
    backgroundColor: 'hsla(var(--muted), 0.2)',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.85rem',
    color: 'hsl(var(--muted-foreground))',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '0.35rem 1.6rem 0.35rem 1.8rem',
    borderRadius: '6px',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--background))',
    fontSize: '0.8rem',
    outline: 'none',
    color: 'hsl(var(--foreground))',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '0.85rem',
    background: 'none',
    border: 'none',
    color: 'hsl(var(--muted-foreground))',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  actionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0.625rem',
    borderBottom: '1px solid hsl(var(--border))',
    backgroundColor: 'hsla(var(--muted), 0.1)',
  },
  headerActionBtn: {
    background: 'none',
    border: 'none',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'hsl(var(--primary))',
    cursor: 'pointer',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
  },
  headerActionBtnDanger: {
    background: 'none',
    border: 'none',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'hsl(var(--muted-foreground))',
    cursor: 'pointer',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
  },
  optionsList: {
    maxHeight: '210px',
    overflowY: 'auto',
    padding: '0.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  emptyMsg: {
    padding: '0.85rem',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'hsl(var(--muted-foreground))',
  },
  optionItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.5rem 0.625rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: 'hsl(var(--foreground))',
    transition: 'background-color 0.12s ease',
  },
  optionItemChecked: {
    backgroundColor: 'hsla(var(--primary), 0.08)',
  },
  optionText: {
    flex: 1,
    fontSize: '0.85rem',
    lineHeight: 1.3,
  },
  optionTextChecked: {
    fontWeight: 600,
    color: 'hsl(var(--primary))',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '1.5px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--background))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  checkboxChecked: {
    backgroundColor: 'hsl(var(--primary))',
    borderColor: 'hsl(var(--primary))',
    color: '#fff',
  },
};


// ─── Dados estáticos ─────────────────────────────────────────────────────────
const MEMBER_STATUSES: Option[] = [
  { id: 2, label: 'Ativo' },
  { id: 1, label: 'Inativo' },
  { id: 3, label: 'Não Sócio' },
];

// ─── MembersSearch ────────────────────────────────────────────────────────────
export const MembersSearch: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [exportingAction, setExportingAction] = useState<'pdf' | 'excel' | 'labels' | null>(null);

  // Todos os dados de apoio
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [regions, setRegions] = useState<IRegion[]>([]);
  const [allCities, setAllCities] = useState<ICity[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Seleções multi
  const [selectedStatuses, setSelectedStatuses] = useState<number[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<number[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
  const [selectedCities, setSelectedCities] = useState<number[]>([]);

  const {
    searchResults,
    searchTotal,
    isLoading,
    searchMembers,
    loadMoreMembers,
    hasMore,
    setFilters,
    searchTerm: storedSearchTerm,
  } = useMemberStore();

  const [searchTerm, setSearchTerm] = useState(storedSearchTerm);

  // Carrega combos ao montar
  useEffect(() => {
    planService.getAllPlans().then(setPlans);
    regionService.getAllRegions().then(setRegions);
    cityService.getAllCities().then(setAllCities);
    // Só busca se não houver resultados já carregados
    if (searchResults.length === 0) {
      searchMembers(storedSearchTerm);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Quando regiões mudam, recarrega cidades para o combo
  useEffect(() => {
    if (selectedRegions.length === 1) {
      setLoadingCities(true);
      setSelectedCities([]);
      cityService
        .getCitiesByRegion(selectedRegions[0])
        .then(setCities)
        .finally(() => setLoadingCities(false));
    } else if (selectedRegions.length === 0) {
      setCities([]);
      setSelectedCities([]);
    }
  }, [selectedRegions]);

  const activeFilterCount =
    selectedStatuses.length + selectedPlans.length + selectedRegions.length + selectedCities.length;

  const buildFilters = useCallback(
    (statuses = selectedStatuses, plans_ = selectedPlans, regs = selectedRegions, cities_ = selectedCities): IUserMembersFilters => ({
      ...EMPTY_FILTERS,
      memberStatusesIds: statuses,
      plansIds: plans_,
      regionsIds: regs,
      citiesIds: cities_,
      filtersAmount: statuses.length + plans_.length + regs.length + cities_.length,
    }),
    [selectedStatuses, selectedPlans, selectedRegions, selectedCities]
  );

  const applySearch = useCallback(
    (term: string, filters?: IUserMembersFilters) => {
      const f = filters ?? buildFilters();
      setFilters(f);
      dispatchLoadingStart();
      searchMembers(term, 1, f).finally(() => dispatchLoadingEnd());
    },
    [buildFilters, setFilters, searchMembers]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    applySearch(value);
  };

  const handleApplyFilters = () => applySearch(searchTerm);

  const handleClearFilters = () => {
    setSelectedStatuses([]);
    setSelectedPlans([]);
    setSelectedRegions([]);
    setSelectedCities([]);
    const empty = EMPTY_FILTERS;
    setFilters(empty);
    searchMembers(searchTerm, 1, empty);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) loadMoreMembers(searchTerm);
  };

  // Helpers para remover um chip individualmente
  const removeStatus = (id: number) => {
    const next = selectedStatuses.filter((s) => s !== id);
    setSelectedStatuses(next);
    applySearch(searchTerm, buildFilters(next, selectedPlans, selectedRegions, selectedCities));
  };
  const removePlan = (id: number) => {
    const next = selectedPlans.filter((p) => p !== id);
    setSelectedPlans(next);
    applySearch(searchTerm, buildFilters(selectedStatuses, next, selectedRegions, selectedCities));
  };
  const removeRegion = (id: number) => {
    const next = selectedRegions.filter((r) => r !== id);
    setSelectedRegions(next);
    applySearch(searchTerm, buildFilters(selectedStatuses, selectedPlans, next, selectedCities));
  };
  const removeCity = (id: number) => {
    const next = selectedCities.filter((c) => c !== id);
    setSelectedCities(next);
    applySearch(searchTerm, buildFilters(selectedStatuses, selectedPlans, selectedRegions, next));
  };

  const fetchAllForExport = async (action: 'pdf' | 'excel' | 'labels') => {
    setExportingAction(action);
    dispatchLoadingStart();
    try {
      const allMembers = await memberService.searchAllMembers(searchTerm, buildFilters());
      return allMembers;
    } finally {
      setExportingAction(null);
      dispatchLoadingEnd();
    }
  };

  const handleExportPDF = async () => {
    const data = await fetchAllForExport('pdf');
    exportMembersToPDF(data);
  };

  const handleExportExcel = async () => {
    const data = await fetchAllForExport('excel');
    exportMembersToExcel(data);
  };

  const handlePrintLabels = async () => {
    const data = await fetchAllForExport('labels');
    exportMembersToLabels(data);
  };

  // Opções convertidas para o formato Option
  const planOptions: Option[] = plans.map((p) => ({ id: p.id!, label: p.description }));
  const regionOptions: Option[] = regions.map((r) => ({ id: r.id!, label: r.description }));
  const cityOptions: Option[] = cities.map((c) => ({
    id: c.id ?? c.cityId,
    label: c.name || c.cityDescription,
  }));

  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Buscar Socios</h1>
          <p style={styles.subtitle}>{searchTotal} socios encontrados</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/members/new')}
            className="btn btn-primary"
            style={styles.newBtn}
          >
            <UserPlus size={18} />
            <span>Novo Socio</span>
          </button>
        </div>
      </div>

      {/* ── Painel de Busca e Filtros ── */}
      <div className="card" style={styles.controlsCard}>
        {/* Linha de busca + toggle filtros */}
        <div style={styles.topRow}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              className="input-control"
              style={styles.searchInput}
              placeholder="Pesquisar por nome, CPF ou telefone..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            style={{
              ...styles.filterToggleBtn,
              ...(activeFilterCount > 0 ? styles.filterToggleBtnActive : {}),
            }}
          >
            <Filter size={16} />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span style={styles.filterBadge}>{activeFilterCount}</span>
            )}
            <ChevronDown
              size={14}
              style={{
                transition: 'transform 0.2s',
                transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
        </div>

        {/* Painel expansível */}
        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filtersGrid}>
              {/* Situação */}
              <div style={styles.filterField}>
                <label style={styles.filterLabel}>Situação</label>
                <MultiSelect
                  options={MEMBER_STATUSES}
                  selected={selectedStatuses}
                  onChange={setSelectedStatuses}
                  placeholder="Todas as situações"
                />
              </div>

              {/* Plano */}
              <div style={styles.filterField}>
                <label style={styles.filterLabel}>Plano</label>
                <MultiSelect
                  options={planOptions}
                  selected={selectedPlans}
                  onChange={setSelectedPlans}
                  placeholder="Todos os planos"
                />
              </div>

              {/* Região */}
              <div style={styles.filterField}>
                <label style={styles.filterLabel}>Região</label>
                <MultiSelect
                  options={regionOptions}
                  selected={selectedRegions}
                  onChange={setSelectedRegions}
                  placeholder="Todas as regiões"
                />
              </div>

              {/* Cidade */}
              <div style={styles.filterField}>
                <label style={styles.filterLabel}>
                  Cidade
                  {loadingCities && (
                    <span style={{ marginLeft: '0.4rem', opacity: 0.6, fontSize: '0.7rem' }}>
                      carregando...
                    </span>
                  )}
                  {selectedRegions.length > 1 && (
                    <span style={{ marginLeft: '0.4rem', opacity: 0.6, fontSize: '0.7rem' }}>
                      (selecione 1 região)
                    </span>
                  )}
                </label>
                <MultiSelect
                  options={cityOptions}
                  selected={selectedCities}
                  onChange={setSelectedCities}
                  placeholder={
                    selectedRegions.length === 0
                      ? 'Selecione uma região'
                      : selectedRegions.length > 1
                      ? 'Múltiplas regiões'
                      : 'Todas as cidades'
                  }
                  disabled={selectedRegions.length !== 1}
                  loading={loadingCities}
                />
              </div>
            </div>

            {/* Ações */}
            <div style={styles.filterActions}>
              {activeFilterCount > 0 && (
                <button onClick={handleClearFilters} style={styles.clearBtn}>
                  <X size={14} />
                  Limpar tudo
                </button>
              )}
              <button
                onClick={handleApplyFilters}
                className="btn btn-primary"
                disabled={isLoading}
                style={styles.applyBtn}
              >
                {isLoading ? (
                  <RefreshCw size={14} className="spinner" />
                ) : (
                  <Search size={14} />
                )}
                Aplicar
              </button>
            </div>

            {/* Chips ativos */}
            {activeFilterCount > 0 && (
              <div style={styles.activeChips}>
                {selectedStatuses.map((id) => (
                  <span key={`s-${id}`} style={styles.chip}>
                    {MEMBER_STATUSES.find((s) => s.id === id)?.label}
                    <button style={styles.chipX} onClick={() => removeStatus(id)}>×</button>
                  </span>
                ))}
                {selectedPlans.map((id) => (
                  <span key={`p-${id}`} style={styles.chip}>
                    {plans.find((p) => p.id === id)?.description}
                    <button style={styles.chipX} onClick={() => removePlan(id)}>×</button>
                  </span>
                ))}
                {selectedRegions.map((id) => (
                  <span key={`r-${id}`} style={styles.chip}>
                    {regions.find((r) => r.id === id)?.description}
                    <button style={styles.chipX} onClick={() => removeRegion(id)}>×</button>
                  </span>
                ))}
                {selectedCities.map((id) => (
                  <span key={`c-${id}`} style={styles.chip}>
                    {cities.find((c) => (c.id ?? c.cityId) === id)?.name}
                    <button style={styles.chipX} onClick={() => removeCity(id)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {searchTotal > 0 && (
        <div style={styles.exportActions}>
          <button
            onClick={handleExportPDF}
            className="btn btn-secondary"
            disabled={isLoading || exportingAction !== null}
            style={styles.newBtn}
            title="Exportar PDF (Paisagem)"
          >
            {exportingAction === 'pdf' ? <RefreshCw size={18} className="spinner" /> : <FileDown size={18} />}
          </button>
          <button
            onClick={handleExportExcel}
            className="btn btn-secondary"
            disabled={isLoading || exportingAction !== null}
            style={styles.newBtn}
            title="Exportar para Excel"
          >
            {exportingAction === 'excel' ? <RefreshCw size={18} className="spinner" /> : <Sheet size={18} />}
          </button>
          <button
            onClick={handlePrintLabels}
            className="btn btn-secondary"
            disabled={isLoading || exportingAction !== null}
            style={styles.newBtn}
            title="Imprimir Etiquetas (Carta 6181)"
          >
            {exportingAction === 'labels' ? <RefreshCw size={18} className="spinner" /> : <Tags size={18} />}
          </button>
        </div>
      )}

      {/* ── Resultados ── */}
      {isLoading && searchResults.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div className="spinner" style={{ color: 'hsl(var(--primary))' }}></div>
          <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))' }}>
            Carregando socios...
          </p>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="card" style={styles.emptyContainer}>
          <User size={48} style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600 }}>Nenhum socio encontrado</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            Tente outros termos ou ajuste os filtros
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={styles.list}>
            {searchResults.map((member: any) => {
              let city = member.cityDescription || member.cityName || member.city_description || member.city_name || member.db_member_city_description || member.db_city_description || member.city;
              let uf = member.stateCode || member.state_code || member.db_member_state_code || member.db_state_code || '';
              let region = member.regionDescription || member.regionName || member.region_description || member.region_name || member.db_member_region_description || member.db_region_description || member.region;
              let plan = member.planDescription || member.planName || member.plan_description || member.plan_name || member.db_member_plan_description || member.db_plan_description || member.plan;

              // Fallback por ID se a descrição não vier na resposta da RPC
              const cityIdNum = member.cityId || member.city_id || member.db_member_city_id || member.db_city_id;
              if (!city && cityIdNum) {
                const foundCity = allCities.find((c) => (c.id ?? c.cityId) === Number(cityIdNum));
                if (foundCity) city = foundCity.name || foundCity.cityDescription;
              }

              const planIdNum = member.planId || member.plan_id || member.db_member_plan_id || member.db_plan_id;
              if (!plan && planIdNum) {
                const foundPlan = plans.find((p) => p.id === Number(planIdNum));
                if (foundPlan) plan = foundPlan.description;
              }

              const regionIdNum = member.regionId || member.region_id || member.db_member_region_id || member.db_region_id;
              if (!region && regionIdNum) {
                const foundRegion = regions.find((r) => r.id === Number(regionIdNum));
                if (foundRegion) region = foundRegion.description;
              }

              return (
                <div
                  key={member.id}
                  className="card"
                  style={styles.memberCard}
                  onClick={() => navigate(`/members/${member.id}`)}
                >
                  <div style={styles.memberInfo}>
                    <h3 style={styles.memberName}>{member.name || member.name_full || member.nameFull || 'Sem nome'}</h3>
                    <div style={styles.memberDetailsRow}>
                      <span>CPF: {member.cpf ? formatCPF(member.cpf) : 'Sem CPF'}</span>
                      <span style={styles.bullet}>•</span>
                      <span>Tel: {member.mobile ? formatPhone(member.mobile) : 'Sem telefone'}</span>
                      {city && (
                        <>
                          <span style={styles.bullet}>•</span>
                          <span>Cidade: {city}{uf ? `/${uf}` : ''}</span>
                        </>
                      )}
                      {region && (
                        <>
                          <span style={styles.bullet}>•</span>
                          <span>Região: {region}</span>
                        </>
                      )}
                      {plan && (
                        <>
                          <span style={styles.bullet}>•</span>
                          <span>Plano: {plan}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={styles.memberStatus}>
                    {(() => {
                      const statusId = Number(
                        member.status_id ??
                        member.statusId ??
                        member.status ??
                        member.db_member_status_id ??
                        0
                      );

                      let label =
                        member.statusName ||
                        member.status_name ||
                        member.statusDescription ||
                        member.status_description;

                      let color = '#000000'; // 3 ou default = preto
                      let bg = '#e2e8f0';

                      if (statusId === 1) {
                        // 1 = vermelho
                        color = '#dc2626';
                        bg = '#fee2e2';
                        if (!label) label = 'Inativo';
                      } else if (statusId === 2) {
                        // 2 = verde
                        color = '#16a34a';
                        bg = '#dcfce7';
                        if (!label) label = 'Ativo';
                      } else if (statusId === 3) {
                        // 3 = preto
                        color = '#000000';
                        bg = '#e2e8f0';
                        if (!label) label = 'Não Sócio';
                      } else {
                        // fallback por texto se status_id não for 1, 2 ou 3
                        const text = (label || '').toUpperCase().trim();
                        if (text.includes('INATIVO') || text.includes('SUSPENSO')) {
                          color = '#dc2626';
                          bg = '#fee2e2';
                        } else if (text.includes('ATIVO')) {
                          color = '#16a34a';
                          bg = '#dcfce7';
                        } else {
                          color = '#000000';
                          bg = '#e2e8f0';
                        }
                      }

                      return (
                        <span style={{ ...styles.badge, backgroundColor: bg, color, fontWeight: 700 }}>
                          {label || `Status ${statusId}`}
                        </span>
                      );
                    })()}
                    <ChevronRight
                      size={20}
                      style={{ color: 'hsl(var(--muted-foreground))', marginLeft: '0.5rem' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="btn btn-secondary"
              style={styles.loadMoreBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw size={16} className="spinner" />
              ) : (
                'Carregar mais socios'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Estilos da página ────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  subtitle: { fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' },
  newBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  exportActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' },
  controlsCard: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  topRow: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  searchWrapper: { position: 'relative', display: 'flex', alignItems: 'center', flex: 1 },
  searchIcon: { position: 'absolute', left: '0.75rem', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' },
  searchInput: { paddingLeft: '2.5rem', width: '100%' },
  filterToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--background))',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--muted-foreground))',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  filterToggleBtnActive: {
    backgroundColor: 'hsla(var(--primary), 0.08)',
    borderColor: 'hsl(var(--primary))',
    color: 'hsl(var(--primary))',
  },
  filterBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: 'hsl(var(--primary))',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  filtersPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid hsl(var(--border))',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  filterField: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  filterLabel: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'hsl(var(--muted-foreground))',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
  },
  filterActions: { display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' },
  clearBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 0.875rem',
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'transparent',
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))',
    cursor: 'pointer',
  },
  applyBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem' },
  activeChips: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.625rem',
    borderRadius: '100px',
    backgroundColor: 'hsla(var(--primary), 0.1)',
    color: 'hsl(var(--primary))',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  chipX: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'hsl(var(--primary))',
    fontSize: '1rem',
    lineHeight: 1,
    padding: '0 0.1rem',
    display: 'flex',
    alignItems: 'center',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  memberCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  memberAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: 'hsla(var(--primary), 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '1rem',
    flexShrink: 0,
  },
  memberInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 },
  memberName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'hsl(var(--foreground))',
  },
  memberDetailsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'hsl(var(--muted-foreground))',
    flexWrap: 'wrap',
  },
  bullet: { color: 'hsl(var(--border))' },
  memberStatus: { display: 'flex', alignItems: 'center', flexShrink: 0, marginLeft: '0.75rem' },
  badge: { padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 },
  loadMoreBtn: {
    alignSelf: 'center',
    marginTop: '0.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
};
