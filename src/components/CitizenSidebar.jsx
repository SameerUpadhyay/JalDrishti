import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  FlaskConical,
  Truck,
  Droplets,
  ArrowLeft,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CitizenSidebar = () => {
  const { setRole } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleBackToHome = () => {
    setRole(null);
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Droplets size={28} color="var(--google-blue)" />
        <span className="sidebar-logo-text" style={{ color: 'var(--google-blue)' }}>
          JalDrishti <span style={{ color: '#EA4335' }}>Citizen</span>
        </span>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">{t('nav.citizen.services')}</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          <NavLink to="/citizen/quality" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <FlaskConical size={20} />
            <span>{t('nav.quality')}</span>
          </NavLink>

          <NavLink to="/citizen/request-tanker" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <PlusCircle size={20} />
            <span>{t('nav.request.tanker')}</span>
          </NavLink>
          
          <NavLink to="/citizen/tankers" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Truck size={20} />
            <span>{t('nav.tanker.tracker')}</span>
          </NavLink>
        </nav>
      </div>

      <div style={{ flex: 1 }}></div>

      <div className="nav-section" style={{ borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavLink to="/citizen/chatbot" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <MessageSquare size={20} />
            <span>{t('nav.chatbot')}</span>
          </NavLink>
          <button onClick={handleBackToHome} className="nav-item" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <ArrowLeft size={20} />
            <span>{t('btn.back.home')}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default CitizenSidebar;
