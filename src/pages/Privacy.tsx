import { Shield, Lock, Eye, Database } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 mx-auto mb-4 text-gray-900 dark:text-white" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Privacy & Confidentiality
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your privacy and security are our top priorities
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-gray-700 dark:text-gray-300 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                End-to-End Encryption
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                All messages, calls, and shared files are encrypted end-to-end. Only you and the recipients
                can read or access the content. We cannot access your conversations.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-start gap-4">
            <Database className="w-6 h-6 text-gray-700 dark:text-gray-300 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Data Storage
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is stored securely on our servers with industry-standard encryption. We implement
                strict access controls and regular security audits to protect your information.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-start gap-4">
            <Eye className="w-6 h-6 text-gray-700 dark:text-gray-300 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Information We Collect
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Account information (email, name, profile details)</li>
                <li>Messages and files you send through the platform</li>
                <li>Usage data and analytics to improve our services</li>
                <li>Device information and IP addresses for security purposes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Rights
          </h2>
          <div className="space-y-3 text-gray-600 dark:text-gray-400">
            <p>
              <strong className="text-gray-900 dark:text-white">Access:</strong> You can access and review
              your personal data at any time through your profile settings.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Deletion:</strong> You have the right to
              request deletion of your account and all associated data.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Portability:</strong> You can export your
              data in a machine-readable format upon request.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Correction:</strong> You can update and
              correct your personal information at any time.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Contact Us
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            If you have any questions or concerns about your privacy, please contact us at{' '}
            <a href="mailto:privacy@kwetucode.com" className="text-black dark:text-white underline">
              privacy@kwetucode.com
            </a>
          </p>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Last updated: October 6, 2025
        </p>
      </div>
    </div>
  );
}
