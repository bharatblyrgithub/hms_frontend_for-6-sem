import React from 'react';
import { NavLink } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient'] },
    { name: 'Patients', href: '/patients', icon: UserGroupIcon, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
    { name: 'Doctors', href: '/doctors', icon: UserIcon, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient'] },
    { name: 'Appointments', href: '/appointments', icon: CalendarIcon, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient'] },
    { name: 'Billing', href: '/billing', icon: CurrencyDollarIcon, roles: ['Admin', 'Receptionist'] },
    { name: 'Inventory', href: '/inventory', icon: CubeIcon, roles: ['Admin', 'Nurse', 'Doctor'] },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['Admin'] },
    { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['Admin'] },
  ];

  const filteredNavigation = navigation.filter(item => hasRole(item.roles));

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-2xl font-bold text-primary-600">HMS</h1>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-6 w-6"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="ml-auto flex-shrink-0 p-1 text-gray-400 hover:text-gray-500"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;