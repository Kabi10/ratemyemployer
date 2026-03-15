# 🔗 RateMyEmployer API Documentation

A comprehensive guide to the RateMyEmployer REST API endpoints.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Companies API](#companies-api)
- [Reviews API](#reviews-api)
- [Error Handling](#error-handling)
- [Response Formats](#response-formats)

## 🔐 Authentication

Most endpoints require authentication using Supabase Auth. Include the session cookies in your requests.

**Required Headers:**
```
Cookie: sb-access-token=<token>; sb-refresh-token=<refresh-token>
Content-Type: application/json
```

## ⚡ Rate Limiting

- **Review Creation:** 5 reviews per user per day
- **Duplicate Prevention:** 1 review per company per user every 24 hours
- **General API:** 100 requests per minute per IP

## 🏢 Companies API

### GET /api/companies

Retrieve companies with optional filtering.

**Query Parameters:**
- `search` (string): Filter by company name (case-insensitive partial match)
- `industry` (string): Filter by exact industry match
- `minRating` (number): Filter companies with rating >= value

**Example Request:**
```bash
GET /api/companies?search=tech&industry=Technology&minRating=3.5
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "TechCorp Inc",
    "industry": "Technology",
    "location": "San Francisco, CA",
    "average_rating": 4.2,
    "total_reviews": 25,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-02-01T14:20:00Z"
  }
]
```

### GET /api/companies/[id]

Retrieve a specific company by ID.

**Path Parameters:**
- `id` (number): Company ID

**Example Request:**
```bash
GET /api/companies/123
```

**Response:**
```json
{
  "id": 123,
  "name": "Example Company",
  "industry": "Technology",
  "location": "New York, NY",
  "average_rating": 3.8,
  "total_reviews": 42,
  "website": "https://example.com",
  "description": "Leading technology company...",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-02-01T14:20:00Z"
}
```

**Error Response:**
```json
{
  "error": "Company not found"
}
```

### PUT /api/companies/[id]

Update a company's information. **Requires Authentication.**

**Path Parameters:**
- `id` (number): Company ID

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "industry": "Updated Industry",
  "location": "Updated Location",
  "website": "https://updated-website.com",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": 123,
  "name": "Updated Company Name",
  "industry": "Updated Industry",
  "location": "Updated Location",
  "website": "https://updated-website.com",
  "description": "Updated description",
  "updated_at": "2024-02-04T15:45:00Z"
}
```

### DELETE /api/companies/[id]

Delete a company. **Requires Authentication & Admin Privileges.**

**Path Parameters:**
- `id` (number): Company ID

**Response:**
- Status: `204 No Content`

## 📝 Reviews API

### GET /api/reviews

Retrieve reviews with pagination and optional company filtering.

**Query Parameters:**
- `companyId` (number): Filter reviews by company ID
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 10, max: 50)

**Example Request:**
```bash
GET /api/reviews?companyId=123&page=1&limit=10
```

**Response:**
```json
{
  "reviews": [
    {
      "id": 456,
      "company_id": 123,
      "reviewer_id": "user-uuid",
      "rating": 4,
      "title": "Great place to work",
      "pros": "Excellent work-life balance, good benefits",
      "cons": "Limited growth opportunities",
      "advice_to_management": "Consider more promotion paths",
      "job_title": "Software Engineer",
      "employment_status": "current",
      "work_life_balance": 4,
      "compensation": 4,
      "culture": 5,
      "management": 3,
      "career_opportunities": 2,
      "status": "approved",
      "created_at": "2024-02-01T12:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

### POST /api/reviews

Create a new review. **Requires Authentication.**

**Request Body:**
```json
{
  "company_id": 123,
  "rating": 4,
  "title": "Great workplace culture",
  "pros": "Flexible hours, good benefits",
  "cons": "High workload sometimes",
  "advice_to_management": "Keep up the good work",
  "job_title": "Software Engineer",
  "employment_status": "current",
  "work_life_balance": 4,
  "compensation": 4,
  "culture": 5,
  "management": 4,
  "career_opportunities": 3,
  "anonymous": false
}
```

**Validation Rules:**
- `rating`: 1-5 (required)
- `title`: 10-100 characters (required)
- `pros`: 10-1000 characters (required)
- `cons`: 10-1000 characters (required)
- `job_title`: 2-100 characters (required)
- `employment_status`: "current", "former" (required)
- Individual ratings: 1-5 (optional)
- `anonymous`: boolean (default: false)

**Response:**
```json
{
  "id": 789,
  "company_id": 123,
  "reviewer_id": "user-uuid",
  "rating": 4,
  "title": "Great workplace culture",
  "status": "pending",
  "created_at": "2024-02-04T15:30:00Z"
}
```

**Error Responses:**

Rate Limit Exceeded (429):
```json
{
  "error": "Rate limit exceeded",
  "message": "You have reached your daily review limit. Please try again tomorrow."
}
```

Duplicate Review (409):
```json
{
  "error": "Duplicate review",
  "message": "You can only post one review per company every 24 hours."
}
```

Validation Error (400):
```json
{
  "error": "Validation error",
  "message": [
    {
      "field": "title",
      "message": "Title must be at least 10 characters"
    }
  ]
}
```

### DELETE /api/reviews

Delete a review. **Requires Authentication & Ownership.**

**Request Body:**
```json
{
  "id": 789
}
```

**Response:**
- Status: `204 No Content`

### GET /api/companies/[id]/reviews

Get all reviews for a specific company.

**Path Parameters:**
- `id` (number): Company ID

**Example Request:**
```bash
GET /api/companies/123/reviews
```

**Response:**
```json
[
  {
    "id": 456,
    "company_id": 123,
    "rating": 4,
    "title": "Great place to work",
    "pros": "Good benefits and culture",
    "cons": "Long hours sometimes",
    "job_title": "Software Engineer",
    "employment_status": "current",
    "created_at": "2024-02-01T12:00:00Z"
  }
]
```

### POST /api/companies/[id]/reviews

Create a review for a specific company. **Requires Authentication.**

**Path Parameters:**
- `id` (number): Company ID

**Request Body:**
```json
{
  "rating": 4,
  "title": "Excellent workplace",
  "pros": "Great team and benefits",
  "cons": "Could improve remote work options",
  "job_title": "Product Manager",
  "employment_status": "current"
}
```

**Response:**
```json
{
  "id": 790,
  "company_id": 123,
  "rating": 4,
  "title": "Excellent workplace",
  "created_at": "2024-02-04T16:00:00Z"
}
```

## ❌ Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "Error Type",
  "message": "Detailed error description"
}
```

### Common Error Messages

**Authentication Errors:**
```json
{
  "error": "Unauthorized",
  "message": "Please log in to access this resource"
}
```

**Rate Limiting:**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later."
}
```

**Validation Errors:**
```json
{
  "error": "Validation error",
  "message": [
    {
      "field": "rating",
      "message": "Rating must be between 1 and 5"
    }
  ]
}
```

## 📊 Response Formats

### Pagination Response

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### Company Object

```json
{
  "id": 123,
  "name": "Company Name",
  "industry": "Technology",
  "location": "City, State",
  "website": "https://company.com",
  "description": "Company description",
  "average_rating": 4.2,
  "total_reviews": 25,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-02-01T14:20:00Z"
}
```

### Review Object

```json
{
  "id": 456,
  "company_id": 123,
  "reviewer_id": "user-uuid",
  "rating": 4,
  "title": "Review title",
  "pros": "Positive aspects",
  "cons": "Negative aspects",
  "advice_to_management": "Suggestions",
  "job_title": "Position title",
  "employment_status": "current|former",
  "work_life_balance": 4,
  "compensation": 4,
  "culture": 5,
  "management": 3,
  "career_opportunities": 4,
  "anonymous": false,
  "status": "pending|approved|rejected",
  "created_at": "2024-02-01T12:00:00Z",
  "updated_at": "2024-02-01T12:00:00Z"
}
```

## 🔍 Search & Filtering

### Company Search

**Text Search:**
- Case-insensitive partial matching on company names
- Use the `search` query parameter

**Industry Filter:**
- Exact match on industry field
- Common industries: "Technology", "Finance", "Healthcare", "Retail"

**Rating Filter:**
- Filter companies with minimum average rating
- Use `minRating` parameter (1-5 scale)

### Review Filtering

**By Company:**
- Use `companyId` parameter to get reviews for specific company

**Pagination:**
- Use `page` and `limit` parameters
- Maximum limit is 50 items per page

## 🚀 Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch companies
const companies = await fetch('/api/companies?search=tech&minRating=4')
  .then(res => res.json());

// Create a review
const review = await fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    company_id: 123,
    rating: 5,
    title: 'Amazing company!',
    pros: 'Great culture and benefits',
    cons: 'None really',
    job_title: 'Software Engineer',
    employment_status: 'current'
  })
}).then(res => res.json());
```

### cURL Examples

```bash
# Get companies with filters
curl -X GET "/api/companies?search=google&industry=Technology&minRating=4"

# Create a review
curl -X POST "/api/reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": 123,
    "rating": 4,
    "title": "Good workplace",
    "pros": "Flexible schedule",
    "cons": "High pressure",
    "job_title": "Developer",
    "employment_status": "current"
  }'

# Get company by ID
curl -X GET "/api/companies/123"
```

---

**Last Updated:** February 4, 2025  
**API Version:** v1  
**Base URL:** `https://ratemyemployer.life/api`
