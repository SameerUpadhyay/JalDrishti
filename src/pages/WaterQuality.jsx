import React, { useState, useRef, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Info, Loader2 } from 'lucide-react';
import { GoogleMap, HeatmapLayerF } from '@react-google-maps/api';
import { useLanguage } from '../context/LanguageContext';
import { useMapLoader } from '../context/MapContext';

const mockQualityDataMap = {
  'Whitefield': [
    { subject: 'pH Level', A: 85, fullMark: 100, actual: '7.4' },
    { subject: 'TDS', A: 65, fullMark: 100, actual: '850 ppm' },
    { subject: 'Turbidity', A: 90, fullMark: 100, actual: '2.1 NTU' },
    { subject: 'Coliform', A: 95, fullMark: 100, actual: '0 MPN/100ml' },
    { subject: 'Dissolved O2', A: 80, fullMark: 100, actual: '6.5 mg/L' },
  ],
  'Sarjapur': [
    { subject: 'pH Level', A: 75, fullMark: 100, actual: '8.1' },
    { subject: 'TDS', A: 45, fullMark: 100, actual: '1450 ppm' },
    { subject: 'Turbidity', A: 70, fullMark: 100, actual: '4.5 NTU' },
    { subject: 'Coliform', A: 85, fullMark: 100, actual: '2 MPN/100ml' },
    { subject: 'Dissolved O2', A: 90, fullMark: 100, actual: '7.2 mg/L' },
  ],
  'Koramangala': [
    { subject: 'pH Level', A: 95, fullMark: 100, actual: '7.1' },
    { subject: 'TDS', A: 85, fullMark: 100, actual: '220 ppm' },
    { subject: 'Turbidity', A: 95, fullMark: 100, actual: '0.8 NTU' },
    { subject: 'Coliform', A: 90, fullMark: 100, actual: '0 MPN/100ml' },
    { subject: 'Dissolved O2', A: 85, fullMark: 100, actual: '6.8 mg/L' },
  ],
  'Indiranagar': [
    { subject: 'pH Level', A: 90, fullMark: 100, actual: '7.2' },
    { subject: 'TDS', A: 80, fullMark: 100, actual: '260 ppm' },
    { subject: 'Turbidity', A: 85, fullMark: 100, actual: '1.2 NTU' },
    { subject: 'Coliform', A: 88, fullMark: 100, actual: '0 MPN/100ml' },
    { subject: 'Dissolved O2', A: 92, fullMark: 100, actual: '7.5 mg/L' },
  ],
  'Electronic City': [
    { subject: 'pH Level', A: 82, fullMark: 100, actual: '7.5' },
    { subject: 'TDS', A: 70, fullMark: 100, actual: '780 ppm' },
    { subject: 'Turbidity', A: 85, fullMark: 100, actual: '2.5 NTU' },
    { subject: 'Coliform', A: 90, fullMark: 100, actual: '0 MPN/100ml' },
    { subject: 'Dissolved O2', A: 88, fullMark: 100, actual: '7.0 mg/L' },
  ],
  'HSR Layout': [
    { subject: 'pH Level', A: 88, fullMark: 100, actual: '7.3' },
    { subject: 'TDS', A: 75, fullMark: 100, actual: '410 ppm' },
    { subject: 'Turbidity', A: 92, fullMark: 100, actual: '1.5 NTU' },
    { subject: 'Coliform', A: 95, fullMark: 100, actual: '0 MPN/100ml' },
    { subject: 'Dissolved O2', A: 85, fullMark: 100, actual: '6.5 mg/L' },
  ],
  'Bellandur': [
    { subject: 'pH Level', A: 80, fullMark: 100, actual: '7.6' },
    { subject: 'TDS', A: 55, fullMark: 100, actual: '1250 ppm' },
    { subject: 'Turbidity', A: 75, fullMark: 100, actual: '3.8 NTU' },
    { subject: 'Coliform', A: 80, fullMark: 100, actual: '4 MPN/100ml' },
    { subject: 'Dissolved O2', A: 82, fullMark: 100, actual: '6.2 mg/L' },
  ]
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: 'var(--bg-surface)', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--text-primary)' }}>{data.subject}</p>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
          Value: <span style={{ fontWeight: 600, color: 'var(--science-blue)' }}>{data.actual}</span>
        </p>
      </div>
    );
  }
  return null;
};

const QualityCard = ({ title, grade, status, color }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
    <h3 className="card-title" style={{ marginBottom: '16px' }}>{title}</h3>
    <div style={{ 
      width: '80px', 
      height: '80px', 
      borderRadius: '50%', 
      background: `rgba(${color}, 0.1)`, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '36px',
      fontWeight: 800,
      color: `rgb(${color})`,
      marginBottom: '12px'
    }}>
      {grade}
    </div>
    <div className="badge" style={{ background: `rgba(${color}, 0.1)`, color: `rgb(${color})` }}>
      {status}
    </div>
  </div>
);

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 12.9716, lng: 77.5946 }; // Bengaluru

const mapOptions = { 
  mapTypeControl: false, 
  streetViewControl: false, 
  styles: [
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }, { lightness: 17 }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 20 }] },
    { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }, { lightness: 17 }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }] },
    { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 18 }] },
    { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 16 }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 21 }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dedede' }, { lightness: 21 }] },
    { elementType: 'labels.text.stroke', stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }] },
    { elementType: 'labels.text.fill', stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f2f2f2' }, { lightness: 19 }] },
    { featureType: 'administrative', elementType: 'geometry.fill', stylers: [{ color: '#fefefe' }, { lightness: 20 }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }] }
  ]
};

const heatmapOptions = {
  radius: 35,
  opacity: 0.45,
  gradient: [
    'rgba(34, 197, 94, 0)',    // Transparent Green
    'rgba(34, 197, 94, 1)',    // Green (Excellent)
    'rgba(132, 204, 22, 1)',   // Lime
    'rgba(234, 179, 8, 1)',    // Yellow
    'rgba(249, 115, 22, 1)',   // Orange
    'rgba(239, 68, 68, 1)',    // Red (Poor)
    'rgba(185, 28, 28, 1)'     // Dark Red (Critical)
  ]
};

// Generate mock data for the heatmap
let cachedHeatmapData = null;
const getMockHeatmapData = (google) => {
  if (cachedHeatmapData) return cachedHeatmapData;
  const data = [];
  const basePoints = [
    { lat: 12.9698, lng: 77.7499, weight: 1 }, // Whitefield (Moderate)
    { lat: 12.9239, lng: 77.6844, weight: 3 }, // Sarjapur (High TDS - Red)
    { lat: 12.9304, lng: 77.6784, weight: 3 }, // Bellandur (High TDS - Red)
    { lat: 12.9279, lng: 77.6271, weight: 0.2 }, // Koramangala (Good)
    { lat: 12.9784, lng: 77.6408, weight: 0.2 }, // Indiranagar (Good)
    { lat: 12.8452, lng: 77.6602, weight: 0.5 }, // Electronic City (Good)
  ];

  // Add random points around the base points to create clusters
  basePoints.forEach(point => {
    for (let i = 0; i < 50; i++) {
      data.push({
        location: new google.maps.LatLng(
          point.lat + (Math.random() - 0.5) * 0.05,
          point.lng + (Math.random() - 0.5) * 0.05
        ),
        weight: point.weight * (0.5 + Math.random() * 0.5)
      });
    }
  });
  cachedHeatmapData = data;
  return data;
};



const WaterQuality = () => {
  const [selectedWard, setSelectedWard] = useState('Whitefield');
  const [heatmapData, setHeatmapData] = useState([]);
  const { t } = useLanguage();

  const { isLoaded } = useMapLoader();

  useEffect(() => {
    if (isLoaded && window.google && window.google.maps) {
      setHeatmapData(getMockHeatmapData(window.google));
    }
  }, [isLoaded]);
  
  const radarData = mockQualityDataMap[selectedWard];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">{t('quality.title')}</h1>
        </div>
      </div>


      {/* City-Wide Heatmap */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px', position: 'relative' }}>
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', zIndex: 1, position: 'relative' }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>{t('quality.map.title')}</h3>
            <p className="small-text">{t('quality.map.desc')}</p>
          </div>
          <div className="tech-tag">Live Sensor Data</div>
        </div>
        
        <div style={{ height: '400px', backgroundColor: '#e5e3df', position: 'relative', outline: '4px solid var(--google-blue)', outlineOffset: '-4px' }}>
          {!isLoaded ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={32} className="animate-spin" color="var(--google-blue)" />
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={11}
              options={mapOptions}
            >
              {heatmapData.length > 0 && (
                <HeatmapLayerF
                  data={heatmapData}
                  options={heatmapOptions}
                />
              )}
            </GoogleMap>
          )}

          {/* Map Legend (Overlay) */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(0,0,0,0.05)',
            width: '280px',
            zIndex: 2
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>WATER QUALITY INDEX 2026</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
              WQI is a measure of inorganic and organic pollutants in water. High levels of TDS and Phosphorous indicate poor quality.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginBottom: '4px', fontWeight: 600 }}>
              <span style={{ color: 'rgba(34, 197, 94, 1)' }}>Excellent</span>
              <span style={{ color: 'rgba(239, 68, 68, 1)' }}>Poor</span>
            </div>
            <div style={{
              height: '12px',
              width: '100%',
              background: 'linear-gradient(to right, rgba(34, 197, 94, 1), rgba(234, 179, 8, 1), rgba(239, 68, 68, 1), rgba(185, 28, 28, 1))',
              borderRadius: '6px',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
            }}></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Radar Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>{t('quality.analysis')}</h3>
              <p className="small-text">Comparing key parameters against WHO standards</p>
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
              {Object.keys(mockQualityDataMap).map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'center' }}>
            <div style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="var(--border-default)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 14 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Radar name={selectedWard} dataKey="A" stroke="var(--science-blue)" fill="var(--science-blue)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '20px' }}>
              <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                {t('quality.metrics')}
              </h4>
              {radarData.map(item => (
                <div key={item.subject} style={{ 
                  padding: '16px', 
                  background: 'var(--bg-default)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-light)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.subject}</span>
                  <span style={{ fontSize: '15px', color: 'var(--science-blue)', fontWeight: 700 }}>{item.actual}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px', marginTop: '16px' }}>
            <Info size={18} color="var(--science-blue)" />
            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
              {selectedWard === 'Sarjapur' || selectedWard === 'Bellandur' 
                ? 'TDS levels are currently concerning (Above 1000ppm).' 
                : 'All parameters are within acceptable WHO limits.'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WaterQuality;
