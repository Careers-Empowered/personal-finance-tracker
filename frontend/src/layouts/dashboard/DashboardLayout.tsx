import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../shared/ui/Sidebar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;