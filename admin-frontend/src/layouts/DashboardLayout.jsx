import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiDollarSign, 
  FiZap, 
  FiMonitor, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiUser
} from 'react-icons/fi';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Users', path: '/users', icon: <FiUsers className="w-5 h-5" /> },
    { name: 'Wallet Fundings', path: '/fundings', icon: <FiDollarSign className="w-5 h-5" /> },
    { name: 'Bill Payments', path: '/bills', icon: <FiZap className="w-5 h-5" /> },
    { name: 'Transactions', path: '/transactions', icon: <FiMonitor className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary-600">Bills Admin</span>
          </div>
          <button 
            className="p-1 rounded-md lg:hidden hover:bg-gray-100"
            onClick={closeSidebar}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="p-4">
          {/* User info */}
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <FiUser className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                onClick={closeSidebar}
                end={item.path === '/'}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <span className="mr-3">
                <FiLogOut className="w-5 h-5" />
              </span>
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button 
            className="p-1 rounded-md lg:hidden hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <div className="ml-auto flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Admin Panel</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
