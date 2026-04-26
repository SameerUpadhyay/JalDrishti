import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { MapProvider } from './context/MapContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CitizenLayout from './layouts/CitizenLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CitizenChatbot from './pages/CitizenChatbot';
import DemandForecast from './pages/DemandForecast';
import LeakDetection from './pages/LeakDetection';
import WaterQuality from './pages/WaterQuality';
import TankerDispatch from './pages/TankerDispatch';
import CitizenTankerTracker from './pages/CitizenTankerTracker';
import CitizenRequestTanker from './pages/CitizenRequestTanker';
import CitizenComplaintTracker from './pages/CitizenComplaintTracker';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { currentUser, role } = useAuth();
  
  if (roleRequired === 'admin' && !currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (roleRequired === 'citizen' && role !== 'citizen') {
     // If they somehow got here without choosing citizen, redirect to landing
     return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roleRequired="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="forecasting" element={<DemandForecast />} />
        <Route path="leaks" element={<LeakDetection />} />
        <Route path="tankers" element={<TankerDispatch />} />
        <Route path="quality" element={<WaterQuality />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Citizen Routes */}
      <Route path="/citizen" element={
        <ProtectedRoute roleRequired="citizen">
          <CitizenLayout />
        </ProtectedRoute>
      }>
        <Route path="chatbot" element={<CitizenChatbot />} />
        <Route path="quality" element={<WaterQuality />} />
        <Route path="request-tanker" element={<CitizenRequestTanker />} />
        <Route path="tankers" element={<CitizenTankerTracker />} />
        <Route path="complaints" element={<CitizenComplaintTracker />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MapProvider>
          <Router>
            <AppRoutes />
          </Router>
        </MapProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
