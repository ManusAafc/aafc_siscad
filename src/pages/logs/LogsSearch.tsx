import React, { useEffect, useState, useCallback } from 'react';
import { useLogStore } from '../../store/useLogStore';
import { ILog, ILogFilters, EMPTY_LOG_FILTERS, TABLE_LABELS, OPERATION_LABELS, OPERATION_COLORS } from '../../models/log';
import { dispatchLoadingStart, dispatchLoadingEnd } from '../../components/common/ButtonLoading';
import {
  Search,
  Filter,
  X,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  History,
  FileText,
} from 'lucide-react';

// ─── Tabelas e operações disponíveis ────────────────────────────────────────
const TABLE_OPTIONS = Object.entries(TABLE_LABELS).map(([value, label]) => ({ value, label }));
const OPERATION_OPTIONS = Object.entries(OPERATION_LABELS).map(([value, label]) => ({ value, label }));

// ─── LogDetailModal ─────────────────────────────────────────────────────────
interface LogDetailModalProps {
  log: ILog | null;
  onClose: () => void;
}

const LogDetailModal: React.FC<LogDetailModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  const formatJson = (data: Record<string, unknown> | null) => {
    if (!data) return null;
    return Object.entries(data)
      .filter(([key]) => !['id', 'createdAt', 'createdAtDatetime', 'updatedAt', 'updatedAtDatetime'].includes(key))
      .map(([key, value]) => ({ key, value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? '') }));
  };

  const oldFields = formatJson(log.dataOld);
  const newFields = formatJson(log.dataNew);

  const getDiffKeys = (): Set<string> => {
    const diffs = new Set<string>();
    if (!oldFields || !newFields) return diffs;
    const oldMap = new Map(oldFields.map(f => [f.key, f.value]));
    const newMap = new Map(newFields.map(f => [f.key, f.value]));
    const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);
    allKeys.forEach(key => {
      if (oldMap.get(key) !== newMap.get(key)) diffs.add(key);
    });
    return diffs;
  };

  const diffKeys = getDiffKeys();

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div>
            <h3 style={modalStyles.title}>Detalhes da Operacao</h3>
            <p style={modalStyles.subtitle}>
              {log.operation && OPERATION_LABELS[log.operation]} em {log.tableName && TABLE_LABELS[log.tableName]}
            </p>
          </div>
          <button onClick={onClose} style={modalStyles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div style={modalStyles.meta}>
          <span><strong>Data:</strong> {new Date(log.createdDate).toLocaleString('pt-BR')}</span>
          <span><strong>Usuario:</strong> {log.userName || log.userEmail || log.userUuid || 'Sistema'}</span>
          <span><strong>Tabela:</strong> {log.tableName}</span>
          <span><strong>Operacao:</strong> {log.operation && OPERATION_LABELS[log.operation]}</span>
        </div>

        {log.operation === 'DELETE' && oldFields && (
          <div style={modalStyles.section}>
            <h4 style={modalStyles.sectionTitle}>Dados Excluidos</h4>
            <div style={modalStyles.tableWrapper}>
              <table style={modalStyles.table}>
                <thead>
                  <tr>
                    <th style={modalStyles.th}>Campo</th>
                    <th style={modalStyles.th}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {oldFields.map(({ key, value }) => (
                    <tr key={key}>
                      <td style={modalStyles.tdKey}>{key}</td>
                      <td style={modalStyles.tdValue}>{value || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {log.operation === 'INSERT' && newFields && (
          <div style={modalStyles.section}>
            <h4 style={modalStyles.sectionTitle}>Dados Inseridos</h4>
            <div style={modalStyles.tableWrapper}>
              <table style={modalStyles.table}>
                <thead>
                  <tr>
                    <th style={modalStyles.th}>Campo</th>
                    <th style={modalStyles.th}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {newFields.map(({ key, value }) => (
                    <tr key={key}>
                      <td style={modalStyles.tdKey}>{key}</td>
                      <td style={modalStyles.tdValue}>{value || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {log.operation === 'UPDATE' && oldFields && newFields && (
          <div style={modalStyles.section}>
            <h4 style={modalStyles.sectionTitle}>Alteracoes</h4>
            <div style={modalStyles.tableWrapper}>
              <table style={modalStyles.table}>
                <thead>
                  <tr>
                    <th style={modalStyles.th}>Campo</th>
                    <th style={modalStyles.th}>Antes</th>
                    <th style={modalStyles.th}>Depois</th>
                  </tr>
                </thead>
                <tbody>
                  {newFields.map(({ key, value }) => {
                    const oldVal = oldFields.find(f => f.key === key)?.value || '-';
                    const isDiff = diffKeys.has(key);
                    return (
                      <tr key={key} style={isDiff ? modalStyles.diffRow : undefined}>
                        <td style={modalStyles.tdKey}>{key}</td>
                        <td style={modalStyles.tdValue}>{oldVal}</td>
                        <td style={modalStyles.tdValue}>{value || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── LogsSearch ─────────────────────────────────────────────────────────────
export const LogsSearch: React.FC = () => {
  const { logs, total, isLoading, filters, hasMore, fetchLogs, setFilters, clearFilters, loadMore } = useLogStore();
  const [localFilters, setLocalFilters] = useState<ILogFilters>({ ...EMPTY_LOG_FILTERS });
  const [selectedLog, setSelectedLog] = useState<ILog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatchLoadingStart();
    fetchLogs().finally(() => dispatchLoadingEnd());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyFilters = useCallback(() => {
    dispatchLoadingStart();
    fetchLogs(localFilters, 1).finally(() => dispatchLoadingEnd());
  }, [localFilters, fetchLogs]);

  const handleClearFilters = useCallback(() => {
    const empty = { ...EMPTY_LOG_FILTERS };
    setLocalFilters(empty);
    dispatchLoadingStart();
    fetchLogs(empty, 1).finally(() => dispatchLoadingEnd());
  }, [fetchLogs]);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) loadMore();
  };

  const activeFilterCount =
    (localFilters.tableName ? 1 : 0) +
    (localFilters.operation ? 1 : 0) +
    (localFilters.startDate ? 1 : 0) +
    (localFilters.endDate ? 1 : 0);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={styles.headerIcon}>
            <History size={20} style={{ color: 'hsl(var(--primary))' }} />
          </div>
          <div>
            <h1 style={styles.title}>Auditoria</h1>
            <p style={styles.subtitle}>{total} registros encontrados</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card" style={styles.controlsCard}>
        <div style={styles.topRow}>
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

        {showFilters && (
          <div style={styles.filtersPanel}>
            <div style={styles.filtersGrid}>
              {/* Tabela */}
              <div style={styles.filterField}>
                <label style={styles.filterLabel}>Tabela</label>
                <select
                  value={localFilters.tableName}
                  onChange={(e) => setLocalFilters({ ...localFilters, tableName: e.target.value })}
                  style={styles.select}
                >
                  <option value="">Todas as tabelas</option>
                  {TABLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Operacao */}
              <div style={styles.filterField}>
                <label style={styles.filterLabel}>Operacao</label>
                <select
                  value={localFilters.operation}
                  onChange={(e) => setLocalFilters({ ...localFilters, operation: e.target.value })}
                  style={styles.select}
                >
                  <option value="">Todas as operacoes</option>
                  {OPERATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Data Inicio */}
              <div style={styles.filterField}>
                <label style={styles.filterLabel}>Data Inicio</label>
                <input
                  type="date"
                  value={localFilters.startDate}
                  onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
                  style={styles.select}
                />
              </div>

              {/* Data Fim */}
              <div style={styles.filterField}>
                <label style={styles.filterLabel}>Data Fim</label>
                <input
                  type="date"
                  value={localFilters.endDate}
                  onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
                  style={styles.select}
                />
              </div>
            </div>

            {/* Acoes */}
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
          </div>
        )}
      </div>

      {/* Resultados */}
      {isLoading && logs.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div className="spinner" style={{ color: 'hsl(var(--primary))' }}></div>
          <p style={{ marginTop: '1rem', color: 'hsl(var(--muted-foreground))' }}>
            Carregando logs...
          </p>
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={styles.emptyContainer}>
          <FileText size={48} style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1rem' }} />
          <h3 style={{ fontWeight: 600 }}>Nenhum log encontrado</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            Ajuste os filtros para visualizar os registros de auditoria
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={styles.list}>
            {logs.map((log) => {
              const opColor = log.operation ? OPERATION_COLORS[log.operation] : null;
              const tableLabel = log.tableName ? TABLE_LABELS[log.tableName] || log.tableName : '-';
              const opLabel = log.operation ? OPERATION_LABELS[log.operation] || log.operation : '-';

              return (
                <div
                  key={log.id}
                  className="card"
                  style={styles.logCard}
                  onClick={() => setSelectedLog(log)}
                >
                  <div style={styles.logInfo}>
                    <div style={styles.logTopRow}>
                      <span style={styles.logDate}>{formatDate(log.createdDate)}</span>
                      {opColor && (
                        <span style={{ ...styles.opBadge, backgroundColor: opColor.bg, color: opColor.color }}>
                          {opLabel}
                        </span>
                      )}
                    </div>
                    <div style={styles.logDetails}>
                      <span style={styles.logTable}>{tableLabel}</span>
                      {log.userName && (
                        <>
                          <span style={styles.bullet}>•</span>
                          <span style={styles.logUser}>{log.userName}</span>
                        </>
                      )}
                      {!log.userName && log.userEmail && (
                        <>
                          <span style={styles.bullet}>•</span>
                          <span style={styles.logUser}>{log.userEmail}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}
                  />
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
                'Carregar mais'
              )}
            </button>
          )}
        </div>
      )}

      {/* Modal de detalhes */}
      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

// ─── Estilos ────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerIcon: {
    width: '44px', height: '44px', borderRadius: '10px',
    backgroundColor: 'hsla(var(--primary), 0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  title: { fontSize: '1.5rem', fontWeight: 700 },
  subtitle: { fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.15rem' },
  controlsCard: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  topRow: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
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
  },
  select: {
    padding: '0.55rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--background))',
    fontSize: '0.875rem',
    color: 'hsl(var(--foreground))',
    outline: 'none',
    width: '100%',
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
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  logCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.875rem 1.25rem',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  logInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 },
  logTopRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  logDate: { fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' },
  opBadge: { padding: '0.15rem 0.6rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700 },
  logDetails: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'hsl(var(--foreground))' },
  logTable: { fontWeight: 600 },
  logUser: { color: 'hsl(var(--muted-foreground))' },
  bullet: { color: 'hsl(var(--border))' },
  loadMoreBtn: {
    alignSelf: 'center',
    marginTop: '0.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
};

// ─── Estilos do Modal ───────────────────────────────────────────────────────
const modalStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  content: {
    backgroundColor: 'hsl(var(--background))',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '85vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid hsl(var(--border))',
  },
  title: { fontSize: '1.1rem', fontWeight: 700 },
  subtitle: { fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.2rem' },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'hsl(var(--muted-foreground))', padding: '0.25rem',
    borderRadius: '6px', transition: 'background 0.15s',
  },
  meta: {
    display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem',
    padding: '1rem 1.5rem',
    fontSize: '0.8rem',
    color: 'hsl(var(--muted-foreground))',
    backgroundColor: 'hsl(var(--muted))',
  },
  section: { padding: '1rem 1.5rem' },
  sectionTitle: { fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' },
  tableWrapper: { overflowX: 'auto', borderRadius: '8px', border: '1px solid hsl(var(--border))' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' },
  th: {
    padding: '0.6rem 0.75rem',
    textAlign: 'left',
    fontWeight: 600,
    backgroundColor: 'hsl(var(--muted))',
    borderBottom: '1px solid hsl(var(--border))',
    whiteSpace: 'nowrap',
  },
  tdKey: {
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid hsl(var(--border))',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    color: 'hsl(var(--muted-foreground))',
  },
  tdValue: {
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid hsl(var(--border))',
    wordBreak: 'break-all',
  },
  diffRow: {
    backgroundColor: 'hsla(45, 93%, 47%, 0.06)',
  },
};
