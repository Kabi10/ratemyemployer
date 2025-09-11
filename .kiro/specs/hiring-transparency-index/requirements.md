# Requirements Document

## Introduction

This specification outlines the requirements for implementing a Hiring Transparency Index system that scores and tracks companies based on their hiring practices. This system will serve as the foundation for holding employers accountable and helping job seekers make informed decisions about where to apply. The system will track metrics like ghosting frequency, salary transparency, process clarity, and response times to create an overall transparency score for each company.

## Requirements

### Requirement 1: Company Transparency Scoring System

**User Story:** As a job seeker, I want to see transparency scores for companies, so that I can avoid employers with poor hiring practices and focus on companies that treat candidates fairly.

#### Acceptance Criteria

1. WHEN viewing a company profile THEN the system SHALL display a transparency score from 0-100
2. WHEN calculating transparency scores THEN the system SHALL use ghost rating, salary transparency, process clarity, and response time metrics
3. WHEN a company has insufficient data THEN the system SHALL display "Insufficient Data" instead of a score
4. WHEN transparency scores are updated THEN the system SHALL recalculate based on the most recent 12 months of data
5. WHEN displaying scores THEN the system SHALL show the score breakdown by category (ghosting, salary, process, response time)
6. WHEN companies have multiple reviews THEN the system SHALL weight recent reviews more heavily in score calculations

### Requirement 2: Evidence-Based Review System

**User Story:** As a job seeker, I want to submit evidence-backed reviews of hiring experiences, so that my feedback is credible and helps other candidates make informed decisions.

#### Acceptance Criteria

1. WHEN submitting a review THEN the system SHALL allow users to upload redacted screenshots of job postings, emails, and communications
2. WHEN uploading evidence THEN the system SHALL validate file types (PNG, JPG, PDF) and size limits (max 5MB per file)
3. WHEN evidence is uploaded THEN the system SHALL automatically redact visible personal information using OCR
4. WHEN reviewing evidence THEN moderators SHALL be able to verify and approve evidence before publication
5. WHEN evidence is approved THEN the system SHALL display a "Verified" badge on the review
6. WHEN evidence is rejected THEN the system SHALL notify the user with specific reasons for rejection
7. WHEN viewing reviews THEN users SHALL be able to see evidence thumbnails and click to view full evidence

### Requirement 3: Time-Waste Calculator

**User Story:** As a job seeker, I want to track and quantify the time and money wasted on poor hiring processes, so that I can understand the real cost of unethical hiring practices.

#### Acceptance Criteria

1. WHEN submitting a review THEN the system SHALL allow users to input interview rounds, preparation hours, communication delays, and travel costs
2. WHEN calculating time waste THEN the system SHALL compute total hours spent and estimated monetary cost based on user's hourly rate
3. WHEN displaying time waste metrics THEN the system SHALL show individual and aggregate statistics for each company
4. WHEN viewing company profiles THEN the system SHALL display average time waste metrics from all reviews
5. WHEN a user was ghosted THEN the system SHALL factor this into the time waste calculation with additional penalty
6. WHEN travel was required THEN the system SHALL include travel time and costs in the calculation
7. WHEN multiple interview rounds occurred THEN the system SHALL calculate cumulative preparation and interview time

### Requirement 4: Community Alert System

**User Story:** As a job seeker, I want to receive alerts about unethical hiring practices, so that I can avoid companies engaging in mass hiring scams, fake postings, or wage baiting.

#### Acceptance Criteria

1. WHEN multiple users report similar issues THEN the system SHALL automatically generate community alerts
2. WHEN creating alerts THEN the system SHALL categorize them as mass_hiring, hiring_freeze, fake_posting, or wage_bait
3. WHEN alerts are generated THEN the system SHALL require verification from at least 3 independent users
4. WHEN alerts are active THEN the system SHALL display warning badges on company profiles
5. WHEN viewing alerts THEN users SHALL see the alert type, evidence count, verification status, and creation date
6. WHEN alerts are resolved THEN the system SHALL archive them but maintain historical records
7. WHEN users report issues THEN the system SHALL check for existing similar reports to consolidate alerts

### Requirement 5: Hiring Practice Analytics Dashboard

**User Story:** As a platform administrator, I want to view analytics on hiring practices across industries and companies, so that I can identify trends and patterns in unethical behavior.

#### Acceptance Criteria

1. WHEN accessing the analytics dashboard THEN the system SHALL display industry-wide transparency score trends
2. WHEN viewing analytics THEN the system SHALL show top and bottom performing companies by transparency metrics
3. WHEN filtering by time period THEN the system SHALL display historical trends and changes in hiring practices
4. WHEN analyzing by industry THEN the system SHALL show comparative transparency scores across different sectors
5. WHEN viewing geographic data THEN the system SHALL display transparency scores by location/region
6. WHEN generating reports THEN the system SHALL export data in CSV and PDF formats
7. WHEN tracking improvements THEN the system SHALL highlight companies that have improved their practices over time

### Requirement 6: User Reputation and Verification System

**User Story:** As a platform user, I want to build reputation through verified reviews, so that my contributions are trusted and carry more weight in the community.

#### Acceptance Criteria

1. WHEN users submit verified reviews THEN the system SHALL increase their reputation score
2. WHEN calculating user reputation THEN the system SHALL consider review quality, evidence provided, and community feedback
3. WHEN users reach reputation milestones THEN the system SHALL grant additional privileges (e.g., priority review approval)
4. WHEN displaying reviews THEN the system SHALL show the reviewer's reputation level
5. WHEN users provide false information THEN the system SHALL penalize their reputation score
6. WHEN moderating content THEN high-reputation users SHALL be able to help with review verification
7. WHEN new users join THEN the system SHALL provide guidance on building reputation through quality contributions

### Requirement 7: Company Response and Improvement Tracking

**User Story:** As a company representative, I want to respond to reviews and demonstrate improvements in hiring practices, so that I can rebuild trust with job seekers and improve my transparency score.

#### Acceptance Criteria

1. WHEN companies respond to reviews THEN the system SHALL allow verified company representatives to post official responses
2. WHEN company responses are posted THEN the system SHALL clearly mark them as official company responses
3. WHEN companies implement improvements THEN the system SHALL allow them to submit evidence of policy changes
4. WHEN tracking improvements THEN the system SHALL monitor transparency score changes over time
5. WHEN companies dispute reviews THEN the system SHALL provide a formal dispute resolution process
6. WHEN improvements are verified THEN the system SHALL highlight positive changes on company profiles
7. WHEN companies engage positively THEN the system SHALL factor this into transparency score calculations

### Requirement 8: Integration with Job Boards and External Data

**User Story:** As a job seeker, I want to see transparency scores when browsing job postings on external sites, so that I can make informed decisions without switching platforms.

#### Acceptance Criteria

1. WHEN integrating with job boards THEN the system SHALL provide API endpoints for transparency score lookup
2. WHEN external sites request data THEN the system SHALL return company transparency scores and key metrics
3. WHEN job postings are analyzed THEN the system SHALL detect potential red flags (unrealistic requirements, vague descriptions)
4. WHEN salary data is available THEN the system SHALL compare posted ranges with reported actual offers
5. WHEN companies post multiple similar roles THEN the system SHALL flag potential mass hiring or fake posting patterns
6. WHEN providing browser extensions THEN users SHALL see transparency overlays on job board sites
7. WHEN tracking job posting patterns THEN the system SHALL identify companies that frequently post and remove jobs

### Requirement 9: Mobile Application and Accessibility

**User Story:** As a job seeker using mobile devices, I want to access transparency information and submit reviews on-the-go, so that I can make informed decisions and provide timely feedback during my job search.

#### Acceptance Criteria

1. WHEN accessing on mobile devices THEN the system SHALL provide a responsive web interface optimized for mobile
2. WHEN using screen readers THEN the system SHALL provide proper ARIA labels and semantic HTML
3. WHEN uploading evidence on mobile THEN the system SHALL support camera capture and photo uploads
4. WHEN receiving notifications THEN the system SHALL support push notifications for alerts and updates
5. WHEN using offline THEN the system SHALL cache essential data and allow offline review drafting
6. WHEN syncing data THEN the system SHALL synchronize offline changes when connection is restored
7. WHEN supporting accessibility THEN the system SHALL meet WCAG 2.1 AA compliance standards

### Requirement 10: Data Privacy and Security

**User Story:** As a platform user, I want my personal information and evidence to be protected, so that I can safely report unethical hiring practices without fear of retaliation.

#### Acceptance Criteria

1. WHEN users submit evidence THEN the system SHALL automatically detect and redact personal information
2. WHEN storing user data THEN the system SHALL encrypt sensitive information at rest and in transit
3. WHEN users request anonymity THEN the system SHALL allow anonymous review submission with verification
4. WHEN handling evidence THEN the system SHALL store files securely with access controls
5. WHEN users delete accounts THEN the system SHALL anonymize their reviews while preserving transparency data
6. WHEN moderating content THEN the system SHALL limit moderator access to necessary information only
7. WHEN complying with regulations THEN the system SHALL meet GDPR, CCPA, and other applicable privacy laws