# Contributing to RateMyEmployer

Thank you for your interest in contributing to RateMyEmployer! This document provides guidelines and instructions for contributing to the project.

## Development Setup

### Prerequisites

- Node.js >= 18.17.0
- npm or yarn
- Git
- Supabase account
- Firebase project
- Google Maps API key (optional)

### Environment Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ratemyemployer.git
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
5. Configure your environment variables in `.env.local`

## Development Workflow

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Make your changes following our guidelines

4. Run tests:

   ```bash
   npm run test:all
   ```

5. Build and analyze:
   ```bash
   ANALYZE=true npm run build
   ```

## Code Style

- TypeScript strict mode is enabled
- ESLint rules must pass
- Prettier formatting is required
- Follow the existing code structure

### Component Guidelines

- Use TypeScript for all new code
- Implement proper error handling
- Add appropriate loading states
- Include unit tests
- Document props and functions
- Follow accessibility best practices

## Testing Requirements

All new code should include:

- Unit tests (Vitest)
- Integration tests where appropriate
- E2E tests for critical paths (Playwright)
- Type checking passes
- ESLint validation passes

## Pull Request Process

1. Update documentation
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Submit PR with detailed description

### PR Description Template

```markdown
## Description

[Describe your changes]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have updated the documentation
- [ ] I have added tests
- [ ] All tests pass
```

## Documentation

- Update README.md for new features
- Add JSDoc comments for functions
- Update API documentation
- Include usage examples
- Document breaking changes

## Version Control

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Keep commits focused and atomic
- Write clear commit messages
- Rebase feature branches on main

## Code Review

- All code must be reviewed
- Address review comments promptly
- Request reviews from relevant team members
- Be respectful and constructive

## Getting Help

- Check existing issues and documentation
- Ask in pull request comments
- Join our community discussions
- Contact maintainers directly

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `develop`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable
2. Update the documentation with any new dependencies, endpoints, or configuration changes
3. The PR will be merged once you have the sign-off of two other developers
4. Code must follow existing styling conventions
5. Add unit tests for any new code

## Any Contributions You Make Will Be Under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report Bugs Using GitHub's [Issue Tracker](https://github.com/yourusername/ratemyemployer/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/ratemyemployer/issues/new).

### Write Bug Reports with Detail, Background, and Sample Code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Use a Consistent Coding Style

- Use TypeScript for all new code
- 2 spaces for indentation rather than tabs
- Use descriptive variable names
- Comment your code when necessary
- Follow the existing code style

## Code Review Process

The core team looks at Pull Requests on a regular basis. After feedback has been given we expect responses within two weeks. After two weeks we may close the PR if it isn't showing any activity.

## Community

- Join our [Discord channel](link-to-discord)
- Follow us on [Twitter](link-to-twitter)
- Read our [Blog](link-to-blog)

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md).
