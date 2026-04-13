import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main
        className="app-shell transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '17rem' : '4.5rem' }}
      >
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
