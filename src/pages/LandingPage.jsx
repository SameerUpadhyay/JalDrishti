import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Droplets } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setCitizenRole } = useAuth();
  const { t } = useLanguage();

  const handleCitizenContinue = () => {
    setCitizenRole();
    navigate('/citizen/chatbot'); // default route for citizen
  };

  const handleAdminLogin = () => {
    navigate('/login');
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
      <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
        <LanguageSwitcher />
      </div>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        padding: '40px',
        textAlign: 'center'
      }}>
          <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Droplets size={64} color="var(--google-blue)" />
          <h1 style={{ fontSize: '3rem', color: 'var(--text-primary)', marginTop: '16px' }}>{t('app.title')}</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{t('app.subtitle')}</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {/* Admin Card */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid transparent' }}
            onClick={handleAdminLogin}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--google-blue)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <img src="/admin-icon.png" alt="Admin Portal" style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{t('landing.admin.title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{t('landing.admin.desc')}</p>
            <button className="button button-primary" style={{ width: '100%' }}>{t('btn.login.admin')}</button>
          </div>

          {/* Citizen Card */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s', border: '2px solid transparent' }}
            onClick={handleCitizenContinue}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--google-green)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <img src="/citizen-icon.png" alt="Citizen Services" style={{ width: '48px', height: '48px', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{t('landing.citizen.title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{t('landing.citizen.desc')}</p>
            <button className="button button-secondary" style={{ width: '100%', borderColor: 'var(--google-green)', color: 'var(--google-green)' }}>{t('btn.continue.citizen')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
