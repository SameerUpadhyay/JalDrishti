import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets, Lock, Mail, AlertCircle } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin, demoLoginAdmin } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin(email, password);
      navigate('/admin');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      await demoLoginAdmin();
      navigate('/admin');
    } catch (err) {
      setError('Failed to log in with demo account.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-default)',
      position: 'relative'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Droplets size={48} color="var(--google-blue)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>{t('landing.admin.title')} Login</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{t('app.title')} Platform</p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px', 
            background: '#FCE8E6', 
            color: '#C5221F', 
            borderRadius: '8px', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
                placeholder="admin@jaldrishti.com"
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '14px'
                }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="button button-primary" 
            disabled={loading}
            style={{ marginTop: '8px', padding: '12px' }}
          >
            {loading ? t('btn.submitting') : t('btn.login.admin')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>For Demo Purposes</p>
          <button 
            type="button" 
            onClick={handleDemoLogin} 
            className="button button-secondary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {t('btn.login.demo')}
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {t('btn.back.home')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
