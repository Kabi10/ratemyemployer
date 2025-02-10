'use client';

import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Privacy Policy
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We collect information that you provide directly to us,
                including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                <li className="mb-2">
                  Account information (name, email, password)
                </li>
                <li className="mb-2">Profile information</li>
                <li className="mb-2">Review content and ratings</li>
                <li className="mb-2">Communications with us</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                <li className="mb-2">Provide and maintain our services</li>
                <li className="mb-2">Process and display reviews</li>
                <li className="mb-2">
                  Communicate with you about our services
                </li>
                <li className="mb-2">Improve and optimize our platform</li>
                <li>Protect against fraud and abuse</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                3. Information Sharing
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We do not sell your personal information. We may share your
                information with:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                <li className="mb-2">
                  Service providers who assist in our operations
                </li>
                <li className="mb-2">Law enforcement when required by law</li>
                <li className="mb-2">
                  Other users (only your public profile and reviews)
                </li>
                <li>Third parties with your consent</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                4. Data Security
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We implement appropriate technical and organizational measures
                to protect your personal information. However, no security
                system is impenetrable and we cannot guarantee the security of
                our systems 100%.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                5. Your Rights
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                <li className="mb-2">Access your personal information</li>
                <li className="mb-2">Correct inaccurate information</li>
                <li className="mb-2">Request deletion of your information</li>
                <li className="mb-2">
                  Object to processing of your information
                </li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                6. Cookies and Tracking
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We use cookies and similar tracking technologies to collect
                information about your browsing activities. You can control
                cookies through your browser settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                7. Children's Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our services are not directed to children under 13. We do not
                knowingly collect personal information from children under 13.
                If you become aware that a child has provided us with personal
                information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                8. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <ul className="list-none text-gray-600 dark:text-gray-300">
                <li>Email: privacy@ratemyemployer.com</li>
                <li>Address: [Your Address]</li>
              </ul>
            </section>

            <p>We&apos;re committed to protecting your privacy.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
