import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminTopBar from './AdminTopBar';
import AdminMenuBar from './AdminMenuBar';
import './AdminLayout.css';

const AdminLayout = () => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  if (!isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className={`admin-layout ${sidebarExpanded ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside
        className="admin-sidebar-area"
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <AdminMenuBar expanded={sidebarExpanded} />
      </aside>
      <header className="admin-topbar-area">
        <AdminTopBar />
      </header>
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
