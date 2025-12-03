# Team Development Rules

## Code Style

- Use **TypeScript** for all new files
- Follow the **ESLint** configuration in the project
- Use **Prettier** for code formatting
- Maximum line length: **100 characters**
- Use **meaningful variable and function names**
- Add **JSDoc comments** for complex functions

## Component Structure (React/Next.js)

- Use **functional components** with hooks
- Keep components under **200 lines** (extract smaller components if needed)
- Extract reusable logic to **custom hooks**
- Use **TypeScript interfaces** for props
- Place components in appropriate directories:
  - `/components` - Reusable UI components
  - `/app` - Next.js app router pages
  - `/lib` - Utility functions and helpers

## File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Pages**: kebab-case for routes (e.g., `user-profile/page.tsx`)
- **Types**: PascalCase with `.types.ts` suffix (e.g., `User.types.ts`)

## Testing Requirements

- Write **unit tests** for all utility functions
- Test React components with **React Testing Library**
- Maintain **80%+ code coverage** for critical features
- Run tests before submitting PR: `npm test`
- Add integration tests for complex user flows

## Security Best Practices

- **Never commit API keys, secrets, or passwords**
- Use **environment variables** for all configuration
- **Validate all user inputs** on both client and server
- **Sanitize data** before database operations
- Use **parameterized queries** to prevent SQL injection
- Implement **proper authentication checks** on all protected routes
- **Never expose sensitive data** in client-side code

## Database & Prisma

- Use **Prisma migrations** for schema changes
- Run `npx prisma generate` after schema updates
- Use **transactions** for multi-step database operations
- Add **proper indexes** for frequently queried fields
- Use **soft deletes** instead of hard deletes where appropriate

## Git & Version Control

- **Never commit directly to `main` or `develop`**
- Always work in **feature branches**
- Use **conventional commit messages**:
  - `feat:` - New features
  - `fix:` - Bug fixes
  - `docs:` - Documentation changes
  - `refactor:` - Code refactoring
  - `test:` - Adding tests
  - `chore:` - Maintenance tasks
- **Pull latest changes** before starting work
- **Resolve conflicts** before requesting review
- **Delete branches** after merging

## Code Review Standards

- **All code must be reviewed** before merging
- At least **1 approval** required for PRs
- Reviewers should:
  - Test changes locally
  - Check for security issues
  - Verify code quality
  - Ensure tests pass
  - Provide constructive feedback
- **Respond to reviews** within 4 hours

## Performance Guidelines

- **Optimize images** before committing (use WebP format)
- Use **lazy loading** for heavy components
- Implement **pagination** for large data sets
- Use **React.memo** for expensive components
- Avoid **unnecessary re-renders**
- Use **server components** where possible (Next.js App Router)

## Accessibility (a11y)

- Use **semantic HTML** elements
- Add **ARIA labels** where needed
- Ensure **keyboard navigation** works
- Maintain **color contrast ratios** (WCAG AA minimum)
- Add **alt text** for all images
- Test with **screen readers**

## Error Handling

- Use **try-catch blocks** for async operations
- Provide **user-friendly error messages**
- Log errors appropriately (use logging service)
- Never expose **stack traces** to users
- Implement **fallback UI** for error states

## Documentation

- Add **README.md** for new features or modules
- Document **complex algorithms** with comments
- Update **API documentation** when changing endpoints
- Keep **environment variable examples** up to date (`.env.example`)
- Document **breaking changes** in PR descriptions

## Antigravity Agent Behavior

When using Antigravity AI agents, ensure they:

- **Always run tests** before committing code
- **Create detailed commit messages** following conventions
- **Generate documentation** for new features
- **Verify changes in browser** before submitting PR
- **Follow all team coding standards** above
- **Ask for clarification** when requirements are unclear
- **Provide explanations** for complex code changes

## Dependencies Management

- **Review dependencies** before adding new packages
- Use **exact versions** for critical dependencies
- Run `npm audit` regularly to check for vulnerabilities
- Update dependencies in **separate PRs**
- Document **why** a dependency is needed

## Environment-Specific Rules

### Development
- Use `.env.local` for local environment variables
- Enable **verbose logging** for debugging
- Use **development API keys** (never production)

### Production
- Minimize **bundle size**
- Enable **error tracking** (e.g., Sentry)
- Use **production API keys** from secure storage
- Implement **rate limiting** on APIs

## Communication

- Ask questions in appropriate channels:
  - `#development` - Code questions
  - `#bugs` - Bug reports
  - `#antigravity-help` - Tool assistance
- **Update team** on blockers immediately
- **Document decisions** in GitHub issues/PRs
- **Be respectful** and constructive in all communications

---

**These rules ensure code quality, security, and team collaboration. All team members must follow these guidelines.**

Last Updated: December 3, 2025
