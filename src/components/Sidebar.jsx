import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Search, 
  Truck, 
  Settings,
  Droplets,
  LogOut,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Droplets size={28} color="var(--google-blue)" />
        <span className="sidebar-logo-text">
          JalDrishti <span style={{ color: '#EA4335' }}>Admin</span>
        </span>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">{t('nav.operations')}</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavLink to="/admin" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end>
            <LayoutDashboard size={20} />
            <span>{t('nav.dashboard')}</span>
          </NavLink>
          
          <NavLink to="/admin/forecasting" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <TrendingUp size={20} />
            <span>{t('nav.forecast')}</span>
          </NavLink>

          <NavLink to="/admin/leaks" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Search size={20} />
            <span>{t('nav.leak')}</span>
          </NavLink>
          
          <NavLink to="/admin/tankers" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Truck size={20} />
            <span>{t('nav.dispatch')}</span>
          </NavLink>

          <NavLink to="/admin/quality" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <FlaskConical size={20} />
            <span>{t('nav.quality')}</span>
          </NavLink>
        </nav>
      </div>

      <div style={{ flex: 1 }}></div>

      <div className="nav-section" style={{ borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavLink to="/admin/settings" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Settings size={20} />
            <span>{t('nav.settings')}</span>
          </NavLink>
          <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <LogOut size={20} />
            <span>{t('btn.logout')}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
