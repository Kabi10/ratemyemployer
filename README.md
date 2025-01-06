# RateMyEmployer

A platform for sharing and discovering authentic workplace experiences.

## Features

- Company reviews and ratings
- Detailed company profiles
- Search and filter companies
- User authentication
- Dark mode support

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- Shadcn UI

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Testing

We use Vitest for testing. The test suite focuses on essential MVP features:

- UI Component rendering
- Basic functionality
- User interactions

Run tests with:
```bash
npm test
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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 