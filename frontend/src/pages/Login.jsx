import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password || (isRegistering && !name.trim())) {
      setError(isRegistering ? 'Enter your name, username, and password' : 'Enter a username and password first');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (isRegistering) await register(name, username, password);
      else await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || (isRegistering ? 'Registration failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand" style={{ marginBottom: 24 }}>
          <span className="brand-mark">DT</span>
          <div className="brand-text">
            <div className="brand-title">Station Digital Twin</div>
            <div className="brand-sub">NCPOR &middot; Ministry of Earth Sciences</div>
          </div>
        </div>

        {isRegistering && <>
          <label className="field-label">Name</label>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </>}

        <label className="field-label">Username</label>
        <input className="field-input" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />

        <label className="field-label">Password</label>
        <input className="field-input" type="password" minLength={isRegistering ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} />

        {isRegistering && <p className="login-hint">New accounts have read-only HQ access. Password must be at least 8 characters.</p>}

        {error && <div className="field-error">{error}</div>}

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? (isRegistering ? 'Creating account...' : 'Signing in...') : (isRegistering ? 'Create account' : 'Sign in')}
        </button>

        {!isRegistering && <p className="login-hint">
          Demo accounts: <code>operator / operator123</code> (read+write) or <code>hq / hq123</code> (read-only)
        </p>}
        <button className="btn-small" type="button" onClick={() => { setIsRegistering((value) => !value); setError(''); }}>
          {isRegistering ? 'Back to sign in' : 'Create an account'}
        </button>
      </form>
    </div>
  );
}
