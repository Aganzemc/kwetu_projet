import { HelpCircle, FileText, AlertCircle, Mail } from 'lucide-react';

export default function Policy() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-900 dark:text-white" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Policy & Help
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Guidelines and support for using KwetuCode
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-start gap-4">
            <FileText className="w-6 h-6 text-gray-700 dark:text-gray-300 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Terms of Service
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                By using KwetuCode, you agree to the following terms:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>You must be at least 13 years old to use this service</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You may not use the service for illegal activities</li>
                <li>You may not harass, abuse, or harm other users</li>
                <li>We reserve the right to terminate accounts that violate our terms</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-gray-700 dark:text-gray-300 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Acceptable Use Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                KwetuCode is designed for professional and personal communication. Prohibited activities include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>Sharing illegal content or engaging in illegal activities</li>
                <li>Distributing malware, viruses, or harmful software</li>
                <li>Spamming or sending unsolicited messages</li>
                <li>Impersonating others or creating fake accounts</li>
                <li>Violating intellectual property rights</li>
                <li>Harassment, bullying, or threatening behavior</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-start gap-4">
            <HelpCircle className="w-6 h-6 text-gray-700 dark:text-gray-300 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    How do I create a group?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click the "+" button next to the Groups section in your chat sidebar to create a new group
                    and invite members.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    Can I make video calls?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Yes! Click the video icon in any chat to start a video call with an individual or group.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    How do I share files?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click the paperclip icon in the message input area to select and share files of any format.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    Is my data secure?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Yes! We use end-to-end encryption for all messages and implement industry-standard security
                    practices. See our Privacy & Confidentiality page for details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6 text-gray-700 dark:text-gray-300 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Need More Help?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                If you need additional support or have questions not covered here, please reach out to us:
              </p>
              <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                <p>
                  <strong className="text-gray-900 dark:text-white">Email:</strong>{' '}
                  <a href="mailto:support@kwetucode.com" className="text-black dark:text-white underline">
                    support@kwetucode.com
                  </a>
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-white">Response Time:</strong> Within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Last updated: October 6, 2025
        </p>
      </div>
    </div>
  );
}
