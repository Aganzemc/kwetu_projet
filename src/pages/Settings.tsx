import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Bell, Shield, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2 bg-gray-200 dark:bg-gray-700"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Message Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications for new messages
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Call Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications for incoming calls
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-black dark:text-white focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Links</h2>

          <div className="space-y-3">
            <Link
              to="/privacy"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-900 dark:text-white">Privacy & Confidentiality</span>
            </Link>

            <Link
              to="/policy"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-900 dark:text-white">Policy & Help</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
