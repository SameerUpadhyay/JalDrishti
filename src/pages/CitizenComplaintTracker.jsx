import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const CitizenComplaintTracker = () => {
  const location = useLocation();
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(location.state?.trackingId || '');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const res = await fetch('http://localhost:3002/api/anomalies');
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setAnomalies(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching anomalies:', err);
      }
    };

    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const found = anomalies.find(a => a.trackingId === searchQuery.trim().toUpperCase());
      setTrackedComplaint(found || null);
    } else {
      setTrackedComplaint(null);
    }
  }, [searchQuery, anomalies]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">{t('complaint.title')}</h1>
        <p className="page-subtitle">{t('complaint.subtitle')}</p>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder={t('complaint.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '16px 16px 16px 48px', 
              borderRadius: '100px', 
              border: '2px solid var(--border-light)', 
              fontSize: '16px', 
              background: 'var(--bg-surface)', 
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--google-blue)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={32} className="animate-spin" color="var(--google-blue)" />
        </div>
      )}

      {/* Results */}
      {!loading && trackedComplaint && (
        <div className="card" style={{ background: '#FCE8E6', border: '1px solid #C5221F', animation: 'slideUp 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#C5221F', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
              <AlertTriangle size={24} /> Complaint: {trackedComplaint.trackingId}
            </h3>
            <div className="badge critical" style={{ fontSize: '14px', padding: '8px 16px' }}>
              {trackedComplaint.severity} Priority
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '16px', color: 'var(--text-primary)' }}>
            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#C5221F', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Location</div>
              <div>{trackedComplaint.location}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#C5221F', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Issue Type</div>
              <div>{trackedComplaint.type}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#C5221F', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Current Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C5221F', animation: 'pulse 2s infinite' }}></div>
                 BWSSB Notified & Investigating
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#C5221F', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Reported</div>
              <div>{trackedComplaint.time || 'Recently'}</div>
            </div>
          </div>
        </div>
      )}

      {/* No Results state */}
      {!loading && searchQuery && !trackedComplaint && (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Search size={32} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <h3>No Complaint Found</h3>
          <p>We couldn't find a complaint with ID "{searchQuery}". Please check your tracking ID and try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !searchQuery && (
         <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
           <AlertTriangle size={48} style={{ opacity: 0.1, margin: '0 auto 16px' }} />
           <p>Enter your complaint tracking ID above to check its real-time status.</p>
         </div>
      )}

    </div>
  );
};

export default CitizenComplaintTracker;
