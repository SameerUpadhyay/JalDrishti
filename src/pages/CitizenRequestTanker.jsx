import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Truck, MapPin, Droplets, AlertTriangle, CheckCircle, Loader2, Copy, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const CitizenRequestTanker = () => {
  const [formData, setFormData] = useState({
    area: 'Whitefield',
    volume: '5000',
    urgency: 'Normal',
    addressDetails: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Generate Tracking ID
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const trackingId = `TNK-2026-${randomStr}`;
    
    try {
      await addDoc(collection(db, 'requests'), {
        area: formData.area,
        volume: parseInt(formData.volume),
        urgency: formData.urgency,
        addressDetails: formData.addressDetails,
        phone: formData.phone,
        status: 'Pending',
        trackingId: trackingId,
        timestamp: serverTimestamp()
      });
      
      setSuccessData({
        trackingId,
        ...formData
      });
    } catch (error) {
      console.error("Error submitting request: ", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ width: '64px', height: '64px', background: '#E6F4EA', color: '#137333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={32} />
          </div>
          <h2 style={{ marginBottom: '16px' }}>{t('request.success.title')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            {t('request.success.desc')}
          </p>
          
          <div style={{ background: 'var(--bg-default)', padding: '24px', borderRadius: '12px', border: '1px dashed var(--border-default)', marginBottom: '32px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Your Tracking Number</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--science-blue)', letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              {successData.trackingId}
              <button onClick={() => navigator.clipboard.writeText(successData.trackingId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Copy to clipboard">
                <Copy size={20} />
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
             <button className="btn btn-secondary" onClick={() => setSuccessData(null)}>{t('btn.another.request')}</button>
             <button className="btn btn-primary" onClick={() => navigate('/citizen/tankers', { state: { trackingId: successData.trackingId } })}>{t('btn.track.tanker')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">{t('request.title')}</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>{t('form.area')}</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                <select 
                  name="area"
                  value={formData.area} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
                  required
                >
                  <option value="Whitefield">Whitefield</option>
                  <option value="Sarjapur">Sarjapur</option>
                  <option value="Koramangala">Koramangala</option>
                  <option value="Indiranagar">Indiranagar</option>
                  <option value="Electronic City">Electronic City</option>
                  <option value="HSR Layout">HSR Layout</option>
                  <option value="Bellandur">Bellandur</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>{t('form.volume')}</label>
              <div style={{ position: 'relative' }}>
                <Droplets size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                <select 
                  name="volume"
                  value={formData.volume} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
                  required
                >
                  <option value="5000">5,000 Liters (Standard)</option>
                  <option value="10000">10,000 Liters (Large)</option>
                  <option value="15000">15,000 Liters (Community)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>{t('form.address')}</label>
            <input 
              type="text" 
              name="addressDetails"
              value={formData.addressDetails}
              onChange={handleInputChange}
              placeholder="e.g., Block B, Palm Meadows, near Gate 2"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
              required
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>{t('form.phone')}</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 XXXXX XXXXX"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: 'var(--text-primary)' }}>{t('form.urgency')}</label>
              <div style={{ position: 'relative' }}>
                <AlertTriangle size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                <select 
                  name="urgency"
                  value={formData.urgency} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
                  required
                >
                  <option value="Normal">Normal (Next 24 Hrs)</option>
                  <option value="High">High (Next 12 Hrs)</option>
                  <option value="Critical">Critical (ASAP)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--google-blue-bg)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '8px' }}>
            <Info size={20} color="var(--google-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: 'var(--google-blue)', margin: 0, lineHeight: 1.5 }}>
              Standard requests are routed to municipal tankers automatically. Critical urgency requests may be routed to private fleet operators based on availability, which may incur standard private rates.
            </p>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px', backgroundColor: 'var(--google-blue)', color: 'white', border: 'none', borderRadius: '100px' }}
            disabled={loading}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Truck size={20} />}
            {loading ? t('btn.submitting') : t('btn.submit.request')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CitizenRequestTanker;
