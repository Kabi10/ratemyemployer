# RateMyEmployer

A platform for sharing and discovering authentic workplace experiences. Help others make informed career decisions by sharing your experiences.

## Features

- Company reviews with pros and cons
- Visual rating indicators with color-coded progress bars
- Detailed company profiles with size and industry information
- Advanced search and filter capabilities
- Secure user authentication with Supabase
- Responsive design with dark mode support
- Real-time updates via Supabase
- Data validation and sanitization
- Role-based access control
- Company news integration

## Tech Stack

- Next.js 15.1
- TypeScript 5.3
- Tailwind CSS
- Supabase (PostgreSQL + Real-time)
- Shadcn UI Components
- Framer Motion
- React Hook Form
- Zod for validation
- Playwright for E2E testing

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Supabase account
- Google Maps API key (optional)

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: (Optional) For location features

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run E2E tests
npx playwright test

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
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

tests/
├── e2e/            # End-to-end tests
├── fixtures/       # Test data
└── utils/          # Test utilities
```

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
- Uses SerpAPI to gather relevant news articles
- Stores results in the database for quick access

### Required Repository Secrets

To enable the news fetching workflow, add these secrets to your GitHub repository:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `SERP_API_KEY`: Your SerpAPI key

### Manual Trigger

You can manually trigger the news fetch workflow:

1. Go to the "Actions" tab in your repository
2. Select "Fetch Company News" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"
