import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trust & Safety - RateMyEmployer',
  description: 'Community guidelines, moderation policies, and safety measures for transparent employer reviews.',
};

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Trust & Safety</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                RateMyEmployer exists to expose unethical hiring practices and empower job seekers with transparency. 
                We maintain strict community guidelines to ensure authentic, evidence-based reviews that help others 
                make informed career decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Community Guidelines</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Evidence-Based Reviews</h3>
                  <p className="text-gray-700">
                    All reviews should be based on actual experiences. We encourage users to provide supporting 
                    evidence such as redacted screenshots of job postings, email communications, or interview 
                    correspondence to verify claims about hiring practices.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Prohibited Content</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Personal attacks or harassment of individuals</li>
                    <li>False or misleading information about companies</li>
                    <li>Reviews written by company employees about their own employer</li>
                    <li>Spam, promotional content, or irrelevant information</li>
                    <li>Disclosure of confidential or proprietary information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Transparency Standards</h3>
                  <p className="text-gray-700">
                    We focus on hiring process transparency, including response times, salary disclosure, 
                    interview process clarity, and communication quality. Reviews should address specific 
                    hiring practices rather than general workplace conditions.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Moderation Process</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Review Verification</h3>
                  <p className="text-gray-700">
                    Our community moderators review all submissions for authenticity and compliance with guidelines. 
                    Reviews with supporting evidence receive higher credibility scores and are prioritized in our 
                    transparency rankings.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Response Times</h3>
                  <p className="text-gray-700">
                    We aim to review all submissions within 24 hours. Complex cases requiring additional 
                    verification may take up to 72 hours. Users are notified of moderation decisions via email.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">For Job Seekers</h3>
                  <p className="text-gray-700">
                    If your review is rejected or removed, you can appeal the decision by contacting our 
                    moderation team with additional evidence or clarification. We provide clear explanations 
                    for all moderation actions.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">For Companies</h3>
                  <p className="text-gray-700">
                    Companies can dispute reviews by providing evidence that contradicts claims made in the review. 
                    We investigate all disputes thoroughly and may request additional verification from the original 
                    reviewer. Legitimate disputes result in review updates or removal.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Legal Compliance</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">DMCA Takedown Process</h3>
                  <p className="text-gray-700">
                    We respond to valid DMCA takedown requests within 24 hours. Copyright holders can submit 
                    requests to <a href="mailto:legal@ratemyemployer.life" className="text-blue-600 hover:underline">legal@ratemyemployer.life</a> 
                    with proper documentation.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Data Protection</h3>
                  <p className="text-gray-700">
                    We protect user privacy through anonymous review options and secure data handling. 
                    Personal information is never shared with employers or third parties without explicit consent.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reporting Issues</h2>
              <p className="text-gray-700 mb-4">
                Help us maintain community standards by reporting problematic content or behavior:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href="mailto:moderation@ratemyemployer.life" className="text-blue-600 hover:underline">moderation@ratemyemployer.life</a><br />
                  <strong>Response Time:</strong> Within 24 hours<br />
                  <strong>What to Include:</strong> Link to content, reason for report, supporting evidence
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}