import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Beaker, 
  LayoutDashboard, 
  FlaskConical, 
  MessageSquare, 
  Award, 
  Trophy, 
  Video, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun,
  GraduationCap,
  Microscope
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isTeacher } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const studentLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/experiments', icon: FlaskConical, label: 'Experiments' },
    { path: '/chemistry-lab', icon: Beaker, label: 'Virtual Chemistry Lab' },
    { path: '/results', icon: Microscope, label: 'My Results' },
    { path: '/ai-chat', icon: MessageSquare, label: 'AI Assistant' },
    { path: '/videos', icon: Video, label: 'Video Tutorials' },
    { path: '/badges', icon: Award, label: 'Badges' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];

  const teacherLinks = [
    { path: '/teacher-dashboard', icon: GraduationCap, label: 'Teacher Dashboard' },
    ...studentLinks
  ];

  const links = isTeacher ? teacherLinks : studentLinks;

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-2">
          <Beaker className="text-primary-600" size={28} />
          <span className="font-bold text-xl text-gradient">SmartLab</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:transform-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <Beaker className="text-primary-600" size={32} />
            <span className="font-bold text-2xl text-gradient">SmartLab</span>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-140px)] lg:h-[calc(100vh-80px)]">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={isActive(link.path) ? 'nav-link-active' : 'nav-link'}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Top Bar */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role} • {user?.progress || 0}% Complete
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <User size={18} className="text-primary-600 dark:text-primary-400" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
