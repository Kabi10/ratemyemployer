# RateMyEmployer

A platform for sharing and discovering authentic workplace experiences. Help others make informed career decisions by sharing your experiences.

## Features

- Company reviews with pros and cons
- Visual rating indicators with color-coded progress bars
- Detailed company profiles with size and verification status
- Advanced search and filter capabilities
- Secure user authentication
- Responsive design with dark mode support
- Real-time updates
- Data validation and sanitization
- Role-based access control

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Shadcn UI
- SWR for data fetching
- Zod for validation
- Vitest for testing

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Testing

We use Vitest for unit and integration tests, and Playwright for E2E testing.

```bash
# Run unit and integration tests
npm test

# Run E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
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

## Key Components

- `CompanyCard`: Displays company information with visual rating indicators
- `ReviewForm`: Structured review submission with pros and cons
- `ReviewList`: List of reviews with filtering and sorting
- `CompanyProfile`: Detailed company information and statistics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 