# Database Population Automation Guide

## 🎯 **Overview**

This guide documents the comprehensive database population automation system for RateMyEmployer, providing multiple approaches to automatically add companies to the database using free data sources and user-driven methods.

## 🏗️ **Architecture**

The database population system consists of four main components:

1. **Free Data Source Integration** - Automated imports from public datasets
2. **User Suggestion System** - Community-driven company additions
3. **Admin Bulk Import Tools** - Administrative batch operations
4. **Background Automation** - Scheduled population jobs

## 📊 **Data Sources**

### 1. **Fortune 500 Companies**
- **Source**: Public Fortune 500 list
- **Count**: 10+ sample companies (expandable)
- **Data Quality**: High (verified information)
- **Update Frequency**: Manual/scheduled
- **Cost**: Free

### 2. **Tech Startups**
- **Source**: Curated list of popular tech companies
- **Count**: 8+ sample companies (expandable)
- **Data Quality**: High (current information)
- **Update Frequency**: Manual/scheduled
- **Cost**: Free

### 3. **OpenStreetMap Integration**
- **Source**: Nominatim API (OpenStreetMap)
- **Method**: Location-based company search
- **Rate Limits**: Respectful self-limiting
- **Cost**: Free

### 4. **User Suggestions**
- **Source**: Community submissions
- **Workflow**: Submit → Review → Approve
- **Quality Control**: Admin moderation
- **Cost**: Free

### 5. **CSV Bulk Import**
- **Source**: Admin-uploaded data files
- **Format**: Standard CSV with defined columns
- **Validation**: Automatic data validation
- **Cost**: Free

## 🛠️ **Technical Implementation**

### Core Files Structure
```
src/lib/companyDataSources.ts          # Data source integrations
src/components/CompanySuggestionSystem.tsx  # User suggestion UI
src/components/AdminBulkImport.tsx     # Admin bulk operations
scripts/populate-database-automation.ts     # Automation script
supabase/migrations/20250109_company_suggestions.sql  # Database schema
```

### Database Schema

#### Companies Table (Existing)
```sql
CREATE TABLE companies (
  id bigint PRIMARY KEY,
  name varchar(100) NOT NULL,
  industry varchar(50),
  location varchar(150),
  website varchar(2048),
  description text,
  size varchar(20),
  verified boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

#### Company Suggestions Table (New)
```sql
CREATE TABLE company_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  industry varchar(50),
  location varchar(150),
  website varchar(2048),
  description text,
  size varchar(20),
  suggested_by uuid REFERENCES auth.users(id),
  status varchar(20) DEFAULT 'pending',
  admin_notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

## 🚀 **Usage Instructions**

### 1. **Automated Script Execution**

```bash
# Install dependencies
npm install -g tsx

# Run full automation
tsx scripts/populate-database-automation.ts

# Dry run (preview only)
tsx scripts/populate-database-automation.ts --dry-run

# Verbose logging
tsx scripts/populate-database-automation.ts --verbose

# Help
tsx scripts/populate-database-automation.ts --help
```

### 2. **Manual Population Methods**

#### Fortune 500 Companies
```typescript
import { populateFortune500Companies } from '@/lib/companyDataSources';

const result = await populateFortune500Companies();
console.log(`Added: ${result.success}, Skipped: ${result.skipped}`);
```

#### Tech Startups
```typescript
import { populateTechStartups } from '@/lib/companyDataSources';

const result = await populateTechStartups();
console.log(`Added: ${result.success}, Skipped: ${result.skipped}`);
```

#### CSV Import
```typescript
import { bulkImportFromCSV } from '@/lib/companyDataSources';

const csvData = `name,industry,location,website
Apple Inc.,Technology,Cupertino CA,https://apple.com
Microsoft,Technology,Redmond WA,https://microsoft.com`;

const result = await bulkImportFromCSV(csvData);
```

### 3. **User Suggestion Workflow**

1. **User Submits Suggestion**
   - Fills out company form
   - Suggestion saved with 'pending' status
   - User can view their own suggestions

2. **Admin Reviews Suggestion**
   - Views all pending suggestions
   - Can approve or reject with notes
   - Approved suggestions become companies

3. **Automatic Company Creation**
   - Approved suggestions create company records
   - Suggestion status updated to 'approved'
   - Original suggester notified (future feature)

## 📋 **CSV Import Format**

### Required Columns
- `name` - Company name (required)

### Optional Columns
- `industry` - Industry category
- `location` - Company location
- `website` - Company website URL
- `description` - Company description
- `size` - Company size (1-50, 50-200, 200-1000, 1000+)

### Example CSV
```csv
name,industry,location,website,description,size
Apple Inc.,Technology,Cupertino CA,https://apple.com,Technology company,1000+
Microsoft Corporation,Technology,Redmond WA,https://microsoft.com,Software company,1000+
Stripe,Technology,San Francisco CA,https://stripe.com,Payment processing,200-1000
```

## 🔧 **Configuration**

### Environment Variables
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional (for enhanced features)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Data Validation Rules
- **Company Name**: 2-100 characters, unique
- **Industry**: Must match predefined enum values
- **Location**: 1-150 characters
- **Website**: Valid URL format (optional)
- **Size**: Must match predefined size categories

## 📈 **Performance Considerations**

### Rate Limiting
- **OpenStreetMap**: 2-second delays between requests
- **Database Inserts**: 50-100ms delays between operations
- **Batch Processing**: 10-20 companies per batch

### Deduplication
- **Name-based**: Case-insensitive company name matching
- **Database Constraints**: Unique constraints prevent duplicates
- **Pre-check**: Existence verification before insertion

### Error Handling
- **Graceful Degradation**: Continues processing on individual failures
- **Detailed Logging**: Comprehensive error reporting
- **Rollback Safety**: No partial state corruption

## 📊 **Monitoring & Reporting**

### Automation Reports
```json
{
  "timestamp": "2024-01-09T10:00:00Z",
  "stats": [
    {
      "source": "Fortune 500",
      "success": 8,
      "skipped": 2,
      "errors": 0,
      "duration": 5000
    }
  ],
  "totals": {
    "success": 15,
    "skipped": 5,
    "errors": 1,
    "duration": 12000
  }
}
```

### Database Statistics
- **Total Companies**: Real-time count
- **Recent Additions**: Last 24 hours
- **Source Breakdown**: Companies by data source
- **Verification Status**: Verified vs unverified

## 🔒 **Security & Permissions**

### Row Level Security (RLS)
- **Company Suggestions**: Users can only view/edit their own
- **Admin Access**: Special permissions for bulk operations
- **Public Data**: Companies are publicly readable

### Data Privacy
- **No Personal Data**: Only public company information
- **User Attribution**: Suggestion tracking for credit
- **Audit Trail**: Complete operation logging

## 🚀 **Future Enhancements**

### Planned Features
1. **API Integrations**: LinkedIn Company API, Crunchbase API
2. **Smart Deduplication**: ML-based company matching
3. **Auto-verification**: Automated company verification
4. **Real-time Sync**: Live data source monitoring
5. **User Notifications**: Suggestion status updates

### Scalability Improvements
1. **Background Jobs**: Supabase Edge Functions
2. **Caching Layer**: Redis for frequent queries
3. **Batch Processing**: Larger batch sizes
4. **Parallel Processing**: Concurrent data source fetching

## 📞 **Support & Troubleshooting**

### Common Issues
1. **Duplicate Companies**: Check name variations and case sensitivity
2. **Rate Limiting**: Increase delays between API calls
3. **Permission Errors**: Verify Supabase service role key
4. **CSV Format**: Ensure proper column headers and encoding

### Debug Commands
```bash
# Check database connection
tsx scripts/test-connection.ts

# Validate CSV format
tsx scripts/validate-csv.ts data/companies.csv

# Manual company lookup
tsx scripts/check-company.ts "Apple Inc."
```

The database population system provides a comprehensive, scalable solution for automatically growing the company database while maintaining data quality and user engagement.
