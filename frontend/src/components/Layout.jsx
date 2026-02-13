import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:block lg:w-64 lg:fixed lg:h-[calc(100vh-4rem)] lg:top-16 lg:overflow-y-auto bg-white border-r border-gray-200">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <aside
              className="fixed left-0 top-16 bottom-0 w-64 bg-white overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-64 pt-16">
          <div className="container-responsive py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
