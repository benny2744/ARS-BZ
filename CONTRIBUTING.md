
# Contributing to Audience Response System

Thank you for your interest in contributing to the Audience Response System! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Development Setup

1. **Fork the repository** and clone your fork:
   ```bash
   git clone https://github.com/your-username/ARS-BZ.git
   cd ARS-BZ
   ```

2. **Set up the development environment**:
   ```bash
   cd app
   yarn install
   ```

3. **Configure your environment**:
   - Copy `.env.example` to `.env`
   - Set up your local PostgreSQL database
   - Update database connection string

4. **Initialize the database**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development server**:
   ```bash
   yarn dev
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: We use TypeScript throughout the project
- **Formatting**: Use Prettier for consistent code formatting
- **Linting**: Follow ESLint rules configured in the project
- **Components**: Use functional components with React hooks

### Naming Conventions

- **Files**: Use kebab-case for file names (`user-dashboard.tsx`)
- **Components**: Use PascalCase for React components (`UserDashboard`)
- **Variables**: Use camelCase for variables (`sessionData`)
- **Constants**: Use UPPER_SNAKE_CASE for constants (`API_BASE_URL`)

### Component Structure

```typescript
// Import external libraries first
import React from 'react'
import { NextPage } from 'next'

// Import internal components and utilities
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/use-session'

// Type definitions
interface ComponentProps {
  title: string
  isActive?: boolean
}

// Component implementation
export const ComponentName: React.FC<ComponentProps> = ({ 
  title, 
  isActive = false 
}) => {
  // Hooks and state
  const session = useSession()
  
  // Event handlers
  const handleClick = () => {
    // Implementation
  }
  
  // Render
  return (
    <div className="component-container">
      {/* Component JSX */}
    </div>
  )
}
```

### Database Schema Changes

When modifying the database schema:

1. **Create a new migration**:
   ```bash
   npx prisma migrate dev --name descriptive-migration-name
   ```

2. **Update seed data** if necessary in `prisma/seed.ts`

3. **Update TypeScript types** to reflect schema changes

4. **Test migration** on a fresh database

## 🔄 Contribution Workflow

### 1. Choose an Issue

- Check existing issues or create a new one
- Comment on the issue to let others know you're working on it
- For major features, discuss the approach before implementation

### 2. Create a Feature Branch

```bash
git checkout -b feature/descriptive-feature-name
```

Branch naming conventions:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation changes
- `refactor/` for code refactoring

### 3. Make Your Changes

- Write clean, well-documented code
- Add tests for new functionality
- Update documentation if needed
- Ensure all existing tests pass

### 4. Test Your Changes

```bash
# Run linting
yarn lint

# Run type checking
yarn type-check

# Test the application
yarn dev
```

### 5. Commit Your Changes

Use conventional commit messages:

```bash
# Format: type(scope): description
git commit -m "feat(admin): add bulk question import"
git commit -m "fix(auth): resolve session timeout issue"
git commit -m "docs(readme): update installation instructions"
```

Common commit types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code formatting changes
- `refactor`: Code restructuring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 6. Submit a Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a pull request** on GitHub with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Testing instructions

## 🧪 Testing Guidelines

### Unit Tests
- Write tests for utility functions
- Test React components with React Testing Library
- Aim for good test coverage

### Integration Tests
- Test API routes
- Test database interactions
- Test authentication flows

### Manual Testing
- Test on different devices and screen sizes
- Verify real-time functionality
- Test file upload features
- Check accessibility

## 📝 Documentation

When contributing, please update:

- **Code comments** for complex logic
- **README.md** for setup or usage changes
- **API documentation** for new endpoints
- **Component documentation** for new UI components

## 🐛 Bug Reports

When reporting bugs, include:

1. **Environment details**:
   - Operating System
   - Node.js version
   - Browser (if applicable)

2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots or error messages**

## 💡 Feature Requests

For feature requests:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** the feature would solve
3. **Provide implementation ideas** if you have them
4. **Consider the scope** and complexity

## 🔍 Code Review Process

All contributions go through code review:

1. **Automated checks** must pass (linting, type checking)
2. **Manual review** by maintainers
3. **Testing** of functionality
4. **Documentation** review

Review criteria:
- Code quality and readability
- Performance considerations
- Security implications
- Compatibility with existing features
- Test coverage

## ❓ Getting Help

If you need help:

1. **Check the documentation** first
2. **Search existing issues** for similar problems
3. **Create a new issue** with detailed information
4. **Join discussions** in existing issues

## 📜 Code of Conduct

This project follows a Code of Conduct. Please be respectful and inclusive in all interactions.

## 🙏 Recognition

Contributors are recognized in:
- README.md acknowledgments
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to make the Audience Response System better for everyone! 🎉
