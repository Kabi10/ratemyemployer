'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'John Doe',
      role: 'Founder & CEO',
      description: 'Passionate about creating transparency in the workplace.',
    },
    {
      name: 'Jane Smith',
      role: 'Head of Community',
      description: 'Dedicated to building meaningful connections between employees.',
    },
    // Add more team members as needed
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About RateMyEmployer
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Empowering employees to make informed career decisions through transparent workplace reviews.
            </p>
          </section>

          {/* Mission Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                At RateMyEmployer, we believe in the power of transparency to create better workplaces. Our platform provides a space for employees to share their experiences, helping others make informed decisions about their careers while encouraging employers to build better work environments.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                We're committed to maintaining a fair and balanced platform where both employees and employers can engage in meaningful dialogue about workplace conditions, culture, and practices.
              </p>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Transparency</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We believe honest feedback leads to positive change in the workplace.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Integrity</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We maintain high standards for review quality and authenticity.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Privacy</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We protect our users' identities while enabling honest discourse.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Community</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We foster a supportive environment for workplace dialogue.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-4">
                      <span className="text-xl font-bold text-white">
                        {getInitials(member.name)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                Have questions or suggestions? We'd love to hear from you!
              </p>
              <ul className="text-gray-600 dark:text-gray-300">
                <li className="mb-2">Email: contact@ratemyemployer.com</li>
                <li className="mb-2">Address: [Your Address]</li>
                <li>Follow us on social media for updates and news</li>
              </ul>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
} 