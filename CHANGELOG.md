# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Company news integration with external API
- Background check functionality
- Bundle analysis support with @next/bundle-analyzer
- Firebase authentication integration
- Remote patterns for image optimization

### Changed
- Upgraded to Next.js 14.2.23
- Migrated from Supabase Auth to Firebase Auth
- Updated image configuration to use remotePatterns
- Improved development build performance with webpack caching
- Enhanced type checking and ESLint validation during builds

### Fixed
- Image loading issues with Google authentication
- Static asset 404 errors in development
- Punycode deprecation warnings
- Build configuration for better type safety

### Security
- Enabled strict TypeScript checks
- Implemented proper CORS policies
- Added security headers
- Updated dependencies to latest secure versions

## [1.0.0] - 2024-01-19

### Added
- Initial release with core features
- Company review system
- Rating visualization
- User authentication
- Admin dashboard
- Company profiles
- Review management
- Real-time updates via Supabase

### Security
- Secure data handling
- Input validation
- Rate limiting
- Role-based access control

## [1.1.0] - 2024-01-08

### Changed
- Removed Benefits and Values columns from company display
- Enhanced CompanyCard component with:
  - Visual rating progress bar with color indicators
  - Company size badge
  - Verification status badge
  - Improved rating display
- Updated ReviewForm:
  - Removed general review content field
  - Added separate pros and cons fields with character counters
  - Auto-generated review titles from pros/cons
  - Enhanced position field with suggestions
  - Improved visual feedback and validation

## [0.1.0] - 2024-01-05

### Added
- Initial project setup
- Basic repository structure
- Core documentation files 