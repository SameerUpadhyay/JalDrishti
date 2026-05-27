import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, Truck, MessageSquare, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

// Mock Data for the chart (Historical data remains mock)
const chartData = {
  hourly: [
    { time: '00:00', supply: 220, demand: 240 },
    { time: '04:00', supply: 130, demand: 139 },
    { time: '08:00', supply: 800, demand: 980 },
    { time: '12:00', supply: 900, demand: 1100 },
    { time: '16:00', supply: 850, demand: 890 },
    { time: '20:00', supply: 600, demand: 750 },
    { time: '23:59', supply: 280, demand: 300 },
  ],
  daily: [
    { time: 'Mon', supply: 1950, demand: 2550 },
    { time: 'Tue', supply: 2020, demand: 2610 },
    { time: 'Wed', supply: 1980, demand: 2580 },
    { time: 'Thu', supply: 2050, demand: 2650 },
    { time: 'Fri', supply: 2000, demand: 2600 },
    { time: 'Sat', supply: 1920, demand: 2500 },
    { time: 'Sun', supply: 1990, demand: 2590 },
  ],
  weekly: [
    { time: 'Week 1', supply: 25000, demand: 28000 },
    { time: 'Week 2', supply: 26000, demand: 29500 },
    { time: 'Week 3', supply: 27500, demand: 31000 },
    { time: 'Week 4', supply: 28000, demand: 33000 },
  ]
};

const KpiCard = ({ title, value, icon, color, bgColor, onClick }) => (
  <div 
    className="card" 
    onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
  >
    <div style={{ backgroundColor: bgColor, color: color, padding: '16px', borderRadius: '12px' }}>
      {icon}
    </div>
    <div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{title}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [timeGrain, setTimeGrain] = useState('hourly');
  const [anomalies, setAnomalies] = useState([]);
  const [tankersCount, setTankersCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anomaliesRes, tankersRes, requestsRes] = await Promise.all([
          fetch('http://localhost:3002/api/anomalies'),
          fetch('http://localhost:3002/api/tankers'),
          fetch('http://localhost:3002/api/requests')
        ]);
        if (!anomaliesRes.ok || !tankersRes.ok || !requestsRes.ok) {
          throw new Error('Network response was not ok');
        }
        
        const anomaliesData = await anomaliesRes.json();
        const tankersData = await tankersRes.json();
        const requestsData = await requestsRes.json();
        
        setAnomalies(anomaliesData);
        setTankersCount(tankersData.length);
        setRequestsCount(requestsData.length);
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

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">{t('dashboard.title')}</h1>
      </div>

      <div className="kpi-grid">
        <KpiCard 
          title="Priority Wards" 
          value="12" 
          icon={<Activity size={24} />} 
          color="var(--google-blue)" 
          bgColor="var(--google-blue-bg)" 
          onClick={() => navigate('/admin/forecasting')}
        />
        <KpiCard 
          title={t('stat.active.leaks')} 
          value={loading ? "-" : anomalies.length} 
          icon={<AlertCircle size={24} />} 
          color="#C5221F" 
          bgColor="#FCE8E6" 
          onClick={() => navigate('/admin/leaks')}
        />
        <KpiCard 
          title="Active Tankers" 
          value={loading ? "-" : tankersCount} 
          icon={<Truck size={24} />} 
          color="#B06000" 
          bgColor="#FEF7E0" 
          onClick={() => navigate('/admin/tankers')}
        />
        <KpiCard 
          title="Citizen Complaints" 
          value={loading ? "-" : requestsCount} 
          icon={<MessageSquare size={24} />} 
          color="#137333" 
          bgColor="#E6F4EA" 
          onClick={() => {}}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Main Chart Area */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>{t('chart.supply.demand')}</h3>
              <select 
                value={timeGrain} 
                onChange={(e) => setTimeGrain(e.target.value)}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '100px', 
                  border: '1px solid var(--border-default)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-surface)',
                  cursor: 'pointer'
                }}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--google-blue)' }}></div>
                Supply (MLD)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EA4335' }}></div>
                Demand (MLD)
              </span>
            </div>
          </div>
          
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData[timeGrain]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--google-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--google-blue)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA4335" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EA4335" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                />
                <Area type="monotone" dataKey="supply" stroke="var(--google-blue)" fillOpacity={1} fill="url(#colorSupply)" strokeWidth={3} />
                <Area type="monotone" dataKey="demand" stroke="#EA4335" fillOpacity={1} fill="url(#colorDemand)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Alerts List */}
        <div className="card">
          <h3 className="card-title">Live AI Alerts</h3>
          <p className="small-text" style={{ marginBottom: '16px' }}>Real-time anomalies detected by sensors and citizens.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
               <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}><Loader2 size={24} className="animate-spin" color="var(--google-blue)" /></div>
            ) : anomalies.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No active alerts.</div>
            ) : (
              anomalies.slice(0, 5).map((alert, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>{alert.location || 'Unknown Location'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{alert.type || 'Anomaly'}</div>
                  </div>
                  <div className={`badge`} style={{ background: `rgba(${alert.severityColor}, 0.1)`, color: `rgb(${alert.severityColor})` }}>
                    {alert.severity}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
