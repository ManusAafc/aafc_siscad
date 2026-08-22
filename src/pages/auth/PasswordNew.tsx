import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { ButtonLoading, dispatchLoadingStart, dispatchLoadingEnd } from '../../components/common/ButtonLoading';

export const PasswordNew: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword, isLoading } = useAuthStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const hash = window.location.hash;
      const hasRecoveryToken = hash.includes('access_token') || hash.includes('type=recovery');

      if (hasRecoveryToken) {
        setTokenValid(true);
      } else if (data.session) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    dispatchLoadingStart();
    const result = await updatePassword(newPassword);
    dispatchLoadingEnd();

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Senha redefinida com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Nova Senha</h1>
          <p style={styles.subtitle}>Informe sua nova senha abaixo para redefinir o acesso</p>
        </div>

        {tokenValid === false && (
          <div style={styles.warningAlert}>
            <AlertTriangle size={18} />
            <span>Link de recuperação inválido ou expirado.</span>
            <Link to="/recovery" style={styles.recoveryLink}>
              Solicitar novo link
            </Link>
          </div>
        )}

        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            {success}
          </div>
        )}

        <form onSubmit={handleUpdatePassword}>
          <div className="input-group">
            <label className="input-label" htmlFor="newPassword">Nova Senha</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                style={styles.inputWithIcon}
                placeholder="Mínimo de 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="confirmPassword">Confirmar Nova Senha</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                style={styles.inputWithIcon}
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <ButtonLoading
            type="submit"
            className="btn btn-primary w-full"
            style={styles.submitBtn}
            loading={isLoading}
            loadingText="Salvando..."
          >
            Salvar Senha
          </ButtonLoading>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={{ fontWeight: 600 }}>
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '1.5rem',
    backgroundColor: 'hsl(var(--background))',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem 2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    color: 'hsl(var(--primary))',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'hsl(var(--muted-foreground))',
    fontSize: '0.925rem',
  },
  errorAlert: {
    padding: '0.75rem 1rem',
    backgroundColor: 'hsla(var(--destructive), 0.1)',
    color: 'hsl(var(--destructive))',
    borderRadius: 'var(--radius)',
    fontSize: '0.875rem',
    marginBottom: '1.25rem',
    border: '1px solid hsla(var(--destructive), 0.2)',
  },
  successAlert: {
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: 'rgb(16, 185, 129)',
    borderRadius: 'var(--radius)',
    fontSize: '0.875rem',
    marginBottom: '1.25rem',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.75rem',
    color: 'hsl(var(--muted-foreground))',
  },
  inputWithIcon: {
    paddingLeft: '2.5rem',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0.75rem',
    color: 'hsl(var(--muted-foreground))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningAlert: {
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: 'rgb(245, 158, 11)',
    borderRadius: 'var(--radius)',
    fontSize: '0.875rem',
    marginBottom: '1.25rem',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    textAlign: 'center',
  },
  recoveryLink: {
    fontWeight: 600,
    color: 'rgb(245, 158, 11)',
  },
  submitBtn: {
    height: '2.75rem',
    marginTop: '1.5rem',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
    fontSize: '0.875rem',
  }
};
