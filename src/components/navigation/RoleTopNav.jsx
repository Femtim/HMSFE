import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROLE_NAV_MAP, PATIENT_NAV_ITEMS } from './navConfig';

export default function RoleTopNav({ role }) {
  const navItems = ROLE_NAV_MAP[role] || PATIENT_NAV_ITEMS;

  return (
    <nav className="hidden lg:flex items-center gap-1" aria-label="Workspace Navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            `px-3 py-1.5 rounded text-xs font-medium transition ${
              isActive
                ? 'bg-teal-700 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}