'use client'

import { motion } from 'framer-motion';




export default function TermsPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                1. Agreement to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                By accessing or using RateMyEmployer, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                2. Use License
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Permission is granted to temporarily access the materials (information or software) on RateMyEmployer's website for personal, non-commercial viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                <li className="mb-2">Modify or copy the materials</li>
                <li className="mb-2">Use the materials for any commercial purpose</li>
                <li className="mb-2">Attempt to decompile or reverse engineer any software contained on the website</li>
                <li className="mb-2">Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                3. User Content
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Users may post reviews, comments, and other content as long as the content is not illegal, obscene, threatening, defamatory, invasive of privacy, infringing of intellectual property rights, or otherwise injurious to third parties.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                RateMyEmployer reserves the right to remove or modify user content that violates these terms or that could harm the platform or its users.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                4. Review Guidelines
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                When posting reviews, users must:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 mb-4">
                <li className="mb-2">Provide truthful and accurate information</li>
                <li className="mb-2">Base reviews on personal experience</li>
                <li className="mb-2">Avoid disclosing confidential company information</li>
                <li className="mb-2">Respect others' privacy and rights</li>
                <li>Follow professional conduct standards</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                5. Disclaimer
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The materials on RateMyEmployer's website are provided on an 'as is' basis. RateMyEmployer makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                6. Limitations
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                In no event shall RateMyEmployer or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the website.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                7. Governing Law
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of [Your Jurisdiction] and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                8. Contact Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <ul className="list-none text-gray-600 dark:text-gray-300">
                <li>Email: legal@ratemyemployer.com</li>
                <li>Address: [Your Address]</li>
              </ul>
            </section>

            <p>
              We&apos;re committed to maintaining a fair and balanced platform.
            </p>
            <p>
              By using &quot;RateMyEmployer&quot;, you agree to these terms.
            </p>
            <p>
              We don&apos;t tolerate harassment or discrimination.
            </p>
            <p>
              It&apos;s important to maintain professionalism.
            </p>
            <p>
              Don&apos;t share confidential information.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}