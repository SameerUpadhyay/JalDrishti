import React, { useState, useEffect } from 'react';
import { Truck, Map, Clock, CheckCircle, Navigation, Users, Loader2 } from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useLanguage } from '../context/LanguageContext';
import { useMapLoader } from '../context/MapContext';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 12.9716, lng: 77.5946 }; // Bengaluru

const truckIcon = { url: 'https://maps.google.com/mapfiles/ms/icons/truck.png' };

const coordsCache = {};
const getCoords = (locationString) => {
  if (!locationString) return center;
  const loc = locationString.toLowerCase();
  if (coordsCache[loc]) return coordsCache[loc];

  let result;
  if (loc.includes('whitefield')) result = { lat: 12.9698, lng: 77.7499 };
  else if (loc.includes('sarjapur')) result = { lat: 12.9239, lng: 77.6844 };
  else if (loc.includes('koramangala')) result = { lat: 12.9279, lng: 77.6271 };
  else if (loc.includes('indiranagar')) result = { lat: 12.9784, lng: 77.6408 };
  else if (loc.includes('bellandur')) result = { lat: 12.9304, lng: 77.6784 };
  else if (loc.includes('hsr')) result = { lat: 12.9121, lng: 77.6446 };
  else if (loc.includes('electronic city')) result = { lat: 12.8452, lng: 77.6601 };
  else if (loc.includes('jp nagar')) result = { lat: 12.9063, lng: 77.5856 };
  else {
    // Deterministic fallback using string length and char code
    const hash = loc.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    result = { 
      lat: center.lat + ((hash % 100) / 100 - 0.5) * 0.05, 
      lng: center.lng + (((hash * 7) % 100) / 100 - 0.5) * 0.05 
    };
  }

  coordsCache[loc] = result;
  return result;
};

const mapOptions = { mapTypeControl: false, streetViewControl: false };

const DispatchCard = ({ id, ward, status, eta, type }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border-light)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ 
        width: '40px', height: '40px', borderRadius: '50%', 
        background: type === 'Private' ? '#FCE8E6' : '#E8F0FE', 
        color: type === 'Private' ? '#C5221F' : 'var(--google-blue)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Truck size={20} />
      </div>
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>Tanker {id}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{type} Fleet • Dest: {ward}</div>
      </div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div className={`badge ${status === 'En Route' ? 'warning' : 'safe'}`}>{status}</div>
      {eta && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> ETA: {eta}</div>}
    </div>
  </div>
);

const TankerDispatch = () => {
  const [tankers, setTankers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllFleet, setShowAllFleet] = useState(false);
  const [showAllQueue, setShowAllQueue] = useState(false);
  const { t } = useLanguage();

  const { isLoaded } = useMapLoader();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tankersRes, requestsRes] = await Promise.all([
          fetch('http://localhost:3002/api/tankers'),
          fetch('http://localhost:3002/api/requests')
        ]);
        if (!tankersRes.ok || !requestsRes.ok) throw new Error('Network response was not ok');
        
        const tankersData = await tankersRes.json();
        const requestsData = await requestsRes.json();
        
        setTankers(tankersData);
        setRequests(requestsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => {
      clearInterval(interval);
    };
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
        zoom={11}
        options={mapOptions}
      >
        {requests.map((req) => (
          <Marker 
            key={req.id} 
            position={getCoords(req.area)} 
            title={req.area}
          />
        ))}
        {tankers.map((tanker) => (
          <Marker 
            key={tanker.id} 
            position={getCoords(tanker.ward)} 
            title={tanker.id}
            icon={truckIcon}
          />
        ))}
      </GoogleMap>
    );
  }, [isLoaded, requests, tankers]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">{t('dispatch.title')}</h1>
        </div>

      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--google-blue-bg)', padding: '12px', borderRadius: '8px', color: 'var(--google-blue)' }}><Truck size={24} /></div>
          <div><div className="kpi-value">{loading ? '-' : tankers.length}</div><div className="kpi-label">Active Tankers</div></div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#FEF7E0', padding: '12px', borderRadius: '8px', color: '#B06000' }}><Clock size={24} /></div>
          <div><div className="kpi-value">{loading ? '-' : requests.length}</div><div className="kpi-label">Pending Requests</div></div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#E6F4EA', padding: '12px', borderRadius: '8px', color: '#137333' }}><CheckCircle size={24} /></div>
          <div><div className="kpi-value">312</div><div className="kpi-label">Deliveries Today</div></div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#F3E8FD', padding: '12px', borderRadius: '8px', color: '#A142F4' }}><Map size={24} /></div>
          <div><div className="kpi-value">30%</div><div className="kpi-label">Route Optimization Saving</div></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Active Dispatch List */}
        <div className="card" style={{ padding: 0, alignSelf: 'start' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ margin: 0 }}>{t('dispatch.fleet.status')}</h3>
            <span 
              onClick={() => setShowAllFleet(!showAllFleet)} 
              style={{ fontSize: '12px', color: 'var(--google-blue)', fontWeight: 500, cursor: 'pointer' }}
            >
              {showAllFleet ? 'View Less' : 'View All'}
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {loading ? (
              <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}><Loader2 size={24} className="animate-spin" color="var(--google-blue)" /></div>
            ) : tankers.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No active tankers. Run Seed Data in Settings.</div>
            ) : (
              (showAllFleet ? tankers : tankers.slice(0, 3)).map(t => <DispatchCard key={t.id} {...t} />)
            )}
          </div>
        </div>

        {/* Route Map & Pending */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Map Area */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', height: '250px', position: 'relative', outline: '4px solid var(--google-blue)', outlineOffset: '-4px' }}>
             {mapElement}
          </div>

          {/* Pending Requests Queue */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Priority Demand Queue</h3>
              <span 
                onClick={() => setShowAllQueue(!showAllQueue)} 
                style={{ fontSize: '12px', color: 'var(--google-blue)', fontWeight: 500, cursor: 'pointer' }}
              >
                {showAllQueue ? 'View Less' : 'View All'}
              </span>
            </div>
            <table style={{ marginTop: '12px' }}>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Area</th>
                  <th>Volume</th>
                  <th>Wait Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}><Loader2 size={16} className="animate-spin" color="var(--google-blue)" /></td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No pending requests.</td></tr>
                ) : (
                  (showAllQueue ? requests : requests.slice(0, 3)).map(req => (
                    <tr key={req.id}>
                      <td className="mono">{req.id}</td>
                      <td>{req.area}</td>
                      <td>{req.volume}</td>
                      <td><span style={{ 
                        color: req.priority === 'high' ? '#C5221F' : req.priority === 'medium' ? '#B06000' : '#137333', 
                        fontWeight: 500 
                      }}>{req.waitTime}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TankerDispatch;
