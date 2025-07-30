
import React, { ReactNode } from 'react';
import { NavLink, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, Users, Library, FileText, LogOut, GraduationCap } from './icons';
import toast from 'react-hot-toast';

const AdminLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/classes', icon: Library, label: 'Classes' },
    { to: '/admin/exams', icon: FileText, label: 'Exams & Marks' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-md">
        <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
          <GraduationCap className="text-primary-500" size={28} />
          <h1 className="text-xl font-bold ml-2">Admin Panel</h1>
        </div>
        <nav className="flex-1 px-4 py-4">
          <ul>
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span className="ml-4">{item.label}</span>
                </NavLink>
              </li>
            ))}
            <li>
                <NavLink
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                <span className="ml-4">Public Portal</span>
                </NavLink>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t dark:border-gray-700">
            <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400"
            >
                <LogOut size={20} />
                <span className="ml-4">Logout</span>
            </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
