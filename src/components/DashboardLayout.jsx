import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SettingsModal from './SettingsModal';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tvDepartment, setTvDepartment] = useState(
    user?.doctorProfile?.department || 'GENERAL_OPD'
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        tvDepartment={tvDepartment}
        setTvDepartment={setTvDepartment}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex-1 flex relative">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          tvDepartment={tvDepartment}
          setTvDepartment={setTvDepartment}
          onOpenSettingsModal={() => setSettingsOpen(true)}
        />

        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}