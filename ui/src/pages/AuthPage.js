import { useState } from 'react';
import { useAuth } from '../AuthContext';
import * as api from '../api/client';
import './Auth.css';

export default function AuthPage() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.login(form.username, form.password);
        signIn({ id: res.user_id, username: res.username });
      } else {
        await api.register(form.username, form.email, form.password);
        const res = await api.login(form.username, form.password);
        signIn({ id: res.user_id, username: res.username });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h1 className="auth-logo">TaskFlow</h1>
        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Prijava</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Registracija</button>
        </div>
        <form onSubmit={submit}>
          <label>Uporabniško ime</label>
          <input name="username" value={form.username} onChange={handle} required autoFocus />
          {mode === 'register' && <>
            <label>E-pošta</label>
            <input name="email" type="email" value={form.email} onChange={handle} required />
          </>}
          <label>Geslo</label>
          <input name="password" type="password" value={form.password} onChange={handle} required />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Nalaganje…' : mode === 'login' ? 'Prijava' : 'Registracija'}
          </button>
        </form>
      </div>
    </div>
  );
}
