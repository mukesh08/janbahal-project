import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/admin', { replace: true });
    const saved = localStorage.getItem('newacore_saved_email');
    if (saved) { setForm(f => ({ ...f, email: saved })); setRememberMe(true); }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (view === 'register') {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
        if (rememberMe) localStorage.setItem('newacore_saved_email', form.email);
        else localStorage.removeItem('newacore_saved_email');
      }
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>NewaCore</h1>

        {view === 'forgot' ? (
          <>
            <h2 style={styles.title}>Forgot Password</h2>
            <p style={styles.sub}>Enter your email and we'll send you a temporary password.</p>
            {error   && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.successMsg}>{success}</p>}
            <form onSubmit={handleForgotPassword} style={styles.form}>
              <input
                style={styles.input}
                type="email"
                placeholder="Your email address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              <button style={styles.button} type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Temporary Password'}
              </button>
            </form>
            <p style={styles.toggle}>
              <span style={styles.link} onClick={() => { setView('login'); setError(''); setSuccess(''); }}>
                ← Back to Login
              </span>
            </p>
          </>
        ) : (
          <>
            <h2 style={styles.title}>{view === 'register' ? 'Create Admin Account' : 'Admin Login'}</h2>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleSubmit} style={styles.form}>
              {view === 'register' && (
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              )}
              <input
                style={styles.input}
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <div style={styles.passwordWrapper}>
                <input
                  style={{ ...styles.input, marginBottom: 0, paddingRight: '2.8rem', width: '100%', boxSizing: 'border-box' }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                </button>
              </div>

              {view === 'login' && (
                <div style={styles.loginMeta}>
                  <label style={styles.rememberLabel}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: '#4f46e5', cursor: 'pointer' }}
                    />
                    Remember me
                  </label>
                  <span style={styles.link} onClick={() => { setView('forgot'); setError(''); }}>
                    Forgot password?
                  </span>
                </div>
              )}

              <button style={styles.button} type="submit" disabled={loading}>
                {loading ? 'Please wait...' : view === 'register' ? 'Register' : 'Login'}
              </button>
            </form>
            <p style={styles.toggle}>
              {view === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span style={styles.link} onClick={() => { setView(view === 'register' ? 'login' : 'register'); setError(''); }}>
                {view === 'register' ? 'Login' : 'Register'}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' },
  card: { background: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', width: '100%', maxWidth: '400px' },
  logo: { textAlign: 'center', fontSize: '2rem', fontWeight: '800', color: '#4f46e5', marginBottom: '0.25rem' },
  title: { textAlign: 'center', fontSize: '1.1rem', color: '#555', marginBottom: '0.5rem', fontWeight: '400' },
  sub: { textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.75rem 1rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none' },
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' },
  loginMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-0.25rem' },
  rememberLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer', userSelect: 'none' },
  button: { padding: '0.75rem', fontSize: '1rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  error: { color: '#e53e3e', background: '#fff5f5', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  successMsg: { color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  toggle: { textAlign: 'center', marginTop: '1.25rem', color: '#666', fontSize: '0.9rem' },
  link: { color: '#4f46e5', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
};

export default Login;
