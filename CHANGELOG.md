# Changelog

All notable changes to the RateMyEmployer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- TypeScript-based statistics module (`src/lib/statistics.ts`) as an alternative to PostgreSQL stored procedures
- Comprehensive documentation for the statistics module in `src/lib/README.md`
- Type definitions for industry and location statistics
- Company news integration with SerpAPI
- Wall of Shame feature for lowest-rated companies
- Bundle analysis support with @next/bundle-analyzer
- Playwright E2E testing setup
- Remote patterns for image optimization
- Comprehensive documentation structure

### Changed
- Updated `MCPDemoComponent` to use the new statistics functions instead of stored procedures
- Updated `WallOfCompanies` component to use the new statistics functions
- Enhanced documentation in `MCP_DOCUMENTATION.md` with migration guide from stored procedures to TypeScript
- Updated main README.md with information about the statistics module
- Upgraded to Next.js 15.1
- Enhanced Supabase Auth integration
- Updated image configuration to use remotePatterns
- Improved development build performance
- Enhanced type checking and ESLint validation
- Consolidated project documentation

### Fixed
- Resolved issues with PostgreSQL stored procedures that were using reserved keywords
- Fixed compatibility problems with different PostgreSQL versions
- Improved error handling in statistics-related components
- Removed references to non-existent size statistics in `WallOfCompanies`
- Image loading optimization
- Static asset handling
- Type definition conflicts
- Build configuration improvements
- Documentation structure

### Security
- Enhanced Supabase RLS policies
- Implemented proper CORS policies
- Added security headers
- Updated dependencies to latest versions
- Improved authentication flow

## [1.0.0] - 2023-10-15

### Added
- Initial release of RateMyEmployer
- Company reviews system with rating visualization
- User authentication with Supabase
- Company profiles with industry and location data
- Search and filter functionality
- Wall of Fame/Shame feature
- News integration for companies
- Admin dashboard for moderation
- MCP integration for natural language database queries

### Security
- Supabase RLS policies
- Input validation with Zod
- Rate limiting
- Role-based access control

## [1.1.0] - 2024-01-08

### Changed
- Enhanced CompanyCard component with:
  - Visual rating progress bars
  - Company size badges
  - Industry information
  - Improved rating display
- Updated ReviewForm:
  - Separate pros and cons fields
  - Character counters
  - Auto-generated review titles
  - Enhanced position field
  - Improved validation

## [0.1.0] - 2024-01-05

### Added
- Initial project setup
- Basic repository structure
- Core documentation files 