import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MessageSquare, User, Users as UsersIcon, Settings, LogOut, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) {
    return <>{children}</>;
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6 transition-colors">
        <Link to="/chat" className="mb-8">
          <img
            src="/ChatGPT Image 6 oct. 2025, 13_10_05.png"
            alt="KwetuCode"
            className="w-12 h-12"
          />
        </Link>

        <div className="flex-1 flex flex-col gap-4">
          <Link
            to="/chat"
            className={`p-3 rounded-xl transition-colors ${
              isActive('/chat')
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Chat"
          >
            <MessageSquare className="w-6 h-6" />
          </Link>

          <Link
            to="/users"
            className={`p-3 rounded-xl transition-colors ${
              isActive('/users')
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Users"
          >
            <UsersIcon className="w-6 h-6" />
          </Link>

          <Link
            to="/profile"
            className={`p-3 rounded-xl transition-colors ${
              isActive('/profile')
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Profile"
          >
            <User className="w-6 h-6" />
          </Link>

          <Link
            to="/settings"
            className={`p-3 rounded-xl transition-colors ${
              isActive('/settings')
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </Link>

          {profile?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`p-3 rounded-xl transition-colors ${
                isActive('/admin')
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Admin"
            >
              <span className="block w-6 h-6 text-center font-bold">A</span>
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>

          <button
            onClick={handleLogout}
            className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
