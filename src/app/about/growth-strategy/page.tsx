import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Growth Strategy - RateMyEmployer',
  description: 'How we plan to bootstrap authentic reviews and build a credible platform for exposing unethical hiring practices.',
};

export default function GrowthStrategyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Growth Strategy</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">The Bootstrap Challenge</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We acknowledge the chicken-and-egg problem: job seekers need existing reviews to find value, 
                but we need job seekers to create those reviews. Unlike generic review platforms, we're 
                building something different - a movement to expose and change unethical hiring practices.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our strategy focuses on quality over quantity, evidence over opinions, and community building 
                over rapid scaling. We'd rather have 100 verified, evidence-backed reviews than 10,000 
                generic ratings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Phase 1: Community Foundation (Months 1-3)</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Target: 500 Evidence-Based Reviews</h3>
                  <p className="text-gray-700">
                    Focus on recruiting job seekers who have experienced specific unethical practices. 
                    Partner with job search communities on Reddit, Discord, and LinkedIn to find people 
                    willing to share documented experiences.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Specific Tactics:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Partner with r/recruitinghell, r/antiwork communities for authentic stories</li>
                    <li>Reach out to people sharing hiring horror stories on social media</li>
                    <li>Create "Evidence Upload" campaigns for specific practices (ghosting, fake jobs)</li>
                    <li>Offer verification badges for reviews with supporting documentation</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Phase 2: Credibility Building (Months 4-6)</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Target: 2,000 Reviews, 500 Companies</h3>
                  <p className="text-gray-700">
                    Establish credibility through transparency and accountability. Publish our moderation 
                    decisions, dispute resolutions, and platform improvements based on community feedback.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Credibility Measures:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Public moderation log showing all review decisions and reasoning</li>
                    <li>Monthly transparency reports on platform usage and dispute resolutions</li>
                    <li>Open-source codebase allowing community auditing of algorithms</li>
                    <li>Partnership with job seeker advocacy organizations for legitimacy</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Phase 3: Network Effects (Months 7-12)</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Target: 10,000 Reviews, 2,000 Companies</h3>
                  <p className="text-gray-700">
                    Reach critical mass where the platform becomes valuable for job seekers researching 
                    companies. Focus on companies with poor hiring practices to maximize impact.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Growth Accelerators:</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>SEO optimization for "[company name] hiring practices" searches</li>
                    <li>Integration with job search workflows (browser extension, API)</li>
                    <li>Media coverage of exposed unethical practices and platform impact</li>
                    <li>Company response tracking (which companies improve vs. ignore feedback)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Quality Assurance</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Evidence Requirements</h3>
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li>• Screenshots of job postings (with personal info redacted)</li>
                    <li>• Email communication timelines</li>
                    <li>• Interview scheduling and follow-up documentation</li>
                    <li>• Salary discussion transcripts</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Verification Process</h3>
                  <ul className="text-gray-700 text-sm space-y-2">
                    <li>• Email verification for all reviewers</li>
                    <li>• LinkedIn profile cross-referencing when possible</li>
                    <li>• Community voting on review credibility</li>
                    <li>• Moderator review of all evidence submissions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Realistic Projections</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Why We'll Succeed Where Others Struggle</h3>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong>Focused Mission:</strong> We're not trying to be everything to everyone. 
                    We solve one specific problem: unethical hiring practices.
                  </p>
                  <p className="text-gray-700">
                    <strong>Evidence-Based:</strong> Our reviews have credibility because they require 
                    documentation, not just opinions.
                  </p>
                  <p className="text-gray-700">
                    <strong>Community-Driven:</strong> Job seekers are motivated to contribute because 
                    the platform directly helps them avoid bad employers.
                  </p>
                  <p className="text-gray-700">
                    <strong>Open Source:</strong> Transparency builds trust, and trust drives adoption 
                    in a space where credibility is everything.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Current Progress</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">MVP</div>
                  <div className="text-sm text-gray-600">Platform Status</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Active</div>
                  <div className="text-sm text-gray-600">Development</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">Q2 2025</div>
                  <div className="text-sm text-gray-600">Launch Target</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Involved</h2>
              <p className="text-gray-700 mb-4">
                We're looking for job seekers, developers, and advocates who want to help build this platform:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Beta Testers:</strong> <a href="mailto:beta@ratemyemployer.life" className="text-blue-600 hover:underline">beta@ratemyemployer.life</a>
                </p>
                <p className="text-gray-700">
                  <strong>Contributors:</strong> <a href="https://github.com/Kabi10/ratemyemployer" className="text-blue-600 hover:underline">GitHub Repository</a>
                </p>
                <p className="text-gray-700">
                  <strong>Community:</strong> <a href="mailto:community@ratemyemployer.life" className="text-blue-600 hover:underline">community@ratemyemployer.life</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}