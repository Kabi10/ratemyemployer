# RateMyEmployer

A platform for sharing and discovering authentic workplace experiences. Help others make informed career decisions by sharing your experiences.

## Features

- Company reviews with pros and cons
- Visual rating indicators with color-coded progress bars
- Detailed company profiles with size and verification status
- Advanced search and filter capabilities
- Secure user authentication with Firebase
- Responsive design with dark mode support
- Real-time updates via Supabase
- Data validation and sanitization
- Role-based access control
- Company news integration
- Background checks

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Real-time)
- Firebase Authentication
- Shadcn UI Components
- Framer Motion
- SWR for data fetching
- Zod for validation
- Vitest for testing
- Playwright for E2E testing

## Prerequisites

- Node.js >= 18.17.0
- npm or yarn
- Supabase account
- Firebase project
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
- `NEXT_PUBLIC_FIREBASE_*`: Firebase configuration
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: (Optional) For location features

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Analyze bundle
ANALYZE=true npm run build
```

## Project Structure

```
src/
├── app/             # Next.js app router pages
├── components/      # React components
├── contexts/        # React contexts
├── hooks/          # Custom hooks
├── lib/            # Utilities and configurations
├── types/          # TypeScript types
└── __tests__/      # Test files
```

## Testing

We use multiple testing strategies:
- Unit/Integration tests with Vitest
- End-to-end tests with Playwright
- Type checking with TypeScript
- Linting with ESLint

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm test
npm run test:e2e
npm run test:e2e:ui
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

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

For support, please open an issue in the repository. 