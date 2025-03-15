# RateMyEmployer MCP Stored Procedures

This document describes the stored procedures available for use with the Model Context Protocol (MCP) in the RateMyEmployer application.

## Available Procedures

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

### get_top_companies_by_industry

**Description:** Function to get recent reviews for a company

**Parameters:** industry_name TEXT

**Returns:** TABLE

**Example:**
```sql
SELECT * FROM get_top_companies_by_industry();
```

### get_recent_reviews_for_company

**Description:** Function to search companies by name or location

**Parameters:** company_id_param INT

**Returns:** TABLE

**Example:**
```sql
SELECT * FROM get_recent_reviews_for_company();
```

### search_companies

**Description:** Function to get rating distribution

**Parameters:** search_term TEXT

**Returns:** TABLE

**Example:**
```sql
SELECT * FROM search_companies();
```

### get_rating_distribution

**Description:** Function to get companies with no reviews

**Parameters:** None

**Returns:** TABLE

**Example:**
```sql
SELECT * FROM get_rating_distribution();
```

### get_companies_with_no_reviews

**Description:** No description available

**Parameters:** None

**Returns:** TABLE

**Example:**
```sql
SELECT * FROM get_companies_with_no_reviews();
```

## Using These Procedures with MCP

When using the Model Context Protocol (MCP) with Cursor, you can reference these procedures in natural language. For example:

- "Show me the average ratings by industry"
- "Get the top companies in the Technology industry"
- "Find companies with no reviews"

The MCP will automatically translate these requests into the appropriate procedure calls.

## Manual Usage

You can also call these procedures directly in SQL:

```sql
SELECT * FROM get_average_ratings_by_industry();
```

Or in your application code:

```typescript
const { data, error } = await supabase.rpc('get_average_ratings_by_industry');
```
