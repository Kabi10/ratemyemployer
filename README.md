# 🏢 RateMyEmployer - Modern Employer Review Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

A comprehensive, modern platform for rating and reviewing employers with advanced features including AI-powered insights, web scraping infrastructure, financial distress tracking, and enterprise-grade security monitoring.

## 🌟 **Key Features**

### 🎨 **Modern UI Design System**
- **Enhanced Components**: Professional design with glassmorphism effects and micro-interactions
- **Accessibility First**: WCAG 2.1 AA compliant throughout the platform
- **Dark Mode Support**: Complete light/dark theme system with automatic switching
- **Mobile Optimized**: Touch-friendly interface with responsive design
- **Design Tokens**: Consistent theming with CSS custom properties

### 🔍 **Advanced Company Intelligence**
- **Company Reviews**: Comprehensive employee review system with detailed ratings
- **Financial Distress Tracking**: Monitor companies facing bankruptcy, layoffs, or financial trouble
- **Rising Startups**: Track emerging companies with funding rounds and growth metrics
- **Wall of Fame/Shame**: Interactive showcases of best and worst-rated companies
- **Real-time Updates**: Live company and review updates using Supabase real-time

### 🤖 **Automated Data Collection**
- **Web Scraping Infrastructure**: Ethical, automated data collection from multiple sources
- **Company Data Enrichment**: Automated population from business directories and APIs
- **News Integration**: Real-time company news and updates
- **Data Quality Validation**: Comprehensive validation and deduplication systems
- **Robots.txt Compliance**: Ethical scraping practices with rate limiting

### 🔒 **Enterprise-Grade Security**
- **Advanced Threat Detection**: Real-time monitoring for XSS, SQL injection, and path traversal
- **Rate Limiting**: Intelligent rate limiting with automatic IP blocking
- **Security Dashboard**: Comprehensive security event monitoring and analytics
- **Input Validation**: Complete request validation and sanitization
- **Error Handling**: Advanced error tracking and recovery systems

### 📊 **Performance Monitoring**
- **Web Vitals Tracking**: Real-time Core Web Vitals monitoring (CLS, FID, FCP, LCP, TTFB)
- **API Performance**: Response time tracking and optimization insights
- **Database Monitoring**: Query performance analysis and optimization
- **Component Performance**: React component render time tracking
- **User Experience Metrics**: Comprehensive UX analytics and insights

## 🚀 **Recent Major Updates**

### ✨ **8 Major Features Implemented:**
1. **UI Design System Upgrade** - Modern, accessible design with enhanced components
2. **Web Scraping Infrastructure** - Ethical, automated data collection system
3. **Financial Distress & Rising Startups Sections** - New platform sections with auto-population
4. **Wall of Fame/Shame Enhancements** - Interactive visualizations and social features
5. **Database Population Automation** - Automated company data collection and validation
6. **Security & Performance Monitoring** - Enterprise-grade monitoring and threat detection
7. **Paid API Migration** - Eliminated $600-4,200+ annual costs, achieved zero-cost operations
8. **Comprehensive Testing Suite** - 90%+ coverage target with component, API, and integration tests

### 💰 **Cost Optimization Achievement**
- **Zero-Cost Operations**: Eliminated all paid API dependencies
- **Annual Savings**: $600-4,200+ in operational costs
- **Free Tier Optimization**: Maximized free service utilization
- **Sustainable Growth**: Clear path for scaling without cost explosion

## 🛠️ **Tech Stack**

### **Frontend**
- **Next.js 14**: React framework with App Router and Server Components
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Smooth animations and micro-interactions

### **Backend & Database**
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Row Level Security**: Granular access control and data protection
- **Edge Functions**: Serverless functions for complex operations
- **Real-time**: Live updates and notifications

### **Monitoring & Security**
- **Custom Security Monitoring**: Advanced threat detection and prevention
- **Performance Tracking**: Web Vitals and custom metrics monitoring
- **Error Handling**: Comprehensive error tracking and recovery
- **Rate Limiting**: Intelligent request throttling and protection

### **Development & Deployment**
- **Vercel**: Serverless deployment with edge optimization
- **GitHub Actions**: Automated testing and deployment pipelines
- **ESLint & Prettier**: Code quality and formatting
- **Vitest**: Modern testing framework with comprehensive coverage

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Supabase DB    │    │  External APIs  │
│                 │    │                  │    │                 │
│ • UI Components │◄──►│ • PostgreSQL     │◄──►│ • News Sources  │
│ • API Routes    │    │ • Real-time      │    │ • Company Data  │
│ • Middleware    │    │ • Authentication │    │ • Financial API │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Monitoring    │    │   Web Scraping   │    │   Security      │
│                 │    │                  │    │                 │
│ • Performance   │    │ • Data Collection│    │ • Threat Detect │
│ • Error Tracking│    │ • Quality Valid. │    │ • Rate Limiting │
│ • Analytics     │    │ • Ethical Scrape │    │ • Input Valid.  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 **Getting Started**

### **Prerequisites**
- Node.js >= 20.0.0
- npm >= 10.0.0
- Supabase account

### **Installation & Setup**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kabi10/ratemyemployer.git
   cd ratemyemployer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   ```bash
   cp .env.example .env.local
   ```

   **Required environment variables (Free):**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   **💡 Zero-Cost Operation:** The application works completely free with just Supabase credentials!

4. **Database Setup:**
   ```bash
   # Initialize Supabase locally (optional)
   npx supabase start

   # Run database migrations
   npx supabase db push
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:** Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 **Testing & Quality Assurance**

### **Testing Suite**
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npx playwright test

# Run component tests
npm run test:components

# Run integration tests
npm run test:integration
```

### **Code Quality**
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check

# Build for production
npm run build
```

## 📊 **Database Schema**

### **Core Tables**
- `companies` - Company profiles and metadata
- `reviews` - Employee reviews and ratings
- `users` - User authentication and profiles
- `company_news` - News articles and company updates

### **Advanced Features**
- `scraping_jobs` - Web scraping automation
- `scraped_data` - Collected external data
- `company_data_enhancements` - AI-enhanced company information
- `performance_metrics` - Performance monitoring
- `security_events` - Security monitoring
- `error_logs` - Error tracking and logging

### **Database Migrations**
```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push

# Reset database
npx supabase db reset
```

## 📚 **Documentation**

### **Comprehensive Guides**
- [UI Design System Upgrade](./docs/UI_DESIGN_SYSTEM_UPGRADE.md) - Complete design system implementation
- [Web Scraping Infrastructure](./docs/WEB_SCRAPING_INFRASTRUCTURE.md) - Automated data collection system
- [Supabase Evaluation](./docs/SUPABASE_EVALUATION.md) - Database strategy and optimization
- [Platform Enhancement Recommendations](./docs/PLATFORM_ENHANCEMENT_RECOMMENDATIONS.md) - Future improvements roadmap
- [New Sections Implementation](./docs/NEW_SECTIONS_IMPLEMENTATION.md) - Financial distress and rising startups features

### **API Documentation**
- **Companies API**: `/api/companies` - Company CRUD operations
- **Reviews API**: `/api/reviews` - Review management
- **Scraping API**: `/api/scraping` - Web scraping operations
- **Monitoring API**: `/api/monitoring` - Performance and security metrics

## 🚀 **Deployment**

### **Vercel Deployment (Recommended)**
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Environment Variables for Production**
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### **Performance Optimization**
- **Bundle Analysis**: `npm run analyze`
- **Lighthouse Audit**: Built-in performance monitoring
- **Core Web Vitals**: Real-time tracking and optimization

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run the test suite**: `npm run test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Maintain test coverage above 90%
- Use conventional commit messages
- Update documentation for new features
- Ensure accessibility compliance (WCAG 2.1 AA)

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Supabase** for providing an excellent backend-as-a-service platform
- **Vercel** for seamless deployment and hosting
- **Next.js** team for the amazing React framework
- **Tailwind CSS** for the utility-first CSS framework
- **Radix UI** for accessible component primitives

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/Kabi10/ratemyemployer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Kabi10/ratemyemployer/discussions)
- **Documentation**: [Project Wiki](https://github.com/Kabi10/ratemyemployer/wiki)

---

**Built with ❤️ by [Kabi](https://github.com/Kabi10)**

*Empowering career decisions through authentic workplace insights*

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# MCP related commands
npm run mcp:setup        # Set up MCP for the first time
npm run mcp:start        # Start the MCP server
npm run mcp:runner       # Run the interactive MCP CLI
npm run mcp:update-schema # Update MCP schema from Supabase

# Database migrations
npm run migrations:run   # Run database migrations
```

## Database Population

To populate your database with sample data for development:

```bash
# Install tsx for running TypeScript scripts
npm install -g tsx

# Populate companies (default: 50 companies)
tsx scripts/populate-companies.ts

# Populate companies with custom count
tsx scripts/populate-companies.ts 100

# Populate reviews (default: 10 reviews per company)
tsx scripts/populate-reviews.ts

# Populate reviews with custom counts
tsx scripts/populate-reviews.ts 50 15  # 50 companies, 15 reviews each
```

**Note:** Make sure your Supabase environment variables are set before running population scripts.

```bash
# Add test data for Wall of Fame/Shame
npx tsx scripts/add-wall-test-data.ts

# Automated database population
npm run populate:auto              # Full automation (Fortune 500 + Startups)
npm run populate:fortune500        # Fortune 500 companies only
npm run populate:startups          # Tech startups only
```

## Project Structure

```
src/
├── app/             # Next.js app router pages
├── components/      # React components
├── contexts/        # React contexts
├── hooks/          # Custom hooks
├── lib/            # Utilities and configurations
└── types/          # TypeScript types

scripts/
├── add-wall-test-data.ts    # Add test data for Wall of Fame/Shame
├── mcp-sample-queries.ts    # Sample MCP queries
├── mcp-stored-procedures.sql # SQL stored procedures for MCP
├── run-mcp-server.js        # Interactive MCP server runner
├── setup-mcp.ts             # MCP setup script
├── update-mcp-schema.ts     # Update MCP schema from Supabase
├── run-migrations.ts        # Run database migrations
└── setup-stored-procedures.ts # MCP stored procedures setup

tests/
├── e2e/            # End-to-end tests
├── fixtures/       # Test data
└── utils/          # Test utilities
```

## Wall of Fame and Wall of Shame

RateMyEmployer features a Wall of Fame and Wall of Shame to highlight the highest and lowest-rated companies based on employee reviews.

### Key Features

- **Wall of Fame**: Showcases companies with the highest ratings
- **Wall of Shame**: Highlights companies with the lowest ratings
- **Industry Filtering**: Filter companies by industry
- **Advanced Filtering**: Filter by location, size, and rating range
- **Company Statistics**: View statistics about companies, reviews, and ratings
- **News Integration**: See latest news about featured companies

### Adding Test Data

To populate the Wall of Fame and Wall of Shame with test data:

```bash
npx tsx scripts/add-wall-test-data.ts
```

This script adds:
- 5 companies with high ratings for the Wall of Fame
- 5 companies with low ratings for the Wall of Shame
- 4 positive reviews for each Wall of Fame company
- 4 negative reviews for each Wall of Shame company

### Accessing the Walls

- Wall of Fame: `/fame`
- Wall of Shame: `/shame`

### Implementation Details

The Wall of Fame and Wall of Shame are implemented using:
- Direct Supabase queries for data fetching
- Client-side data processing for statistics
- Industry tabs for easy filtering
- Responsive design for all device sizes
- Color-coded rating indicators (red, yellow, green)
- News integration for featured companies

## Testing

We use Playwright for end-to-end testing:
- End-to-end tests with Playwright
- Type checking with TypeScript
- Linting with ESLint

```bash
# Run E2E tests
npx playwright test

# Run specific test file
npx playwright test company.spec.ts

# Show test report
npx playwright show-report
```

## Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Security

For security concerns, please refer to our [Security Policy](SECURITY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Deployment

The application is configured for deployment on Vercel with the following features:
- Standalone output
- Compressed responses
- Security headers
- Bundle analysis support

## Performance Optimization

- Image optimization with next/image
- Remote patterns for allowed image domains
- Webpack caching enabled
- Bundle analysis available
- TypeScript and ESLint checking enabled

## Support

For support, please:
1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Review [PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md)
3. Open an issue in the repository

## Automated News Fetching

The Wall of Shame feature includes automated news fetching via GitHub Actions. The system:

- Runs twice daily (6 AM and 6 PM UTC)
- Fetches news for the 10 companies with lowest ratings
- Uses free RSS feeds and Google News RSS (no API key required)
- Falls back to SerpAPI if API key is provided
- Stores results in the database for quick access

### Required Repository Secrets

To enable the news fetching workflow, add these secrets to your GitHub repository:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Optional Repository Secrets

- `SERP_API_KEY`: Your SerpAPI key (uses free RSS feeds if not provided)

### Manual Trigger

You can manually trigger the news fetch workflow:

## 🏢 Database Population

The application includes automated database population to quickly add companies from various sources:

### Automated Population Sources

- **Fortune 500 Companies**: Well-known large corporations
- **Tech Startups**: Popular technology companies and startups
- **User Suggestions**: Community-driven company additions
- **CSV Bulk Import**: Administrative batch uploads
- **OpenStreetMap**: Location-based company discovery

### Population Commands

```bash
# Full automated population
npm run populate:auto

# Specific data sources
npm run populate:fortune500    # Fortune 500 companies
npm run populate:startups      # Tech startups

# Manual script with options
tsx scripts/populate-database-automation.ts --help
```

### GitHub Actions Automation

The database population runs automatically:
- **Weekly**: Every Sunday at 2 AM UTC
- **Manual**: Trigger via GitHub Actions interface
- **Configurable**: Choose specific data sources

### User Suggestion System

Users can suggest companies through the application interface:
1. Submit company information via suggestion form
2. Admin reviews and approves/rejects suggestions
3. Approved suggestions automatically become companies

See [Database Population Guide](./docs/DATABASE_POPULATION.md) for detailed documentation.

## 📊 Supabase Monitoring & Cost Optimization

The application includes comprehensive Supabase usage monitoring and cost optimization tools:

### Real-time Monitoring

- **Usage Tracking**: Database size, bandwidth, storage, and active users
- **Cost Estimation**: Current and projected monthly costs
- **Free Tier Monitoring**: Track usage against Supabase free tier limits
- **Performance Metrics**: Query optimization and database health

### Automated Optimization

```bash
# Run comprehensive cost optimization
npm run supabase:optimize

# Monitor current usage and costs
npm run supabase:monitor

# Manual optimization with options
tsx scripts/supabase-cost-optimization.ts --help
```

### Admin Dashboard

The admin panel includes a dedicated Supabase monitoring dashboard with:
- Real-time usage metrics and alerts
- Cost breakdown and projections
- Usage trends and historical data
- Optimization recommendations

### Key Features

- **Zero-Cost Strategy**: Optimized to stay within free tier limits
- **Automated Alerts**: Warnings when approaching usage limits
- **Performance Optimization**: Database maintenance and query optimization
- **Historical Tracking**: Usage trends and cost projections
- **Migration Planning**: Strategic recommendations for scaling

See [Supabase Evaluation Report](./docs/SUPABASE_EVALUATION.md) for comprehensive analysis and recommendations.

## 🚨 Financial Distress & 🚀 Rising Startups Sections

RateMyEmployer now features specialized sections for tracking company financial health and growth opportunities:

### Financial Distress Monitor

Track companies experiencing financial difficulties and make informed career decisions:

- **Distress Indicators**: Layoffs, funding issues, revenue decline, leadership changes
- **Severity Scoring**: 1-5 scale with impact assessment
- **Real-time Monitoring**: Automated detection from news and review patterns
- **Industry Analysis**: Breakdown by industry and location
- **Trend Tracking**: Historical distress patterns and predictions

### Rising Startups Tracker

Discover promising startups and rapidly growing companies:

- **Growth Indicators**: Funding rounds, expansion, hiring sprees, partnerships
- **Growth Scoring**: 1-10 scale with confidence metrics
- **Funding Information**: Latest rounds, valuations, and investor details
- **Success Metrics**: Awards, recognition, and achievements
- **Opportunity Filtering**: Filter by growth stage and potential

### Automated Detection System

```bash
# Run automated indicator detection
npm run sections:detect

# Add test data for development
npm run sections:test-data

# Manual detection with options
tsx scripts/run-automated-detection.ts --help
```

### Key Features

- **Smart Analysis**: Automated detection from news articles and review patterns
- **Comprehensive Filtering**: Industry, location, score ranges, and time periods
- **Visual Indicators**: Color-coded severity and growth levels
- **Real-time Updates**: Continuous monitoring and indicator updates
- **Mobile Optimized**: Responsive design for all devices

### Section Access

- **Financial Distress**: `/financial-distress`
- **Rising Startups**: `/rising-startups`
- **Integrated Navigation**: Accessible from main menu

See [New Sections Implementation Guide](./docs/NEW_SECTIONS_IMPLEMENTATION.md) for detailed technical documentation.

## 🕷️ Web Scraping Infrastructure

RateMyEmployer features a comprehensive web scraping infrastructure for automated data collection and enhancement:

### Advanced Automation Capabilities

Sophisticated web scraping systems for automated data collection:

- **Multi-Source Scraping**: Company websites, news sites, job boards, review platforms
- **Intelligent Job Scheduling**: Priority-based queue with concurrent processing
- **Data Type Specialization**: Dedicated scrapers for company data, reviews, news, job listings
- **Quality Assurance**: Automated validation and quality scoring
- **Deduplication**: Intelligent duplicate detection and prevention

### Ethical Scraping Practices

Respectful and responsible data collection:

- **Robots.txt Compliance**: Automatic checking and respect for robots.txt files
- **Rate Limiting**: Configurable limits to avoid overwhelming servers
- **User Agent Rotation**: Respectful identification and request patterns
- **Terms of Service**: Framework for respecting platform terms
- **Crawl Delays**: Intelligent delays based on server responses

### Data Quality & Validation

Comprehensive quality assurance system:

- **Validation Rules**: Configurable validation for different data types
- **Quality Scoring**: Automated assessment of data completeness and accuracy
- **Spam Detection**: Identifies and filters spam or low-quality content
- **Confidence Metrics**: Reliability scoring for all scraped data
- **Manual Verification**: Interface for human validation and verification

### Web Scraping Dashboard

```bash
# Access the scraping dashboard
# Visit: /scraping

# Run the scraping system
npm run scraping:run

# Demo mode with sample data
npm run scraping:demo

# Monitor existing operations
npm run scraping:monitor

# Validate scraped data quality
npm run scraping:validate
```

### Key Features

- **Real-time Monitoring**: Live job status and progress tracking
- **Statistics Dashboard**: Success rates, completion times, quality metrics
- **Engine Controls**: Start/stop scraping operations
- **Job Management**: Create, cancel, retry scraping jobs
- **Data Enhancement**: Automatic company data enrichment

### Scraper Types

- **Company Data**: Basic information, industry, description, contact details
- **News Monitoring**: Company mentions, sentiment analysis, relevance scoring
- **Job Listings**: Career page scraping, position details, requirements
- **Review Collection**: Employee feedback (with ethical considerations)
- **Financial Data**: Public financial information and metrics

### Performance & Scalability

- **Concurrent Processing**: Multiple jobs running simultaneously
- **Intelligent Queuing**: Priority-based job scheduling
- **Caching Systems**: Robots.txt and metadata caching
- **Error Recovery**: Automatic retry with exponential backoff
- **Resource Management**: Memory and CPU optimization

See [Web Scraping Infrastructure Guide](./docs/WEB_SCRAPING_INFRASTRUCTURE.md) for comprehensive technical documentation.

## 🎨 UI Design System Upgrade

RateMyEmployer features a comprehensive, modern design system delivering exceptional user experience:

### Enhanced Component Library

Modern, accessible UI components with advanced functionality:

- **Enhanced Buttons**: 8 variants, loading states, icon support, accessibility-first design
- **Enhanced Cards**: 10 variants, hover effects, structured content, skeleton loading
- **Enhanced Inputs**: 4 variants, validation states, interactive elements, full accessibility
- **Enhanced Navigation**: 4 variants, dropdown menus, mobile responsive, theme switching
- **Design Tokens**: Comprehensive CSS custom properties for consistent theming

### Advanced Design Features

Sophisticated visual design with modern patterns:

- **Glassmorphism Effects**: Subtle transparency and backdrop blur
- **Gradient Systems**: Dynamic color transitions and animations
- **Micro-interactions**: Smooth 60fps animations with hardware acceleration
- **Responsive Design**: Mobile-first, adaptive layouts with touch optimization
- **Dark Mode**: Complete light/dark theme system with automatic switching

### Accessibility Excellence

WCAG 2.1 AA compliant throughout the platform:

- **Keyboard Navigation**: Full keyboard accessibility for all components
- **Screen Reader Support**: Comprehensive ARIA implementation
- **Color Contrast**: 4.5:1+ contrast ratios throughout
- **Focus Management**: Visible focus indicators and proper tab order
- **Reduced Motion**: Respects user motion preferences

### Design System Showcase

```bash
# Access the design system documentation
# Visit: /design-system

# Component usage examples
import { EnhancedButton, EnhancedCard, EnhancedInput } from '@/components/ui';

<EnhancedButton variant="premium" loading>
  Premium Action
</EnhancedButton>

<EnhancedCard variant="glass" hoverEffect="lift">
  Modern card with glassmorphism
</EnhancedCard>

<EnhancedInput
  label="Email"
  type="email"
  clearable
  showValidation
/>
```

### Performance Optimizations

Optimized for speed and efficiency:

- **CSS-in-JS**: Class Variance Authority for minimal bundle size
- **Hardware Acceleration**: GPU-accelerated transforms and animations
- **Code Splitting**: Dynamic imports for optimal loading
- **Responsive Images**: WebP format with intelligent fallbacks
- **Efficient Rendering**: React.memo and optimized re-renders

### Mobile Experience

Touch-optimized interface design:

- **Large Touch Targets**: Minimum 44px for all interactive elements
- **Gesture Support**: Swipe, pinch, and tap interactions
- **Adaptive Navigation**: Collapsible menus and mobile-first design
- **Performance**: Optimized animations for lower-end devices

### Key Improvements

- **Modern Aesthetic**: Glassmorphism, gradients, and elevated design
- **Enhanced UX**: Micro-interactions, loading states, and clear feedback
- **Accessibility**: WCAG 2.1 AA compliance throughout
- **Performance**: 60fps animations with hardware acceleration
- **Consistency**: Unified design language with systematic spacing and typography

See [UI Design System Upgrade Guide](./docs/UI_DESIGN_SYSTEM_UPGRADE.md) for comprehensive implementation documentation.

1. Go to the "Actions" tab in your repository
2. Select "Fetch Company News" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

## Model Context Protocol (MCP) Integration

RateMyEmployer includes integration with the Model Context Protocol (MCP), which enables natural language interaction with the Supabase database through AI tools like Cursor.

### Key Features

- Query the database using plain English instead of SQL
- Generate complex queries without writing SQL
- Analyze company ratings, review trends, and user activity
- Integrate AI-powered queries into your application

### Getting Started with MCP

1. Set up the MCP server:
   ```bash
   npm run mcp:setup
   ```

2. Start the MCP server:
   ```bash
   npm run mcp:start
   ```
   
   Or use the interactive runner:
   ```bash
   npm run mcp:runner
   ```

3. Visit the MCP demo page at `/mcp-demo` to see it in action

### Updating MCP Schema

If your Supabase schema changes, you can update the MCP schema:

```bash
npm run mcp:update-schema
```

This will fetch the latest schema from your Supabase instance and update the MCP configuration files.

### Statistics Module

As an alternative to PostgreSQL stored procedures, we've implemented a TypeScript-based statistics module in `src/lib/statistics.ts`. This module provides:

- Industry and location statistics calculation
- Improved reliability over SQL stored procedures
- Full TypeScript type safety
- Better error handling and debugging
- Easy integration with React components

To use the statistics module:

```typescript
import { 
  getIndustryStatistics, 
  getAllIndustryStatistics,
  getLocationStatistics,
  getAllLocationStatistics 
} from '@/lib/statistics';

// Example usage
const industryStats = await getIndustryStatistics();
```

For more details, see the [statistics module documentation](src/lib/README.md).

For comprehensive documentation on the MCP integration, see [MCP_DOCUMENTATION.md](MCP_DOCUMENTATION.md).

## Database Migrations

RateMyEmployer uses database migrations to manage schema changes. The migrations are stored in the `supabase/migrations` directory.

### Running Migrations

To run database migrations:

```bash
npm run migrations:run
```

This will apply any pending migrations to your Supabase instance.

### Creating New Migrations

1. Create a new SQL file in the `supabase/migrations` directory with a timestamp prefix
2. Write your migration SQL in the file
3. Run the migrations using the command above

### Migration Best Practices

- Always test migrations in a development environment first
- Back up your database before running migrations in production
- Keep migrations small and focused on specific changes
- Include both "up" and "down" migrations when possible
- Document complex migrations with comments

For more details on database management, see the [Database Guide](docs/DATABASE_GUIDE.md). 
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Kabi10/ratemyemployer?utm_source=oss&utm_medium=github&utm_campaign=Kabi10%2Fratemyemployer&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
