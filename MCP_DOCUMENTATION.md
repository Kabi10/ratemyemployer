# RateMyEmployer MCP Integration

## 📑 Executive Summary

The RateMyEmployer MCP (Model Context Protocol) integration enables natural language interaction with your Supabase database through AI tools like Cursor. This integration provides:

- **Simplified Database Access**: Query your database using plain English instead of SQL
- **Enhanced Developer Experience**: Get instant insights and data without context switching
- **Powerful Analytics**: Easily analyze company ratings, review trends, and user activity
- **Streamlined Workflows**: Generate reports and extract insights with simple prompts

This integration is fully configured with custom stored procedures, a detailed schema, and sample queries to help you get started quickly.

## 📋 Table of Contents

- [Overview](#overview)
- [Components](#components)
- [Setup](#setup)
- [Usage](#usage)
- [Available Features](#available-features)
- [Sample Queries](#sample-queries)
- [Stored Procedures](#stored-procedures)
- [Using MCP in Your Code](#using-mcp-in-your-code)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)
- [Technical Details](#technical-details)
- [Form Verification Integration](#form-verification-integration)
- [🔍 Detailed Stored Procedures Reference](#detailed-stored-procedures-reference)
- [📝 Document History](#document-history)

## 🔍 Overview

The Model Context Protocol (MCP) enables AI tools to understand and interact with your application's data model. By integrating MCP with RateMyEmployer's Supabase database, you can:

- Query company data using natural language
- Analyze review trends and statistics
- Generate reports and insights
- Perform complex data operations with simple prompts

This integration uses Cursor's MCP implementation to connect directly to your Supabase database, providing a seamless experience for developers.

## 🧩 Components

### 1. Configuration Files

- **`.mcp/supabase/config.json`**: Contains the MCP server configuration for Supabase
- **`.mcp/supabase/schema.json`**: Defines the database schema for the MCP server

### 2. Setup Scripts

- **`scripts/setup-mcp.ts`**: Sets up the MCP server configuration
- **`scripts/setup-stored-procedures.ts`**: Sets up stored procedures for the MCP server
- **`scripts/mcp-database-fixes.ts`**: Fixes database schema and stored procedures for MCP

### 3. SQL Components

- **`scripts/mcp-stored-procedures.sql`**: Contains the SQL for stored procedures
- **`scripts/mcp-database-fixes.sql`**: Contains SQL fixes for the database schema

### 4. Sample Queries

- **`scripts/mcp-sample-queries.ts`**: Contains sample queries for the MCP server

### 5. UI Components

- **`src/components/MCPDemoComponent.tsx`**: React component demonstrating MCP integration
- **`src/app/mcp-demo/page.tsx`**: Demo page showcasing the MCP integration

## 🚀 Setup

### Prerequisites

- Node.js v16 or higher
- Supabase project with service role key
- Cursor IDE installed

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Installation

1. Run the MCP setup script:

```bash
npm run mcp:setup
```

This script will:
- Create necessary directories
- Generate MCP configuration
- Extract database schema
- Set up stored procedures
- Update package.json with MCP scripts

2. Install the stored procedures:

```bash
npm run mcp:setup-procedures
```

This will create and verify the SQL functions that enhance MCP's capabilities.

## 🎮 Usage

### Starting the MCP Server

Start the MCP server with:

```bash
npm run mcp:start
```

This will launch the MCP server and connect it to your Supabase database.

Alternatively, use the interactive runner:

```bash
npm run mcp:runner
```

### Using MCP in Cursor

Once the MCP server is running, you can use natural language to interact with your database in Cursor:

1. Open Cursor IDE
2. Make sure the MCP server is running
3. Type natural language queries in comments or as questions to the AI

For example:

```typescript
// Show me the top 5 highest-rated companies
```

Or ask directly:

"What are the average ratings by industry?"

### Running Sample Queries

To see examples of the types of queries you can run with MCP:

```bash
npm run mcp:sample-queries
```

This will execute several sample queries against your database and display the results.

### Demo Page

Visit the `/mcp-demo` page in your browser to see the MCP integration in action. This page demonstrates how to use MCP-generated queries in your React components.

## 🛠️ Available Features

The MCP integration provides access to the following data and operations:

### Company Data

- Company profiles and details
- Industry and location information
- Rating statistics and trends

### Review Data

- Individual reviews and ratings
- Review trends over time
- Sentiment analysis and insights

### User Data

- User profiles and activity
- Review history and patterns
- Contribution statistics

### Analytics

- Industry comparisons
- Rating distributions
- Geographical insights
- Temporal trends

## 📊 Sample Queries

Here are some examples of natural language queries you can use with MCP:

### Basic Queries

- "Show me all companies in the Technology industry"
- "Find reviews with ratings lower than 2"
- "List the top 10 highest-rated companies"

### Analytical Queries

- "What's the average rating by industry?"
- "Show me the trend of review submissions over the last 6 months"
- "Which industries have the most companies with no reviews?"

### Complex Queries

- "Find companies in the Finance industry with at least 5 reviews and an average rating above 4"
- "Show me the distribution of ratings for companies in New York"
- "Compare the average ratings of companies in the Healthcare vs Technology industries"

## 📚 Stored Procedures

The MCP integration includes several stored procedures that enhance its capabilities. However, due to potential compatibility issues with PostgreSQL versions and reserved keywords, we've also implemented a TypeScript-based statistics module as an alternative approach.

### Alternative: TypeScript Statistics Module

We've implemented a TypeScript-based statistics module in `src/lib/statistics.ts` that provides similar functionality to the stored procedures but with improved reliability and type safety. This module includes:

- **`getIndustryStatistics`**: Returns statistics grouped by industry (with reviews)
- **`getLocationStatistics`**: Returns statistics grouped by location (with reviews)
- **`getAllIndustryStatistics`**: Returns statistics for all industries (including those without reviews)
- **`getAllLocationStatistics`**: Returns statistics for all locations (including those without reviews)

These functions directly query the Supabase database and process the results in JavaScript, providing a more reliable alternative to stored procedures. They are used in the `MCPDemoComponent` and `WallOfCompanies` components.

### `get_average_ratings_by_industry`

Returns the average ratings for companies grouped by industry.

**Parameters**: None

**Returns**: Table with columns `industry` and `average_rating`

**Example**:
```sql
SELECT * FROM get_average_ratings_by_industry();
```

**Note**: This stored procedure has been replaced by the `getIndustryStatistics` function in the TypeScript statistics module.

### `get_review_submission_trends`

Returns the count of reviews submitted per month.

**Parameters**: None

**Returns**: Table with columns `month` and `review_count`

**Example**:
```sql
SELECT * FROM get_review_submission_trends();
```

### `get_top_companies_by_industry`

Returns the top-rated companies in a specific industry.

**Parameters**:
- `p_industry` (text): The industry to filter by
- `p_limit` (integer): Maximum number of companies to return

**Returns**: Table with company details and average ratings

**Example**:
```sql
SELECT * FROM get_top_companies_by_industry('Technology', 5);
```

### `get_recent_reviews_for_company`

Returns the most recent reviews for a specific company.

**Parameters**:
- `p_company_id` (integer): The ID of the company
- `p_limit` (integer): Maximum number of reviews to return

**Returns**: Table with review details

**Example**:
```sql
SELECT * FROM get_recent_reviews_for_company(123, 10);
```

### `search_companies`

Searches for companies by name or location.

**Parameters**:
- `p_search_term` (text): The search term to look for
- `p_limit` (integer): Maximum number of companies to return

**Returns**: Table with company details

**Example**:
```sql
SELECT * FROM search_companies('tech', 20);
```

### `get_rating_distribution`

Returns the distribution of ratings across all reviews.

**Parameters**: None

**Returns**: Table with columns `rating` and `count`

**Example**:
```sql
SELECT * FROM get_rating_distribution();
```

### `get_companies_with_no_reviews`

Returns companies that have no reviews.

**Parameters**:
- `p_limit` (integer): Maximum number of companies to return

**Returns**: Table with company details

**Example**:
```sql
SELECT * FROM get_companies_with_no_reviews(10);
```

## 💻 Using MCP in Your Code

### Example: Fetching Companies

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Create a Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch companies using a query generated by MCP
async function fetchCompanies() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
}
```

### Example: Using MCP-Generated Queries

MCP can generate complex queries based on natural language input. For example:

```typescript
// Natural language: "Show me all companies in the Technology industry with ratings above 4"
const { data, error } = await supabase
  .from('companies')
  .select('*, reviews(*)')
  .eq('industry', 'Technology')
  .gte('average_rating', 4);
```

### Example: Using Stored Procedures

```typescript
// Use a stored procedure created by MCP
const { data, error } = await supabase.rpc('get_average_ratings_by_industry');

if (error) {
  console.error('Error fetching average ratings:', error);
} else {
  console.log('Average ratings by industry:', data);
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Missing Database Columns

If you encounter errors related to missing columns like `average_rating` or `total_reviews`, you need to run the database fixes script:

```bash
npm run mcp:fix-database
```

This script will:
- Add the missing columns to the companies table
- Update the columns with calculated values based on reviews
- Create the necessary stored procedures

#### 2. Missing exec_sql Function

If you see errors like "Could not find the function public.exec_sql", run the database fixes script:

```bash
npm run mcp:fix-database
```

If that doesn't work, you'll need to execute the SQL script directly in the Supabase SQL Editor:

1. Open the Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `scripts/mcp-database-fixes.sql`
4. Execute the script

**Important Note**: Due to limitations in the Supabase JavaScript client, some operations can only be performed directly in the SQL Editor. If you encounter persistent errors with the TypeScript approach, using the SQL script directly is the recommended solution.

#### 3. Stored Procedure Errors

If stored procedures are not working correctly, try:

1. Running the database fixes script:
   ```bash
   npm run mcp:fix-database
   ```

2. Then re-run the stored procedures setup:
   ```bash
   npm run mcp:setup-procedures
   ```

3. Restart the MCP server:
   ```bash
   npm run mcp:start
   ```

### Verifying the Setup

To verify that the MCP integration is working correctly:

1. Run the sample queries:
   ```bash
   npm run mcp:sample-queries
   ```

2. Check the MCP demo page:
   ```bash
   npm run dev
   # Navigate to http://localhost:3000/mcp-demo
   ```

3. Test stored procedures directly:
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM get_average_ratings_by_industry();
   ```

### Database Schema Requirements

For the MCP integration to work correctly, the database schema must include:

1. **Companies Table**:
   - `id`: Primary key
   - `name`: Company name
   - `industry`: Industry category
   - `location`: Company location
   - `average_rating`: Average rating (calculated from reviews)
   - `total_reviews`: Total number of reviews

2. **Reviews Table**:
   - `id`: Primary key
   - `company_id`: Foreign key to companies table
   - `rating`: Numeric rating (1-5)
   - `title`: Review title
   - `pros`: Pros text
   - `cons`: Cons text
   - `created_at`: Timestamp

3. **Required Functions**:
   - `exec_sql(sql text)`: Helper function for executing dynamic SQL
   - `get_average_ratings_by_industry()`: Returns average ratings by industry
   - `get_companies_with_no_reviews()`: Returns companies with no reviews
   - `get_top_companies_by_industry(industry_name TEXT)`: Returns top companies in an industry
   - `get_recent_reviews_for_company(company_id_param INTEGER)`: Returns recent reviews for a company
   - `get_review_submission_trends()`: Returns review submission trends by month
   - `search_companies(search_term TEXT)`: Searches for companies by name, industry, or location
   - `get_rating_distribution()`: Returns the distribution of ratings

## 🔧 Advanced Configuration

### Customizing the Schema

The MCP schema is automatically generated from your database. If you need to customize it:

1. Edit the `.mcp/supabase/schema.json` file
2. Add or modify table and field descriptions
3. Restart the MCP server

### Adding Custom Procedures

To add custom stored procedures:

1. Edit the `scripts/mcp-stored-procedures.sql` file
2. Add your new procedure definitions
3. Run `npm run mcp:setup-procedures` to install them

### Integrating with Other Tools

The MCP server can be used with other AI tools that support the Model Context Protocol. Refer to the specific tool's documentation for integration instructions.

## 🔍 Technical Details

### Integration Components

The MCP integration consists of several key components:

1. **Configuration Files**:
   - `.mcp/supabase/config.json`: Main configuration for the MCP server
   - `.mcp/supabase/schema.json`: Database schema with detailed field descriptions

2. **Setup Scripts**:
   - `scripts/setup-mcp.ts`: Main setup script that configures the MCP integration
   - `scripts/setup-stored-procedures.ts`: Script to install SQL stored procedures
   - `scripts/mcp-sample-queries.ts`: Examples of queries you can run with MCP

3. **SQL Components**:
   - `scripts/mcp-stored-procedures.sql`: SQL functions that enhance query capabilities

4. **UI Components**:
   - `src/components/MCPDemoComponent.tsx`: React component demonstrating MCP integration
   - `src/app/mcp-demo/page.tsx`: Demo page showcasing the MCP integration

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run mcp:setup` | Sets up the MCP server configuration |
| `npm run mcp:start` | Starts the MCP server |
| `npm run mcp:sample-queries` | Runs sample queries against the MCP server |
| `npm run mcp:setup-procedures` | Sets up stored procedures for the MCP server |
| `npm run mcp:runner` | Launches the interactive MCP server runner |

## 📋 Form Verification Integration

The RateMyEmployer project includes comprehensive form verification and Supabase data validation tools that work alongside the MCP integration.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run verify:supabase` | Verifies data integrity in Supabase |
| `npm run verify:database` | Verifies database schema, procedures, and triggers |
| `npm run test:form-validation` | Tests form validation logic |
| `npm run test:form-submissions` | Tests form submission process |
| `npm run monitor:submissions` | Monitors form submissions in real-time |
| `npm run verify:all` | Runs all verification scripts |

### Database Schema Verification

The database verification script (`scripts/verify-database.ts`) ensures that all database components are properly configured:

1. **Critical Components**:
   - Tables: `companies`, `reviews`, `moderation_history`
   - Stored Procedures: `get_industry_statistics`, `get_location_statistics`, `get_size_statistics`
   - Enums: `review_status`, `verification_status`

2. **Optional Components**:
   - Trigger Verification: `check_trigger_and_function_status`

3. **Type Verification**:
   The script handles type mismatches between Supabase's fixed-length character varying types and TypeScript text types, ensuring compatibility despite different type definitions.

Run this verification with:
```bash
npx tsx scripts/verify-database.ts
```

### Form Validation Testing

The form validation testing tools ensure that:

1. All required fields are properly validated
2. Field-specific validations (email format, URL format, etc.) work correctly
3. Min/max length constraints are enforced
4. Numeric range constraints (ratings 1-5) are respected
5. Enum constraints (dropdown options) are validated

### Supabase Data Verification

The Supabase data verification tools check:

1. Primary keys are correctly assigned
2. Foreign key relationships are maintained
3. Timestamps (created_at, updated_at) are set correctly
4. Enum values match expected options
5. Numeric constraints are enforced
6. Text fields respect length constraints
7. Required fields are never null
8. Default values are applied correctly

### Integration with MCP

The form verification tools complement the MCP integration by ensuring data integrity. When using MCP to query your database, you can be confident that the data meets the expected validation criteria.

For more detailed information on form verification, refer to the scripts in the `scripts/` directory:

- `verify-database.ts` - Verifies database schema, stored procedures, and triggers
- `verify-supabase-data.ts` - Verifies data integrity
- `test-form-validation.ts` - Tests form validation
- `test-form-submissions.ts` - Tests form submissions
- `monitor-form-submissions.ts` - Monitors form submissions

## 🔍 Detailed Stored Procedures Reference

This section provides detailed information about all stored procedures available for use with the Model Context Protocol (MCP) in the RateMyEmployer application.

### get_average_ratings_by_industry

**Description:** Function to get review submission trends by month

**Parameters:** None

**Returns:** TABLE

**Example:**
```sql
SELECT * FROM get_average_ratings_by_industry();
```

### get_review_submission_trends

**Description:** Function to get top-rated companies in a specific industry

**Parameters:** None

**Returns:** TABLE

**Example:**
```sql
SELECT * FROM get_review_submission_trends();
```

### get_top_rated_companies_by_industry

**Description:** Function to get top-rated companies in a specific industry

**Parameters:**
- `p_industry` - Industry name (VARCHAR)
- `p_limit` - Number of companies to return (INTEGER, default 5)

**Returns:** TABLE

**Example:**
```sql
SELECT * FROM get_top_rated_companies_by_industry('Technology', 10);
```

### get_user_review_stats

**Description:** Function to get review statistics for a specific user

**Parameters:**
- `p_user_id` - User ID (UUID)

**Returns:** TABLE

**Example:**
```sql
SELECT * FROM get_user_review_stats('user-uuid-here');
```

### get_company_review_summary

**Description:** Function to get a summary of reviews for a specific company

**Parameters:**
- `p_company_id` - Company ID (INTEGER)

**Returns:** TABLE

**Example:**
```sql
SELECT * FROM get_company_review_summary(123);
```

## 📝 Document History

- **2024-03-25**: Consolidated MCP_PROCEDURES.md into this document for a single source of truth for MCP documentation. 