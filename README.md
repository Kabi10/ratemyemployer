# Rate My Employer

A platform for employees to share their experiences and rate their employers. Built with Next.js, TypeScript, and Supabase.

## Features

- 🔐 Secure authentication with Supabase Auth
- 📝 Create, read, update, and delete company reviews
- 🌟 Rate companies on various metrics
- 📊 View company statistics and analytics
- 🔍 Search and filter companies
- 📱 Responsive design for all devices
- 🎨 Modern UI with Tailwind CSS and shadcn/ui

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions
- **Linting**: ESLint, Prettier
- **Type Checking**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kabi10/ratemyemployer.git
   cd ratemyemployer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@YourTwitter](https://twitter.com/YourTwitter)

Project Link: [https://github.com/Kabi10/ratemyemployer](https://github.com/Kabi10/ratemyemployer)

## Deployment

This project is automatically deployed to Vercel through GitHub Actions. The deployment process includes:

- Automatic deployments on push to `develop` or `main` branches
- Running tests and linting before deployment
- Performance checks with Lighthouse
- Automatic environment variable management

Live site: [ratemyemployer.life](https://ratemyemployer.life) 