import React from 'react';
import { Outlet } from 'react-router-dom';
import CitizenSidebar from '../components/CitizenSidebar';
import WhatsAppWidget from '../components/WhatsAppWidget';

const CitizenLayout = () => {
  return (
    <div className="app-container">
      <CitizenSidebar />
      <main className="main-content" style={{ position: 'relative' }}>
        <Outlet />
      </main>
      <WhatsAppWidget />
    </div>
  );
};

export default CitizenLayout;
