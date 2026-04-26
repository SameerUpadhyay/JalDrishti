import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Calendar, Bot, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const mockForecastData = {
  'Whitefield': [
    { day: 'Mon', historical: 120, predicted: null },
    { day: 'Tue', historical: 125, predicted: null },
    { day: 'Wed', historical: 122, predicted: null },
    { day: 'Thu', historical: 130, predicted: null },
    { day: 'Fri', historical: 128, predicted: null },
    { day: 'Sat', historical: 135, predicted: 135 },
    { day: 'Sun (Tomorrow)', historical: null, predicted: 140 },
    { day: 'Mon', historical: null, predicted: 142 },
    { day: 'Tue', historical: null, predicted: 138 },
    { day: 'Wed', historical: null, predicted: 135 },
    { day: 'Thu', historical: null, predicted: 145 },
    { day: 'Fri', historical: null, predicted: 150 },
  ],
  'Sarjapur': [
    { day: 'Mon', historical: 85, predicted: null },
    { day: 'Tue', historical: 88, predicted: null },
    { day: 'Wed', historical: 82, predicted: null },
    { day: 'Thu', historical: 91, predicted: null },
    { day: 'Fri', historical: 89, predicted: null },
    { day: 'Sat', historical: 95, predicted: 95 },
    { day: 'Sun (Tomorrow)', historical: null, predicted: 98 },
    { day: 'Mon', historical: null, predicted: 102 },
    { day: 'Tue', historical: null, predicted: 99 },
    { day: 'Wed', historical: null, predicted: 94 },
    { day: 'Thu', historical: null, predicted: 105 },
    { day: 'Fri', historical: null, predicted: 108 },
  ],
  'Koramangala': [
    { day: 'Mon', historical: 110, predicted: null },
    { day: 'Tue', historical: 112, predicted: null },
    { day: 'Wed', historical: 108, predicted: null },
    { day: 'Thu', historical: 115, predicted: null },
    { day: 'Fri', historical: 118, predicted: null },
    { day: 'Sat', historical: 125, predicted: 125 },
    { day: 'Sun (Tomorrow)', historical: null, predicted: 130 },
    { day: 'Mon', historical: null, predicted: 115 },
    { day: 'Tue', historical: null, predicted: 110 },
    { day: 'Wed', historical: null, predicted: 108 },
    { day: 'Thu', historical: null, predicted: 114 },
    { day: 'Fri', historical: null, predicted: 118 },
  ],
  'Indiranagar': [
    { day: 'Mon', historical: 95, predicted: null },
    { day: 'Tue', historical: 98, predicted: null },
    { day: 'Wed', historical: 94, predicted: null },
    { day: 'Thu', historical: 102, predicted: null },
    { day: 'Fri', historical: 100, predicted: null },
    { day: 'Sat', historical: 110, predicted: 110 },
    { day: 'Sun (Tomorrow)', historical: null, predicted: 115 },
    { day: 'Mon', historical: null, predicted: 98 },
    { day: 'Tue', historical: null, predicted: 95 },
    { day: 'Wed', historical: null, predicted: 93 },
    { day: 'Thu', historical: null, predicted: 100 },
    { day: 'Fri', historical: null, predicted: 105 },
  ],
  'Electronic City': [
    { day: 'Mon', historical: 150, predicted: null },
    { day: 'Tue', historical: 155, predicted: null },
    { day: 'Wed', historical: 152, predicted: null },
    { day: 'Thu', historical: 158, predicted: null },
    { day: 'Fri', historical: 160, predicted: null },
    { day: 'Sat', historical: 145, predicted: 145 },
    { day: 'Sun (Tomorrow)', historical: null, predicted: 140 },
    { day: 'Mon', historical: null, predicted: 162 },
    { day: 'Tue', historical: null, predicted: 158 },
    { day: 'Wed', historical: null, predicted: 155 },
    { day: 'Thu', historical: null, predicted: 165 },
    { day: 'Fri', historical: null, predicted: 170 },
  ],
  'HSR Layout': [
    { day: 'Mon', historical: 105, predicted: null },
    { day: 'Tue', historical: 108, predicted: null },
    { day: 'Wed', historical: 102, predicted: null },
    { day: 'Thu', historical: 110, predicted: null },
    { day: 'Fri', historical: 112, predicted: null },
    { day: 'Sat', historical: 120, predicted: 120 },
    { day: 'Sun (Tomorrow)', historical: null, predicted: 125 },
    { day: 'Mon', historical: null, predicted: 110 },
    { day: 'Tue', historical: null, predicted: 105 },
    { day: 'Wed', historical: null, predicted: 102 },
    { day: 'Thu', historical: null, predicted: 112 },
    { day: 'Fri', historical: null, predicted: 115 },
  ],
  'Bellandur': [
    { day: 'Mon', historical: 130, predicted: null },
    { day: 'Tue', historical: 135, predicted: null },
    { day: 'Wed', historical: 132, predicted: null },
    { day: 'Thu', historical: 140, predicted: null },
    { day: 'Fri', historical: 138, predicted: null },
    { day: 'Sat', historical: 145, predicted: 145 },
    { day: 'Sun (Tomorrow)', historical: null, predicted: 150 },
    { day: 'Mon', historical: null, predicted: 142 },
    { day: 'Tue', historical: null, predicted: 138 },
    { day: 'Wed', historical: null, predicted: 135 },
    { day: 'Thu', historical: null, predicted: 145 },
    { day: 'Fri', historical: null, predicted: 148 },
  ]
};

const DemandForecast = () => {
  const [selectedWard, setSelectedWard] = useState('Whitefield');
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationDone, setAllocationDone] = useState(false);
  const { t } = useLanguage();

  const data = mockForecastData[selectedWard];

  // Calculate average predicted demand for the next 7 days dynamically
  const averagePredicted = React.useMemo(() => {
    const predictedValues = data.filter(d => d.predicted !== null).map(d => d.predicted);
    if (predictedValues.length === 0) return 0;
    const sum = predictedValues.reduce((a, b) => a + b, 0);
    return (sum / predictedValues.length).toFixed(1);
  }, [data]);

  const handleWardChange = (e) => {
    setSelectedWard(e.target.value);
    setAllocationDone(false); // Reset allocation status when changing wards
  };

  const handleAllocation = () => {
    setIsAllocating(true);
    // Simulate AI optimization delay
    setTimeout(() => {
      setIsAllocating(false);
      setAllocationDone(true);
    }, 1500);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">{t('forecast.title')}</h1>
        </div>
        <div>
          <select
            value={selectedWard}
            onChange={handleWardChange}
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
            {Object.keys(mockForecastData).map(ward => (
              <option key={ward} value={ward}>{ward}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>

        {/* Main Chart Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="card-title" style={{ margin: 0 }}>{t('forecast.predicted.demand')} - {selectedWard}</h3>
            <div className="tech-tag">
              <Bot size={14} style={{ marginRight: '6px' }} />
              Gemini 1.5 Flash Model
            </div>
          </div>

          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                />
                <Legend iconType="circle" />
                <ReferenceLine x="Sat" stroke="var(--text-muted)" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: 'var(--text-secondary)', fontSize: 12 }} />

                <Line
                  type="monotone"
                  name="Historical Demand"
                  dataKey="historical"
                  stroke="var(--google-blue)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  name="AI Predicted Demand"
                  dataKey="predicted"
                  stroke="#E8710A"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Key Metric Card */}
          <div className="card" style={{ background: 'var(--google-blue-bg)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Calendar size={24} color="var(--google-blue)" />
              <h3 className="card-title" style={{ margin: 0, color: 'var(--google-blue)' }}>{t('forecast.next.7.days')}</h3>
            </div>
            <div className="kpi-value" style={{ color: 'var(--google-blue)', fontSize: '28px' }}>{averagePredicted} MLD</div>
            <p className="kpi-label" style={{ color: 'var(--google-blue)', opacity: 0.8 }}>{t('forecast.avg.predicted')}</p>
          </div>

          {/* Gemini Insights Card */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Bot size={20} color="#A142F4" />
              <h3 className="card-title" style={{ margin: 0 }}>{t('forecast.ai.insights')}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(197, 34, 31, 0.1)', padding: '6px', borderRadius: '50%', color: '#C5221F' }}>
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Demand Surge Expected</h4>
                  <p className="small-text">A 15% increase is predicted for Thursday due to expected high temperatures (36°C).</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(176, 96, 0, 0.1)', padding: '6px', borderRadius: '50%', color: '#B06000' }}>
                  <AlertCircle size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Supply Gap Warning</h4>
                  <p className="small-text">Current supply allocation will fall short by Friday. Tanker dispatch needed.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(19, 115, 51, 0.1)', padding: '6px', borderRadius: '50%', color: '#137333' }}>
                  <TrendingDown size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Weekend Normalization</h4>
                  <p className="small-text">Demand is expected to normalize by next Sunday as commercial consumption drops.</p>
                </div>
              </div>
            </div>

            <button
              className={`button-primary ${allocationDone ? 'success' : ''}`}
              style={{
                width: '100%',
                marginTop: '24px',
                backgroundColor: allocationDone ? 'var(--mint-green)' : (isAllocating ? 'var(--border-default)' : 'var(--pure-black)'),
                color: allocationDone ? '#06ff1fff' : 'var(--pure-white)',
                cursor: (isAllocating || allocationDone) ? 'default' : 'pointer'
              }}
              onClick={handleAllocation}
              disabled={isAllocating || allocationDone}
            >
              {isAllocating ? 'Optimizing AI Allocation...' : (allocationDone ? 'Allocation Updated ' : 'Adjust Supply Allocation')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DemandForecast;
