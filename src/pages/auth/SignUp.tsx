import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { ButtonLoading, dispatchLoadingStart, dispatchLoadingEnd } from '../../components/common/ButtonLoading';
import { getPasswordStrength } from '../../utils/validators';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isSubmitting) return;

    if (!name || !email || !password || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setIsSubmitting(true);
    dispatchLoadingStart();
    const result = await signUp(email, password, name);
    dispatchLoadingEnd();
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.');
      setTimeout(() => navigate('/login'), 5000);
    }
  };

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Criar Conta</h1>
          <p style={styles.subtitle}>Preencha os dados abaixo para se cadastrar</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && <div style={styles.successAlert}>{success}</div>}

        <form onSubmit={handleSignUp}>
          <div className="input-group">
            <label className="input-label" htmlFor="name">Nome Completo</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                id="name"
                type="text"
                className="input-control"
                style={styles.inputWithIcon}
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="input-group">
            <label className="input-label" htmlFor="password">Senha</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                style={styles.inputWithIcon}
                placeholder="Mínimo de 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password.length > 0 && (
              <div style={styles.strengthContainer}>
                <div style={styles.strengthBar}>
                  <div
                    style={{
                      ...styles.strengthFill,
                      width: `${(passwordStrength.score / 6) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <span style={{ ...styles.strengthLabel, color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="confirmPassword">Confirmar Senha</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                style={styles.inputWithIcon}
                placeholder="Confirme sua senha"
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
            loading={isLoading || isSubmitting}
            loadingText="Criando conta..."
          >
            Criar Conta
          </ButtonLoading>
        </form>

        <div style={styles.footer}>
          <span>Já tem uma conta? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>
            Entrar
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
    maxWidth: '440px',
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
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  strengthContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  strengthBar: {
    flex: 1,
    height: '4px',
    backgroundColor: '#e0e0e0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    transition: 'width 0.3s, background-color 0.3s',
  },
  strengthLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  submitBtn: {
    height: '2.75rem',
    marginTop: '1.5rem',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))',
  },
};
