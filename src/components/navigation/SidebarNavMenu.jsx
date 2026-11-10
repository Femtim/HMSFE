import React from 'react';
import { NavLink } from 'react-router-dom';
import { PATIENT_NAV_ITEMS, STAFF_NAV_ITEMS } from './navConfig';

export default function SidebarNavMenu({
  role,
  selectedNavSection,
  setSelectedNavSection,
  onOpenInfoModal,
  onCloseMobileSidebar,
}) {
  const isPatient = role === 'PATIENT';
  const staffItems = STAFF_NAV_ITEMS[role] || [];

  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-2.5 mb-1.5">
        Navigation
      </p>

      {isPatient
        ? PATIENT_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => {
                if (onCloseMobileSidebar) onCloseMobileSidebar();
              }}
              className={({ isActive }) =>
                `block w-full text-left px-3 py-2 rounded text-xs font-medium transition ${
                  isActive
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))
        : staffItems.map((item) => {
            const isSelected = selectedNavSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedNavSection(item.id);
                  if (item.id !== 'dashboard') {
                    onOpenInfoModal();
                  }
                  if (onCloseMobileSidebar) onCloseMobileSidebar();
                }}
                className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition ${
                  isSelected
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
    </div>
  );
}