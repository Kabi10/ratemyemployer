# Web Scraping Infrastructure Implementation Guide

## 🎯 **Overview**

This guide documents the comprehensive web scraping infrastructure for RateMyEmployer, providing advanced automation capabilities for data collection while maintaining ethical practices and zero-cost operations.

## 🏗️ **Architecture Overview**

The web scraping infrastructure features a sophisticated multi-layered architecture:

1. **Database Layer**: Comprehensive schema for tracking scraping operations and data
2. **Engine Layer**: Core scraping engine with job management and execution
3. **Scraper Layer**: Specialized scrapers for different data types and sources
4. **API Layer**: RESTful API for managing scraping operations
5. **Quality Layer**: Data validation and quality assurance systems
6. **UI Layer**: Dashboard for monitoring and managing operations
7. **Ethics Layer**: Robots.txt compliance and rate limiting

## 📊 **Database Schema**

### Core Tables

#### 1. **scraping_jobs**
Manages automated scraping operations and job scheduling.

```sql
CREATE TABLE scraping_jobs (
    id uuid PRIMARY KEY,
    job_name text NOT NULL,
    scraper_type scraper_type NOT NULL,
    data_source data_source NOT NULL,
    target_url text,
    target_company_id bigint REFERENCES companies(id),
    target_company_name text,
    status scraping_status DEFAULT 'pending',
    priority integer DEFAULT 5,
    scheduled_at timestamp,
    started_at timestamp,
    completed_at timestamp,
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    error_message text,
    configuration jsonb DEFAULT '{}',
    results_summary jsonb DEFAULT '{}',
    created_at timestamp DEFAULT now()
);
```

#### 2. **scraped_data**
Stores raw and processed data from scraping operations.

```sql
CREATE TABLE scraped_data (
    id uuid PRIMARY KEY,
    scraping_job_id uuid REFERENCES scraping_jobs(id),
    company_id bigint REFERENCES companies(id),
    data_type text NOT NULL,
    source_url text,
    raw_data jsonb NOT NULL,
    processed_data jsonb DEFAULT '{}',
    data_hash text, -- For deduplication
    confidence_score numeric(3,2) DEFAULT 0.5,
    is_processed boolean DEFAULT false,
    is_validated boolean DEFAULT false,
    validation_notes text,
    scraped_at timestamp DEFAULT now()
);
```

#### 3. **company_data_enhancements**
Enhanced company data from various sources.

```sql
CREATE TABLE company_data_enhancements (
    id uuid PRIMARY KEY,
    company_id bigint REFERENCES companies(id),
    data_source data_source NOT NULL,
    enhancement_type text NOT NULL,
    data_field text NOT NULL,
    original_value text,
    enhanced_value text NOT NULL,
    confidence_score numeric(3,2) DEFAULT 0.5,
    source_url text,
    is_verified boolean DEFAULT false,
    verified_by uuid REFERENCES auth.users(id),
    verified_at timestamp,
    created_at timestamp DEFAULT now()
);
```

#### 4. **scraping_rate_limits**
Rate limiting configuration and tracking.

```sql
CREATE TABLE scraping_rate_limits (
    id uuid PRIMARY KEY,
    data_source data_source NOT NULL,
    endpoint text,
    requests_per_minute integer DEFAULT 60,
    requests_per_hour integer DEFAULT 1000,
    requests_per_day integer DEFAULT 10000,
    current_minute_count integer DEFAULT 0,
    current_hour_count integer DEFAULT 0,
    current_day_count integer DEFAULT 0,
    last_request_at timestamp,
    is_blocked boolean DEFAULT false,
    blocked_until timestamp
);
```

#### 5. **robots_txt_cache**
Cached robots.txt files for ethical scraping.

```sql
CREATE TABLE robots_txt_cache (
    id uuid PRIMARY KEY,
    domain text NOT NULL UNIQUE,
    robots_content text,
    crawl_delay integer DEFAULT 1,
    allowed_paths text[],
    disallowed_paths text[],
    last_fetched timestamp DEFAULT now(),
    expires_at timestamp DEFAULT now() + interval '24 hours'
);
```

### Enum Types

```sql
CREATE TYPE scraping_status AS ENUM (
    'pending', 'running', 'completed', 'failed', 'paused', 'cancelled'
);

CREATE TYPE scraper_type AS ENUM (
    'company_data', 'job_listings', 'reviews', 'news', 'social_media',
    'financial_data', 'employee_data', 'glassdoor', 'linkedin', 'indeed', 'custom'
);

CREATE TYPE data_source AS ENUM (
    'glassdoor', 'indeed', 'linkedin', 'crunchbase', 'company_website',
    'news_sites', 'social_media', 'government_data', 'financial_apis',
    'job_boards', 'review_sites', 'custom_api'
);
```

## 🔧 **Technical Implementation**

### Core Components

#### 1. **Scraping Engine** (`src/lib/webScraping/scrapingEngine.ts`)
- **Job Management**: Queue-based job processing with priority support
- **Concurrent Execution**: Configurable concurrent job limits
- **Retry Logic**: Automatic retry with exponential backoff
- **Rate Limiting**: Intelligent rate limiting per data source
- **Robots.txt Compliance**: Automatic robots.txt checking and caching

#### 2. **Specialized Scrapers**
- **Company Data Scraper**: Extracts company information from websites
- **News Scraper**: Monitors news articles and company mentions
- **Review Scraper**: Collects employee reviews (with ethical considerations)
- **Job Listings Scraper**: Gathers job postings from career pages

#### 3. **Data Quality System** (`src/lib/webScraping/dataQuality.ts`)
- **Validation Rules**: Configurable validation for different data types
- **Quality Scoring**: Automated quality assessment
- **Spam Detection**: Identifies and filters spam content
- **Deduplication**: Prevents duplicate data storage

#### 4. **API Layer** (`src/lib/webScraping/scrapingApi.ts`)
- **Job Management**: Create, monitor, and control scraping jobs
- **Data Retrieval**: Access scraped data with filtering and pagination
- **Statistics**: Comprehensive analytics and reporting
- **Validation**: Data validation and verification endpoints

### Key Features

#### Ethical Scraping
```typescript
// Robots.txt compliance
const robotsAllowed = await this.checkRobotsPermission(url);
if (!robotsAllowed) {
    throw new Error(`Robots.txt disallows scraping for ${url}`);
}

// Rate limiting
const canProceed = await this.checkRateLimit(dataSource);
if (!canProceed) {
    throw new Error(`Rate limit exceeded for ${dataSource}`);
}
```

#### Data Quality Validation
```typescript
// Comprehensive validation
const validation = await dataQualityValidator.validateData(scrapedData);
if (!validation.isValid) {
    console.log('Validation errors:', validation.errors);
}
console.log('Quality score:', validation.qualityScore);
```

#### Intelligent Job Scheduling
```typescript
// Priority-based job execution
const pendingJobs = await supabase
    .rpc('get_pending_scraping_jobs', { limit_param: maxConcurrentJobs })
    .order('priority', { ascending: false });
```

## 🎨 **User Interface**

### Web Scraping Dashboard (`src/components/WebScrapingDashboard.tsx`)

#### Key Features
- **Real-time Monitoring**: Live job status updates
- **Statistics Overview**: Success rates, completion times, data quality
- **Job Management**: Create, cancel, retry scraping operations
- **Engine Controls**: Start/stop the scraping engine
- **Data Visualization**: Charts and progress indicators

#### Dashboard Sections
1. **Statistics Cards**: Total jobs, success rate, completion time, data quality
2. **Recent Jobs**: List of recent scraping operations with status
3. **Performance Stats**: Breakdown by data source and scraper type
4. **Scraped Data**: Overview of collected data
5. **Job Creation**: Interface for creating new scraping jobs

### Visual Design
- **Status Indicators**: Color-coded job statuses with icons
- **Progress Tracking**: Real-time progress bars and completion estimates
- **Error Handling**: Clear error messages and retry options
- **Responsive Layout**: Mobile-optimized design

## 🤖 **Automation Features**

### Automated Job Creation
```typescript
// Create scraping job programmatically
const job = await scrapingApi.createScrapingJob({
    job_name: 'Company Data Collection',
    scraper_type: 'company_data',
    data_source: 'company_website',
    target_url: 'https://company.com',
    target_company_name: 'Company Name',
    priority: 8,
    configuration: {
        fields_to_scrape: ['name', 'description', 'industry'],
        verify_data: true
    }
});
```

### Intelligent Data Enhancement
```typescript
// Automatic data enhancement
await this.createEnhancements(job, companyData);

// Enhancement example
{
    company_id: 123,
    data_source: 'company_website',
    enhancement_type: 'company_info',
    data_field: 'description',
    enhanced_value: 'Enhanced company description',
    confidence_score: 0.8,
    source_url: 'https://company.com/about'
}
```

### Quality Assurance
```typescript
// Automated quality checks
const qualityResult = await dataQualityValidator.validateBatch(scrapedData);
console.log(`Valid: ${qualityResult.validCount}, Invalid: ${qualityResult.invalidCount}`);
console.log(`Average Quality: ${qualityResult.averageQuality * 100}%`);
```

## 📈 **Performance & Scalability**

### Optimization Features
- **Concurrent Processing**: Multiple jobs running simultaneously
- **Intelligent Queuing**: Priority-based job scheduling
- **Rate Limiting**: Respectful request patterns
- **Caching**: Robots.txt and metadata caching
- **Deduplication**: Prevents duplicate data storage

### Monitoring & Analytics
- **Real-time Statistics**: Live performance metrics
- **Success Rate Tracking**: Historical success rates by source
- **Quality Metrics**: Data quality trends and improvements
- **Error Analysis**: Detailed error tracking and resolution

## 🔒 **Security & Ethics**

### Ethical Practices
- **Robots.txt Compliance**: Automatic checking and respect for robots.txt
- **Rate Limiting**: Configurable limits to avoid overwhelming servers
- **User Agent Rotation**: Respectful identification
- **Terms of Service**: Framework for respecting platform terms

### Data Protection
- **Row Level Security**: Supabase RLS policies
- **Input Validation**: Comprehensive validation of all inputs
- **Error Handling**: Secure error handling without data leakage
- **Audit Trail**: Complete logging of all operations

## 🚀 **Usage Instructions**

### Running the Scraping System
```bash
# Start the complete scraping system
npm run scraping:run

# Run in demo mode with sample data
npm run scraping:demo

# Monitor existing jobs only
npm run scraping:monitor

# Validate existing scraped data
npm run scraping:validate
```

### Creating Scraping Jobs
```typescript
import { scrapingApi } from '@/lib/webScraping/scrapingApi';

// Create a company data scraping job
const job = await scrapingApi.createScrapingJob({
    job_name: 'Scrape Company Information',
    scraper_type: 'company_data',
    data_source: 'company_website',
    target_url: 'https://example.com',
    target_company_name: 'Example Corp',
    configuration: {
        fields_to_scrape: ['name', 'description', 'industry', 'logo_url'],
        verify_data: true
    }
});
```

### Accessing the Dashboard
- **Web Interface**: `/scraping`
- **Features**: Job monitoring, statistics, data management
- **Controls**: Engine start/stop, job creation, validation

## 📊 **Analytics & Reporting**

### Key Metrics
- **Job Success Rate**: Percentage of successfully completed jobs
- **Average Completion Time**: Time from start to completion
- **Data Quality Score**: Average quality of scraped data
- **Source Performance**: Success rates by data source

### Reporting Features
- **Automated Reports**: JSON reports with comprehensive statistics
- **Real-time Dashboard**: Live monitoring interface
- **Historical Trends**: Performance tracking over time
- **Error Analysis**: Detailed error categorization and resolution

## 🔄 **Future Enhancements**

### Planned Features
1. **Machine Learning**: Advanced pattern recognition for data extraction
2. **API Integrations**: Official API connections where available
3. **Advanced Scheduling**: Cron-like job scheduling
4. **Data Pipelines**: ETL pipelines for data transformation
5. **Webhook Support**: Real-time notifications and integrations

### Scalability Improvements
1. **Distributed Processing**: Multi-node scraping clusters
2. **Cloud Integration**: AWS/GCP integration for scaling
3. **Advanced Caching**: Redis integration for performance
4. **Database Optimization**: Horizontal scaling strategies

The web scraping infrastructure provides a comprehensive, ethical, and scalable solution for automated data collection, maintaining the platform's zero-cost operational strategy while delivering powerful automation capabilities.
