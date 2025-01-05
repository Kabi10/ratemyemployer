# Form Validation Guide

## Overview
This guide explains the form validation system used in the RateMyEmployer application. We use Zod for type-safe schema validation with consistent error messages.

## Usage

### Basic Validation
```typescript
import { validateForm, reviewSchema } from '@/lib/schemas';

const handleSubmit = async (formData: unknown) => {
  const result = await validateForm(reviewSchema, formData);
  
  if (result.success) {
    // TypeScript knows this is valid ReviewFormData
    const validData = result.data;
    // Process the valid data...
  } else {
    // Handle validation errors
    const errors = result.errors;
  }
};
```

### Error Messages
All error messages are centralized in the `ERROR_MESSAGES` constant for consistency. Common validations include:

- Required fields
- Email format
- URL format
- Minimum/maximum length
- Enum values
- Rating range (1-5)

### Best Practices

1. Always trim string inputs using `.trim()`
2. Use enum validation for fixed-choice fields
3. Provide clear, user-friendly error messages
4. Handle both sync and async validation
5. Type-check your form data using the exported types

### Available Schemas

#### Review Schema
- `title`: 2-100 characters
- `content`: 10-2000 characters
- `rating`: 1-5 number
- `pros`: Optional, max 500 characters
- `cons`: Optional, max 500 characters
- `position`: 2-100 characters
- `employment_status`: Enum of employment types
- Other optional fields: `reviewer_name`, `reviewer_email`

#### Company Schema
- `name`: 2-100 characters
- `description`: 10-1000 characters
- `industry`: Valid industry from list
- `location`: 2-100 characters
- Optional fields: `website`, `size`, `logo_url`

## Error Handling Example
```typescript
try {
  const result = await validateForm(companySchema, formData);
  if (!result.success) {
    // Format errors for display
    const formattedErrors = result.errors?.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    // Update your UI with formattedErrors
  }
} catch (error) {
  console.error('Unexpected validation error:', error);
}
``` 