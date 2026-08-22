import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { ButtonLoading, dispatchLoadingStart, dispatchLoadingEnd } from '../../components/common/ButtonLoading';
import aafcLogo from '../../assets/aafc_logo.jpg';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    dispatchLoadingStart();
    const result = await signIn(email, password);
    dispatchLoadingEnd();

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/');
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <img src={aafcLogo} alt="AAFC Logo" style={styles.logo} />
          <h1 style={styles.title}>Manus Siscad</h1>
          <p style={styles.subtitle}>Faça login para continuar na AAFC</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn}>
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
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label className="input-label" htmlFor="password">Senha</label>
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                style={styles.inputWithIcon}
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <Link to="/recovery" style={styles.forgotLink}>
              Esqueceu a senha?
            </Link>
          </div>

          <ButtonLoading
            type="submit"
            className="btn btn-primary w-full"
            style={styles.submitBtn}
            loading={isLoading}
            loadingText="Entrando..."
          >
            Entrar
          </ButtonLoading>
        </form>

        <div style={styles.footer}>
          <span>Não tem uma conta? </span>
          <Link to="/register" style={{ fontWeight: 600 }}>
            Criar conta
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
  logo: {
    width: '120px',
    height: '120px',
    objectFit: 'contain',
    marginBottom: '1rem',
    borderRadius: '50%',
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
  forgotLink: {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  submitBtn: {
    height: '2.75rem',
    marginTop: '0.5rem',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))',
  }
};
