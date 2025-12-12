# Contributing to OverDue Dashboard

Thank you for your interest in contributing to OverDue Dashboard! This document outlines the guidelines and best practices for contributing to this project.

## 🚀 Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `npm install`
3. **Create a branch** for your feature: `git checkout -b feature/your-feature-name`
4. **Make your changes** following the guidelines below
5. **Test your changes**: `npm run build` and `npm run dev`
6. **Commit and push** your changes
7. **Open a pull request** with a clear description

## 📝 Commit Guidelines

We follow conventional commit messages for better changelog generation and release management.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without functionality changes
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (build process, dependency updates, etc.)

### Examples
```
feat(dashboard): add task completion tracking
fix(auth): resolve login token expiration issue
docs(readme): update installation instructions
chore(deps): update Material-UI to v5.14.0
```

## 🏗️ Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `chore/description` - Maintenance tasks
- `docs/description` - Documentation updates

Examples:
- `feature/cognito-authentication`
- `fix/navbar-responsive-layout`
- `chore/dependency-updates`

## 🧪 Code Standards

### JavaScript/React
- Use functional components with hooks
- Follow existing code formatting and patterns
- Add PropTypes for component props
- Use meaningful variable and function names
- Add comments for complex logic

### File Organization
- Components in `src/components/`
- Pages/Layouts in `src/layouts/`
- Utilities in `src/utils/`
- Theme-related files in `src/assets/theme/`

### Styling
- Use Material-UI's `sx` prop for component styling
- Follow the existing theme structure
- Ensure responsive design across breakpoints
- Test on mobile and desktop viewports

## 🧹 Code Quality

Before submitting a PR, ensure:

- [ ] Code builds without errors: `npm run build`
- [ ] Code passes linting: `npm run lint`
- [ ] All existing tests pass: `npm run test`
- [ ] New features include appropriate tests
- [ ] Documentation is updated if needed

## 📋 Pull Request Process

1. **Ensure your branch is up to date** with the main branch
2. **Write a clear PR description** including:
   - What changes you made
   - Why you made them
   - Any breaking changes
   - Screenshots for UI changes
3. **Link relevant issues** using keywords like "Fixes #123"
4. **Request review** from maintainers
5. **Address feedback** and update your branch as needed

## 🐛 Reporting Bugs

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Environment details** (OS, browser, Node version)
- **Screenshots** if applicable
- **Console errors** if any

## 💡 Feature Requests

For feature requests:

- **Check existing issues** to avoid duplicates
- **Describe the use case** clearly
- **Explain the expected behavior**
- **Consider implementation complexity**
- **Provide mockups or examples** if applicable

## 🎯 Development Priorities

Current focus areas (in order of priority):

1. **Authentication System** - AWS Cognito integration
2. **Core Features** - Task management, grade tracking, notes
3. **User Experience** - UI/UX improvements, responsive design
4. **Performance** - Optimization and loading improvements
5. **Testing** - Unit tests and integration tests
6. **Documentation** - API docs, component documentation

## 📚 Resources

- [React Documentation](https://reactjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ❓ Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Create a new issue with the "question" label
3. Be specific about what you need help with

---

Thank you for contributing to OverDue Dashboard! 🎉