# Contributing to Rate My Employer

First off, thank you for considering contributing to Rate My Employer! It's people like you that make Rate My Employer such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the JavaScript/TypeScript styleguide
* Include screenshots in your pull request whenever possible
* End all files with a newline
* Avoid platform-dependent code

## Development Process

1. Fork the repo and create your branch from `develop`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

### Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

### Code Style

* Use TypeScript for all new code
* Follow the existing code style
* Use meaningful variable names
* Comment your code when necessary
* Keep functions small and focused
* Use async/await instead of promises
* Use ES6+ features when possible

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### Testing

* Write tests for all new features
* Update tests when you change existing functionality
* Run the entire test suite before submitting a PR

## Project Structure

```
src/
├── app/           # Next.js app router pages
├── components/    # React components
├── hooks/         # Custom React hooks
├── lib/          # Utility functions and configurations
├── types/        # TypeScript type definitions
└── styles/       # Global styles and Tailwind config
```

## Additional Notes

### Git Workflow

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: add some feature"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat:` - A new feature
* `fix:` - A bug fix
* `docs:` - Documentation only changes
* `style:` - Changes that do not affect the meaning of the code
* `refactor:` - A code change that neither fixes a bug nor adds a feature
* `perf:` - A code change that improves performance
* `test:` - Adding missing tests or correcting existing tests
* `chore:` - Changes to the build process or auxiliary tools

## Questions?

Feel free to open an issue with your question or contact the maintainers directly. 