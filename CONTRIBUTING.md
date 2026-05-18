# Contributing to Code Review Assistant

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/code-review-assistant.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes: `npm test`
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your credentials to .env
# Then test the setup
npm test
```

## Code Style

- Use ES6+ features
- Follow existing code formatting
- Add JSDoc comments for functions
- Keep functions focused and small
- Use meaningful variable names

## Testing

Before submitting a PR:

1. Test setup: `npm test`
2. Test with a real PR: `node src/review-pr.js <pr-number> --dry-run`
3. Verify no errors in console
4. Check the generated review makes sense

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include examples if applicable
- Update documentation if needed
- Ensure all tests pass

## Feature Ideas

We welcome contributions in these areas:

- **New Review Types**: Additional analysis patterns
- **Language Support**: Better support for specific languages
- **Integration**: Support for other platforms (GitLab, Bitbucket)
- **UI**: Web interface for managing reviews
- **Analytics**: Review statistics and insights
- **Templates**: Customizable review templates
- **Performance**: Optimization for large PRs

## Bug Reports

When reporting bugs, please include:

- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (Node version, OS)
- Error messages or logs

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.