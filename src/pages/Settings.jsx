import React from 'react';
import SeedDataButton from '../components/SeedDataButton';
import { Settings as SettingsIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
  const { t } = useLanguage();
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <SettingsIcon size={32} color="var(--google-blue)" />
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{t('nav.settings')}</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Configuration and administrative tools</p>
        </div>
      </div>
      
      <div className="card">
        <h3 className="card-title">General Configuration</h3>
        <p className="small-text">Settings and user management will be implemented here.</p>
      </div>

      <SeedDataButton />
    </div>
  );
};

export default Settings;
