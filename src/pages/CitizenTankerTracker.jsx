import React, { useState, useEffect } from 'react';
import { Truck, Map, Clock, CheckCircle, Navigation, Users, Loader2, Search } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useMapLoader } from '../context/MapContext';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 12.9716, lng: 77.5946 }; // Bengaluru

const truckIcon = { url: 'https://maps.google.com/mapfiles/ms/icons/truck.png' };
const blueDotIcon = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
const redDotIcon = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';

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
    // Deterministic fallback
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



const CitizenTankerTracker = () => {
  const location = useLocation();
  const [tankers, setTankers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(location.state?.trackingId || '');
  const [trackedRequest, setTrackedRequest] = useState(null);
  const [showAllFleet, setShowAllFleet] = useState(false);
  const { t } = useLanguage();

  const { isLoaded } = useMapLoader();

  useEffect(() => {
    // Real-time listener for Tankers
    const unsubscribeTankers = onSnapshot(collection(db, 'tankers'), (snapshot) => {
      const tankersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTankers(tankersData);
    });

    // Real-time listener for Requests
    const unsubscribeRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(requestsData);
      setLoading(false);
    });

    return () => {
      unsubscribeTankers();
      unsubscribeRequests();
    };
  }, []);

  useEffect(() => {
    if (searchQuery && requests.length > 0) {
      const found = requests.find(r => r.trackingId === searchQuery.trim().toUpperCase());
      setTrackedRequest(found || null);
    } else {
      setTrackedRequest(null);
    }
  }, [searchQuery, requests]);

  const mapCenter = React.useMemo(() => {
    return trackedRequest ? getCoords(trackedRequest.area) : center;
  }, [trackedRequest]);

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
        center={mapCenter}
        zoom={trackedRequest ? 14 : 11}
        options={mapOptions}
      >
        {requests.map((req) => (
          <Marker 
            key={req.id} 
            position={getCoords(req.area)} 
            title={req.trackingId || req.area}
            icon={trackedRequest?.id === req.id ? blueDotIcon : redDotIcon}
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
  }, [isLoaded, trackedRequest, requests, tankers, mapCenter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">{t('tracker.title')}</h1>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder={t('tracker.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '100px', border: '1px solid var(--border-light)', fontSize: '14px', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          />
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
          
          {trackedRequest && (
            <div className="card" style={{ background: 'var(--google-blue-bg)', border: '1px solid var(--google-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: 'var(--google-blue)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={18} /> Request: {trackedRequest.trackingId}
                </h3>
                <div className={`badge ${trackedRequest.status === 'Pending' ? 'warning' : 'safe'}`}>
                  {trackedRequest.status}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div><strong>Area:</strong> {trackedRequest.area}</div>
                <div><strong>Volume:</strong> {trackedRequest.volume} L</div>
                <div><strong>Urgency:</strong> {trackedRequest.urgency}</div>
                <div><strong>Details:</strong> {trackedRequest.addressDetails || 'N/A'}</div>
              </div>
            </div>
          )}

           {/* Map Area */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', height: '400px', position: 'relative', outline: '4px solid var(--google-blue)', outlineOffset: '-4px' }}>
             {mapElement}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CitizenTankerTracker;
