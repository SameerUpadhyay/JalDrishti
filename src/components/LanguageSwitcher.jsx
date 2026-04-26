import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-default)', borderRadius: '100px', border: '1px solid var(--border-default)' }}>
      <Globe size={16} color="var(--text-secondary)" />
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          border: 'none',
          background: 'transparent',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          outline: 'none',
          paddingRight: '4px'
        }}
      >
        <option value="en">{t('lang.english')}</option>
        <option value="kn">{t('lang.kannada')}</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
