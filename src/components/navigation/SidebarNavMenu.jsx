import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROLE_NAV_MAP, PATIENT_NAV_ITEMS } from './navConfig';

export default function SidebarNavMenu({ role, onCloseMobileSidebar }) {
  const navItems = ROLE_NAV_MAP[role] || PATIENT_NAV_ITEMS;

  return (
    <div className="space-y-1">
      <p className="text-[13px] font-semibold uppercase tracking-wider text-slate-500 px-2.5 mb-1.5">
        Navigation
      </p>

      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          onClick={() => {
            if (onCloseMobileSidebar) onCloseMobileSidebar();
          }}
          className={({ isActive }) =>
            `block w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
              isActive
                ? 'bg-teal-700 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}