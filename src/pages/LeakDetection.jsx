import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Search, MapPin, AlertTriangle, Droplet, Flame, Loader2 } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useLanguage } from '../context/LanguageContext';
import { useMapLoader } from '../context/MapContext';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 12.9716, lng: 77.5946 }; // Bengaluru

// Helper to get coordinates for mock data locations with a deterministic jitter to prevent stacking
const coordsCache = {};
const getCoords = (locationString) => {
  const loc = (locationString || '').toLowerCase();
  if (coordsCache[loc]) return coordsCache[loc];

  // Deterministic fallback using string length and char code
  const hash = loc.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const jitterLat = ((hash % 100) / 100 - 0.5) * 0.015;
  const jitterLng = (((hash * 7) % 100) / 100 - 0.5) * 0.015;

  const applyJitter = (lat, lng) => ({
    lat: lat + jitterLat,
    lng: lng + jitterLng
  });

  let result;
  if (!locationString) result = applyJitter(center.lat, center.lng);
  else if (loc.includes('whitefield')) result = applyJitter(12.9698, 77.7499);
  else if (loc.includes('sarjapur')) result = applyJitter(12.9239, 77.6844);
  else if (loc.includes('koramangala')) result = applyJitter(12.9279, 77.6271);
  else if (loc.includes('indiranagar')) result = applyJitter(12.9784, 77.6408);
  else if (loc.includes('bellandur')) result = applyJitter(12.9304, 77.6784);
  else if (loc.includes('hsr')) result = applyJitter(12.9121, 77.6446);
  else if (loc.includes('electronic')) result = applyJitter(12.8452, 77.6602);
  else result = applyJitter(center.lat, center.lng);

  coordsCache[loc] = result;
  return result;
};

const mapOptions = { mapTypeControl: false, streetViewControl: false };

// Mock Z-Score Data
const mockZScoreData = {
  'Whitefield': [
    { time: '08:00', sensorValue: 0.5 },
    { time: '09:00', sensorValue: 0.6 },
    { time: '10:00', sensorValue: 0.4 },
    { time: '11:00', sensorValue: 0.8 },
    { time: '12:00', sensorValue: 3.5 }, // Anomaly
    { time: '13:00', sensorValue: 4.2 },
    { time: '14:00', sensorValue: 3.8 },
  ],
  'Sarjapur': [
    { time: '08:00', sensorValue: 0.2 },
    { time: '09:00', sensorValue: 0.3 },
    { time: '10:00', sensorValue: 0.5 },
    { time: '11:00', sensorValue: 0.4 },
    { time: '12:00', sensorValue: 0.6 },
    { time: '13:00', sensorValue: 0.7 },
    { time: '14:00', sensorValue: 0.5 },
  ],
  'Koramangala': [
    { time: '08:00', sensorValue: 1.1 },
    { time: '09:00', sensorValue: 1.2 },
    { time: '10:00', sensorValue: 1.5 },
    { time: '11:00', sensorValue: 1.4 },
    { time: '12:00', sensorValue: 3.2 }, // Anomaly
    { time: '13:00', sensorValue: 3.0 },
    { time: '14:00', sensorValue: 1.6 },
  ],
  'Indiranagar': [
    { time: '08:00', sensorValue: 0.8 },
    { time: '09:00', sensorValue: 0.9 },
    { time: '10:00', sensorValue: 0.7 },
    { time: '11:00', sensorValue: 0.9 },
    { time: '12:00', sensorValue: 1.1 },
    { time: '13:00', sensorValue: 1.0 },
    { time: '14:00', sensorValue: 0.8 },
  ],
  'Electronic City': [
    { time: '08:00', sensorValue: 0.3 },
    { time: '09:00', sensorValue: 0.4 },
    { time: '10:00', sensorValue: 0.3 },
    { time: '11:00', sensorValue: 0.6 },
    { time: '12:00', sensorValue: 0.5 },
    { time: '13:00', sensorValue: 3.8 }, // Anomaly
    { time: '14:00', sensorValue: 4.5 },
  ],
  'HSR Layout': [
    { time: '08:00', sensorValue: 1.2 },
    { time: '09:00', sensorValue: 1.1 },
    { time: '10:00', sensorValue: 1.3 },
    { time: '11:00', sensorValue: 1.0 },
    { time: '12:00', sensorValue: 0.9 },
    { time: '13:00', sensorValue: 1.2 },
    { time: '14:00', sensorValue: 1.4 },
  ],
  'Bellandur': [
    { time: '08:00', sensorValue: 0.6 },
    { time: '09:00', sensorValue: 0.8 },
    { time: '10:00', sensorValue: 3.1 }, // Anomaly
    { time: '11:00', sensorValue: 3.6 },
    { time: '12:00', sensorValue: 4.1 },
    { time: '13:00', sensorValue: 3.9 },
    { time: '14:00', sensorValue: 3.5 },
  ]
};

const AnomalyCard = ({ type, location, time, severity, severityColor }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderBottom: '1px solid var(--border-light)' }}>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{type}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{time}</span>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{location}</div>
    </div>
    <div className={`badge`} style={{ background: `rgba(${severityColor}, 0.1)`, color: `rgb(${severityColor})` }}>
      {severity}
    </div>
  </div>
);



const LeakDetection = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const { isLoaded } = useMapLoader();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'anomalies'), (snapshot) => {
      const anomaliesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnomalies(anomaliesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const mapElement = React.useMemo(() => {
    if (!isLoaded) {
      return (
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={32} className="animate-spin" color="var(--google-blue)" />
        </div>
      );
    }
    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        options={mapOptions}
      >
        {anomalies.map((anomaly) => (
          <Marker 
            key={anomaly.id} 
            position={getCoords(anomaly.location)} 
            title={anomaly.type}
          />
        ))}
      </GoogleMap>
    );
  }, [isLoaded, anomalies]);

  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedWard, setSelectedWard] = useState('Whitefield');
  const zData = mockZScoreData[selectedWard];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">{t('leak.title')}</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', marginBottom: '24px' }}>
        
        {/* Map Area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Live Sensor Network</h3>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Alert</span>
            </div>
          </div>
          
          <div style={{ flex: 1, minHeight: '400px', backgroundColor: '#e5e3df', position: 'relative', outline: '4px solid var(--google-blue)', outlineOffset: '-4px' }}>
             {mapElement}
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)' }}>
            <h3 className="card-title" style={{ margin: 0 }}>{t('leak.active')}</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}><Loader2 size={24} className="animate-spin" color="var(--google-blue)" /></div>
            ) : anomalies.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No anomalies detected. Run Seed Data in Settings.</div>
            ) : (
              anomalies.map(anomaly => <AnomalyCard key={anomaly.id} {...anomaly} />)
            )}
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid var(--border-default)' }}>
             <button className="button-secondary" style={{ width: '100%' }} onClick={() => setShowLogModal(true)}>View Full Log</button>
          </div>
        </div>
      </div>

      {showLogModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '900px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-default)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <h2 className="card-title" style={{ margin: 0 }}>Full Anomaly Log</h2>
                <p className="small-text">Complete historical record of all detected network incidents.</p>
              </div>
              <button className="button-secondary" onClick={() => setShowLogModal(false)}>Close</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table>
                <thead>
                  <tr>
                    <th>Incident ID</th>
                    <th>Classification</th>
                    <th>Location</th>
                    <th>Time Detected</th>
                    <th>Severity Level</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map(a => (
                    <tr key={a.id}>
                      <td className="mono" style={{ color: 'var(--google-blue)' }}>{a.id}</td>
                      <td style={{ fontWeight: 500 }}>{a.type}</td>
                      <td>{a.location}</td>
                      <td>{a.time}</td>
                      <td>
                        <span className="badge" style={{ background: `rgba(${a.severityColor}, 0.1)`, color: `rgb(${a.severityColor})` }}>{a.severity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Z-Score Analysis Chart */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>Z-Score Pressure Variance Analysis</h3>
            <p className="small-text">Anomalies flagged when Z-score &gt; 3.0</p>
          </div>
          <select 
            value={selectedWard} 
            onChange={(e) => setSelectedWard(e.target.value)}
            style={{ 
              padding: '10px 16px', 
              borderRadius: '100px', 
              border: '1px solid var(--border-default)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              background: 'var(--bg-surface)',
              cursor: 'pointer'
            }}
          >
            {Object.keys(mockZScoreData).map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
        
        <div style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={zData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
              />
              <ReferenceLine y={3} stroke="#EA4335" strokeDasharray="3 3" label={{ value: 'Anomaly Threshold (Z=3)', position: 'insideTopLeft', fill: '#EA4335', fontSize: 12 }} />
              <Line 
                type="monotone" 
                name={`${selectedWard} Sensor`} 
                dataKey="sensorValue" 
                stroke="var(--google-blue)" 
                strokeWidth={3} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LeakDetection;
