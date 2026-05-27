import React, { useState } from 'react';
import { Database } from 'lucide-react';

const mockTankers = [
  { id: 'TK-402', ward: 'Whitefield Sector 4', status: 'En Route', eta: '14 mins', type: 'BWSSB' },
  { id: 'TK-891', ward: 'Sarjapur Main', status: 'En Route', eta: '25 mins', type: 'Private' },
  { id: 'TK-221', ward: 'Bellandur', status: 'Delivering', eta: null, type: 'BWSSB' },
  { id: 'TK-554', ward: 'HSR Layout', status: 'Available', eta: null, type: 'Private' },
  { id: 'TK-112', ward: 'Koramangala', status: 'En Route', eta: '5 mins', type: 'BWSSB' },
  { id: 'TK-334', ward: 'Indiranagar', status: 'En Route', eta: '12 mins', type: 'Private' },
  { id: 'TK-502', ward: 'Electronic City', status: 'Delivering', eta: null, type: 'BWSSB' },
  { id: 'TK-761', ward: 'JP Nagar', status: 'Available', eta: null, type: 'Private' },
  { id: 'TK-992', ward: 'BTM Layout', status: 'En Route', eta: '18 mins', type: 'BWSSB' },
  { id: 'TK-105', ward: 'Marathahalli', status: 'En Route', eta: '22 mins', type: 'Private' },
  { id: 'TK-218', ward: 'Jayanagar', status: 'Available', eta: null, type: 'BWSSB' },
  { id: 'TK-441', ward: 'Banashankari', status: 'Delivering', eta: null, type: 'Private' },
  { id: 'TK-653', ward: 'Malleswaram', status: 'En Route', eta: '8 mins', type: 'BWSSB' },
  { id: 'TK-812', ward: 'Hebbal', status: 'En Route', eta: '30 mins', type: 'Private' },
  { id: 'TK-094', ward: 'Yelahanka', status: 'Available', eta: null, type: 'BWSSB' },
  { id: 'TK-322', ward: 'Basavanagudi', status: 'Delivering', eta: null, type: 'Private' },
  { id: 'TK-567', ward: 'Whitefield', status: 'En Route', eta: '15 mins', type: 'BWSSB' },
  { id: 'TK-789', ward: 'Koramangala', status: 'Available', eta: null, type: 'Private' },
  { id: 'TK-901', ward: 'HSR Layout', status: 'En Route', eta: '20 mins', type: 'BWSSB' },
  { id: 'TK-145', ward: 'Bellandur', status: 'Delivering', eta: null, type: 'Private' },
];

const mockRequests = [
  { id: 'REQ-092', area: 'Electronic City Phase 1', volume: '6000L', waitTime: '3h 12m', priority: 'high' },
  { id: 'REQ-093', area: 'Whitefield EPIP', volume: '12000L', waitTime: '1h 45m', priority: 'medium' },
  { id: 'REQ-094', area: 'JP Nagar 7th Phase', volume: '6000L', waitTime: '45m', priority: 'low' }
];

const mockAnomalies = [
  { id: 'ALR-8392', icon: '', type: 'Major Pipe Burst', location: 'Whitefield, Sensor S-03-02', time: '12 mins ago', severity: 'Critical', severityColor: '234, 67, 53' },
  { id: 'ALR-8391', icon: '', type: 'Suspected Water Theft', location: 'Sarjapur, Near Main Valve', time: '2 hrs ago', severity: 'High', severityColor: '242, 153, 0' },
  { id: 'ALR-8388', icon: '', type: 'Slow Leak Detected', location: 'Koramangala, Sector 4', time: '5 hrs ago', severity: 'Medium', severityColor: '161, 66, 244' },
  { id: 'ALR-8401', icon: '', type: 'Pressure Drop', location: 'Indiranagar, 100ft Road', time: '20 mins ago', severity: 'High', severityColor: '242, 153, 0' },
  { id: 'ALR-8402', icon: '', type: 'Line Rupture', location: 'Bellandur, ORR Junction', time: '45 mins ago', severity: 'Critical', severityColor: '234, 67, 53' },
  { id: 'ALR-8403', icon: '', type: 'Valve Seepage', location: 'HSR Layout, Sector 2', time: '4 hrs ago', severity: 'Low', severityColor: '66, 133, 244' },
  { id: 'ALR-8404', icon: '', type: 'Flow Rate Anomaly', location: 'Electronic City, Phase 1', time: '1 hr ago', severity: 'High', severityColor: '242, 153, 0' },
  { id: 'ALR-8405', icon: '', type: 'Pressure Drop', location: 'Whitefield, EPIP Zone', time: '30 mins ago', severity: 'High', severityColor: '242, 153, 0' },
  { id: 'ALR-8406', icon: '', type: 'Major Burst', location: 'Sarjapur, Wipro Tech Park', time: '15 mins ago', severity: 'Critical', severityColor: '234, 67, 53' },
  { id: 'ALR-8407', icon: '', type: 'Continuous Leak', location: 'Koramangala, Sony World', time: '6 hrs ago', severity: 'Medium', severityColor: '161, 66, 244' },
  { id: 'ALR-8408', icon: '', type: 'Bypass Suspected', location: 'Indiranagar, CMH Road', time: '3 hrs ago', severity: 'High', severityColor: '242, 153, 0' },
  { id: 'ALR-8409', icon: '', type: 'Supply Interruption', location: 'Bellandur, Lake Road', time: '55 mins ago', severity: 'High', severityColor: '242, 153, 0' },
  { id: 'ALR-8410', icon: '', type: 'Meter Reading Error', location: 'HSR Layout, Sector 7', time: '8 hrs ago', severity: 'Low', severityColor: '66, 133, 244' },
  { id: 'ALR-8411', icon: '', type: 'Construction Damage', location: 'Electronic City, Phase 2', time: '10 mins ago', severity: 'Critical', severityColor: '234, 67, 53' },
  { id: 'ALR-8412', icon: '', type: 'Pump Malfunction', location: 'Whitefield, Kadugodi', time: '1.5 hrs ago', severity: 'High', severityColor: '242, 153, 0' }
];

const SeedDataButton = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setLoading(true);
    setMessage('Seeding database...');
    try {
      const res = await fetch('http://localhost:3002/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tankers: mockTankers,
          requests: mockRequests,
          anomalies: mockAnomalies
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to seed database');
      }

      const data = await res.json();
      setMessage(data.message || 'Database successfully seeded with mock data!');
    } catch (error) {
      console.error("Error seeding database: ", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <h3 className="card-title">Developer Tools</h3>
      <p className="small-text" style={{ marginBottom: '16px' }}>Use this to populate the connected MySQL database with initial mock data.</p>
      
      <button 
        className="button-primary" 
        onClick={handleSeed} 
        disabled={loading}
      >
        <Database size={18} />
        {loading ? 'Seeding...' : 'Seed MySQL Database'}
      </button>

      {message && <div style={{ marginTop: '16px', fontWeight: 500, fontSize: '14px', color: message.includes('Error') ? '#C5221F' : '#137333' }}>{message}</div>}
    </div>
  );
};

export default SeedDataButton;
