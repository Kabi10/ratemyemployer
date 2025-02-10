'use client';

import { motion } from 'framer-motion';

interface AssessmentCategory {
  category: string;
  factors: string[];
}

const assessmentData: AssessmentCategory[] = [
  {
    category: 'Skills and Competencies',
    factors: [
      'Support for training and development',
      "Leadership's communication and adaptability",
      'Up-to-date tools and systems',
      'Emphasis on learning opportunities',
    ],
  },
  {
    category: 'Experience and Qualifications',
    factors: [
      'Industry expertise and track record',
      'Qualified management',
      'Celebration of milestones and contributions',
    ],
  },
  {
    category: 'Work Ethic and Reliability',
    factors: [
      'Meeting commitments to employees (e.g., pay, benefits)',
      'Accountability for decisions',
      'Respectful and professional practices',
    ],
  },
  {
    category: 'Cultural Fit',
    factors: [
      'Alignment with personal values',
      'Encouragement of collaboration',
      'Commitment to diversity and inclusion',
    ],
  },
  {
    category: 'Motivation and Passion',
    factors: [
      "Employer's passion for their mission",
      'Engagement with employees',
      'Empowerment to take initiative',
    ],
  },
  {
    category: 'Problem-Solving Abilities',
    factors: [
      'Effective crisis management',
      'Fostering innovation',
      'Transparent decision-making',
    ],
  },
  {
    category: 'Communication Skills',
    factors: [
      'Clarity in expectations and feedback',
      "Leadership's active listening",
      'Trust-building relationships',
    ],
  },
  {
    category: 'Adaptability',
    factors: [
      'Flexibility to industry and employee needs',
      'Opportunities for growth',
      'Value for diverse perspectives',
    ],
  },
  {
    category: 'Leadership Potential',
    factors: [
      'Inspirational and supportive leadership',
      'Clear long-term vision',
      'Fair conflict management',
    ],
  },
  {
    category: 'Results-Driven Mindset',
    factors: [
      'Clear and achievable goals',
      'Acknowledgment and rewards for achievements',
      'Efficient resource utilization',
    ],
  },
  {
    category: 'Reputation',
    factors: [
      'Positive feedback from employees',
      'Good public image',
      'Satisfied clients/customers',
    ],
  },
  {
    category: 'Transparency',
    factors: [
      'Clear and consistent policies',
      'Honest communication about challenges and changes',
    ],
  },
  {
    category: 'Professional Growth Opportunities',
    factors: [
      'Sponsorship of certifications and training',
      'Defined career advancement pathways',
    ],
  },
  {
    category: 'Work-Life Balance',
    factors: [
      'Flexible work hours and policies',
      'Support for mental health and well-being',
    ],
  },
  {
    category: 'Compensation and Benefits',
    factors: [
      'Fair and competitive salary',
      'Comprehensive benefits package (e.g., health, retirement, perks)',
    ],
  },
  {
    category: 'Trial Periods or Onboarding',
    factors: [
      'Strong onboarding support',
      'Fair and constructive probationary reviews',
    ],
  },
  {
    category: 'Other Considerations',
    factors: [
      'Welcoming workplace culture',
      'Flexibility for relocation',
      'Understanding of career transitions',
    ],
  },
];

export function AssessmentList() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {assessmentData.map((item, index) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            className="backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <h3 className="text-xl font-semibold text-blue-200 mb-4">
              {item.category}
            </h3>
            <ul className="space-y-2">
              {item.factors.map((factor, factorIndex) => (
                <motion.li
                  key={factorIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.1 * factorIndex + 0.1 * index,
                    duration: 0.3,
                  }}
                  className="text-gray-300 flex items-start"
                >
                  <span className="text-blue-300 mr-2">•</span>
                  {factor}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
