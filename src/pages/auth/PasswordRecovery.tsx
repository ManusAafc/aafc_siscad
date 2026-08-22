import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, ArrowLeft } from 'lucide-react';
import { ButtonLoading, dispatchLoadingStart, dispatchLoadingEnd } from '../../components/common/ButtonLoading';

export const PasswordRecovery: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Informe seu email');
      return;
    }

    dispatchLoadingStart();
    const result = await resetPassword(email);
    dispatchLoadingEnd();

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Email enviado com sucesso! Verifique sua caixa de entrada.');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Recuperar Senha</h1>
          <p style={styles.subtitle}>Informe seu email para receber o link de recuperação de senha</p>
        </div>

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

        <form onSubmit={handleResetPassword}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                id="email"
                type="email"
                className="input-control"
                style={styles.inputWithIcon}
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <ButtonLoading
            type="submit"
            className="btn btn-primary w-full"
            style={styles.submitBtn}
            loading={isLoading}
            loadingText="Enviando..."
          >
            Enviar Link
          </ButtonLoading>

          <p style={styles.hint}>
            Verifique também a pasta de spam/lixo eletrônico
          </p>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Voltar para o login</span>
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
  submitBtn: {
    height: '2.75rem',
    marginTop: '1rem',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'hsl(var(--muted-foreground))',
  },
  hint: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'hsl(var(--muted-foreground))',
    marginTop: '1rem',
  },
};
