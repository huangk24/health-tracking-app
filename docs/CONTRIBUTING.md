# Contributing to Health Tracking App

Thank you for your interest in contributing to the Health Tracking App! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+**
- **Node.js 18+**
- **uv** (Python package manager)
- **npm** (JavaScript package manager)
- **Git**

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/health-tracking-app.git
   cd health-tracking-app
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/huangk24/health-tracking-app.git
   ```

## Development Setup

### Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Set up environment variables
echo "USDA_API_KEY=your_api_key_here" > .env

# Run database migrations (if any)
# Note: Currently tables auto-create; Alembic coming soon

# Run backend server
uv run uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Quick Start (Both Servers)

```bash
# From project root
chmod +x start-dev.sh
./start-dev.sh
```

## How to Contribute

### Ways to Contribute

- **Bug Reports**: Open an issue describing the bug
- **Feature Requests**: Open an issue describing the desired feature
- **Code Contributions**: Submit a pull request
- **Documentation**: Improve existing docs or add new ones
- **Testing**: Add test coverage for existing features
- **Code Review**: Review open pull requests

### Finding Issues to Work On

- Look for issues labeled `good first issue` for beginner-friendly tasks
- Issues labeled `help wanted` are ready for community contributions
- Check the project roadmap for planned features

### Before You Start

1. **Check existing issues** to avoid duplicate work
2. **Comment on the issue** to let others know you're working on it
3. **Discuss significant changes** before implementing them

## Coding Standards

### Python (Backend)

#### Style Guide

- Follow **PEP 8** style guide
- Use **Black** for code formatting (max line length: 100)
- Use **type hints** for all function parameters and return values
- Use **docstrings** for all public modules, functions, classes, and methods

#### Example:

```python
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """
    Retrieve a user by username.
    
    Args:
        db: Database session
        username: Username to search for
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.username == username).first()
```

#### File Organization

- One model/schema/route per file
- Group related functionality in services
- Use `__init__.py` for public API exports

#### Import Order

```python
# Standard library
import os
from datetime import datetime

# Third-party
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Local application
from app.database import get_db
from app.models.user import User
```

### TypeScript/React (Frontend)

#### Style Guide

- Use **ESLint** with recommended React rules
- Use **Prettier** for code formatting
- Use **TypeScript strict mode**
- Use **functional components** with hooks (no class components)
- Use **interfaces** over types for object shapes

#### Example:

```typescript
interface FoodEntry {
  id: number;
  foodName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

interface AddFoodFormProps {
  onSubmit: (entry: FoodEntry) => Promise<void>;
  onCancel: () => void;
}

export const AddFoodForm: React.FC<AddFoodFormProps> = ({ onSubmit, onCancel }) => {
  const [foodName, setFoodName] = useState<string>("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

#### File Organization

- One component per file
- Co-locate styles with components
- Use `/services` for API calls
- Use `/contexts` for global state
- Use `/utils` for helper functions

#### Naming Conventions

- **Components**: PascalCase (e.g., `DashboardPage.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### CSS/Styling

- Use **CSS modules** or **scoped styles**
- Follow **BEM naming convention** for class names
- Use **rem/em** units instead of px for better accessibility
- Ensure **responsive design** (mobile-first approach)
- Test on multiple screen sizes

## Commit Guidelines

We use **Conventional Commits** specification for clear and consistent commit messages.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build, etc.)
- **perf**: Performance improvements

### Examples

```bash
# Feature commit
git commit -m "feat(nutrition): add custom nutrition goals"

# Bug fix commit
git commit -m "fix(auth): resolve token expiration issue"

# Documentation commit
git commit -m "docs(api): update API reference with new endpoints"

# Multi-line commit with body
git commit -m "feat(weights): add weekly weight comparison

- Add new endpoint for week-over-week comparison
- Include trend indicators (increasing/decreasing/stable)
- Add frontend component to display comparison chart

Closes #42"
```

### Pre-commit Hooks

The project uses pre-commit hooks to ensure code quality:

```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Run hooks manually
pre-commit run --all-files
```

Hooks include:
- Trailing whitespace removal
- End-of-file fixes
- YAML validation
- Large file checks

## Pull Request Process

### Before Submitting

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following coding standards

3. **Write tests** for your changes (see [Testing Requirements](#testing-requirements))

4. **Run tests** to ensure everything passes:
   ```bash
   # Backend tests
   cd backend && uv run pytest tests/ -v
   
   # Frontend tests
   cd frontend && npm test
   ```

5. **Update documentation** if needed

6. **Commit your changes** following commit guidelines

7. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

8. **Push to your fork**:
   ```bash
   git push origin feat/your-feature-name
   ```

### Submitting the Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Backend tests pass
- [ ] Frontend tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added for new features
- [ ] Dependent changes merged

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #issue_number
```

5. Click "Create Pull Request"

### PR Review Process

1. **Automated Checks**: CI/CD runs tests and linters
2. **Code Review**: Maintainers review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, PR will be merged
5. **Cleanup**: Delete your feature branch after merge

### Review Criteria

Reviewers will check:
- Code quality and readability
- Test coverage (>80% required)
- Documentation completeness
- Performance implications
- Security considerations
- Breaking changes
- Backward compatibility

## Testing Requirements

### Backend Testing

**Minimum Coverage**: 80% (current: 90.70%)

**Test Structure**:
```
tests/
├── conftest.py              # Shared fixtures
├── unit/                    # Unit tests
│   ├── test_user_model.py
│   ├── test_user_service.py
│   └── test_calculations.py
└── integration/             # Integration tests
    ├── test_auth.py
    ├── test_nutrition.py
    └── test_weights.py
```

**Writing Tests**:

```python
# tests/unit/test_calculations.py
import pytest
from app.services.calculations import calculate_bmr

def test_calculate_bmr_male():
    """Test BMR calculation for male users."""
    bmr = calculate_bmr(sex="male", age=30, height_cm=175, weight_kg=75)
    assert bmr == pytest.approx(1732.5, rel=0.01)

def test_calculate_bmr_female():
    """Test BMR calculation for female users."""
    bmr = calculate_bmr(sex="female", age=30, height_cm=165, weight_kg=60)
    assert bmr == pytest.approx(1367.5, rel=0.01)
```

**Running Tests**:
```bash
cd backend

# Run all tests
uv run pytest tests/ -v

# Run with coverage report
uv run pytest tests/ --cov=app --cov-report=term-missing

# Run specific test file
uv run pytest tests/unit/test_user_service.py -v

# Run tests matching a pattern
uv run pytest -k "test_auth" -v
```

### Frontend Testing

**Test Structure**:
```
src/
├── components/
│   ├── AddFoodForm.tsx
│   └── AddFoodForm.test.tsx
├── services/
│   ├── api.ts
│   └── api.test.ts
└── utils/
    ├── date.ts
    └── date.test.ts
```

**Writing Tests**:

```typescript
// src/components/AddFoodForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AddFoodForm } from './AddFoodForm';

describe('AddFoodForm', () => {
  it('renders food name input', () => {
    render(<AddFoodForm onSubmit={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByLabelText(/food name/i)).toBeInTheDocument();
  });

  it('calls onSubmit when form is valid', async () => {
    const handleSubmit = jest.fn();
    render(<AddFoodForm onSubmit={handleSubmit} onCancel={jest.fn()} />);
    
    fireEvent.change(screen.getByLabelText(/food name/i), {
      target: { value: 'Apple' }
    });
    fireEvent.click(screen.getByText(/add food/i));
    
    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
  });
});
```

**Running Tests**:
```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Documentation

### What to Document

1. **Code Comments**:
   - Complex algorithms
   - Business logic rationale
   - Workarounds or hacks (with explanation)
   - TODOs with issue numbers

2. **API Documentation**:
   - Update `/docs/api/API_REFERENCE.md` for new endpoints
   - Include request/response examples
   - Document error cases

3. **User-Facing Documentation**:
   - Update `README.md` for new features
   - Add guides in `/docs/guides/`
   - Include screenshots for UI changes

4. **Technical Documentation**:
   - Update `docs/ARCHITECTURE.md` for design changes
   - Document dependencies in relevant files
   - Add setup instructions for new tools

### Documentation Style

- Use **Markdown** for all documentation
- Use **code blocks** with syntax highlighting
- Include **examples** for complex concepts
- Keep explanations **concise and clear**
- Use **screenshots** for visual features
- Provide **links** to related documentation

## Community

### Getting Help

- **GitHub Issues**: Ask questions by opening an issue
- **Discussions**: Use GitHub Discussions for general questions
- **Email**: Contact maintainers at [maintainer email]

### Reporting Bugs

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Python version, Node version
6. **Screenshots**: If applicable
7. **Logs**: Error messages or stack traces

Use this template:

```markdown
**Bug Description**
A clear description of the bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Ubuntu 24.04]
- Python: [e.g., 3.11]
- Node: [e.g., 18.x]
- Browser: [e.g., Chrome 120]

**Additional Context**
Any other context about the problem.
```

### Suggesting Features

When suggesting features, include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: What other solutions did you consider?
4. **Use Cases**: Real-world scenarios where this helps
5. **Mockups**: UI mockups if applicable

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- GitHub contributors page

Thank you for contributing to Health Tracking App! 🎉
