import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dispute Resolution - RateMyEmployer',
  description: 'Process for resolving disputes between employers and reviewers regarding hiring practice claims.',
};

export default function DisputesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dispute Resolution Process</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                We provide a fair and transparent process for resolving disputes between employers and job seekers 
                regarding hiring practice reviews. Our goal is to maintain accuracy while protecting the rights of 
                both parties to share and respond to legitimate concerns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Disputes</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Factual Disputes</h3>
                  <p className="text-gray-700 text-sm">
                    Claims about specific hiring practices, timelines, or communications that can be verified 
                    with documentation.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Policy Violations</h3>
                  <p className="text-gray-700 text-sm">
                    Reviews that violate our community guidelines, contain false information, or include 
                    inappropriate content.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Process</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Submit Dispute</h3>
                    <p className="text-gray-700">
                      Email <a href="mailto:disputes@ratemyemployer.life" className="text-blue-600 hover:underline">disputes@ratemyemployer.life</a> with:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                      <li>Link to the specific review or content</li>
                      <li>Detailed explanation of the dispute</li>
                      <li>Supporting documentation or evidence</li>
                      <li>Your contact information and role (employer/job seeker)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Initial Review</h3>
                    <p className="text-gray-700">
                      Our moderation team reviews the dispute within 48 hours and determines if it meets 
                      the criteria for investigation. You'll receive confirmation and a case number.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Investigation</h3>
                    <p className="text-gray-700">
                      We contact the original reviewer for their response and additional evidence. 
                      Both parties may be asked to provide further documentation to support their claims.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Resolution</h3>
                    <p className="text-gray-700">
                      Based on the evidence, we may update the review, add clarifying information, 
                      or remove content that violates our guidelines. All parties are notified of the decision.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resolution Outcomes</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Review Updates</h3>
                  <p className="text-gray-700">
                    When factual errors are identified, we update reviews with corrected information 
                    and add a note about the dispute resolution process.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Content Removal</h3>
                  <p className="text-gray-700">
                    Reviews that violate our guidelines or contain demonstrably false information 
                    are removed entirely from the platform.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Action</h3>
                  <p className="text-gray-700">
                    When disputes lack sufficient evidence or the review complies with our guidelines, 
                    no changes are made to the original content.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Appeals Process</h2>
              <p className="text-gray-700 mb-4">
                If you disagree with our dispute resolution decision, you may appeal within 30 days by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Providing new evidence not previously considered</li>
                <li>Demonstrating procedural errors in the investigation</li>
                <li>Showing that the decision was inconsistent with our published guidelines</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Appeals are reviewed by a senior moderation team member not involved in the original decision.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Dispute Submissions</h3>
                    <p className="text-gray-700">
                      <a href="mailto:disputes@ratemyemployer.life" className="text-blue-600 hover:underline">disputes@ratemyemployer.life</a>
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Appeals</h3>
                    <p className="text-gray-700">
                      <a href="mailto:appeals@ratemyemployer.life" className="text-blue-600 hover:underline">appeals@ratemyemployer.life</a>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Response Time:</strong> Initial response within 48 hours, full investigation within 7 business days
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}