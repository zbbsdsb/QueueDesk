# Contributing to QueueDesk

Thank you for your interest in contributing to QueueDesk! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code. Please read it before contributing.

## Development Environment Setup

### Prerequisites

- **Node.js**: v20.x or later (LTS recommended)
- **npm**: v10.x or later (comes with Node.js)
- **Git**: v2.30 or later
- **Supabase CLI**: v1.0 or later (for local database development)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/QueueDesk.git
   cd QueueDesk
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file and configure your local settings:

   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase (optional, for local development)**

   ```bash
   supabase login
   supabase link --project-ref your_project_ref
   supabase db reset  # Reset and apply migrations
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

## Code Standards

### TypeScript Strict Mode

This project uses TypeScript with strict mode enabled. All code must:

- Have explicit return types on functions
- Use `unknown` instead of `any` when type is uncertain
- Avoid non-null assertions (`!`) unless absolutely necessary
- Enable strict null checks

Example:

```typescript
// Good
function getTicketById(id: string): Promise<Ticket | null> {
  return supabase.from('tickets').select('*').eq('id', id).single();
}

// Avoid
function getTicketById(id: any): any {
  return supabase.from('tickets').select('*').eq('id', id).single();
}
```

### ESLint and Prettier

The project uses ESLint for linting and Prettier for code formatting.

**Run linter:**

```bash
npm run lint
```

**Auto-fix linting issues:**

```bash
npm run lint -- --fix
```

**Check formatting:**

```bash
npx prettier --check .
```

**Auto-fix formatting:**

```bash
npx prettier --write .
```

### Conventional Commits

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

#### Commit Types

| Type     | Description                                      |
|---------- |--------------------------------------------------|
| `feat`    | A new feature                                    |
| `fix`     | A bug fix                                        |
| `docs`    | Documentation only changes                       |
| `refactor`| Code change that neither fixes a bug nor adds a feature |
| `chore`   | Changes to the build process or auxiliary tools  |
| `perf`    | A code change that improves performance          |
| `test`    | Adding missing tests or correcting existing tests |
| `style`   | Formatting, missing semi colons, etc.            |

#### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

#### Examples

```
feat(tickets): add ticket priority filtering
fix(auth): resolve session timeout issue
docs(readme): update installation instructions
refactor(ai): extract classifier to separate module
chore(deps): upgrade Supabase client to v2.105.0
perf(dashboard): optimize query with proper indexing
```

## Pull Request Process

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your own copy of the repository.

### 2. Create a Feature Branch

Create a branch for your work:

```bash
git checkout -b feature/add-ticket-merge
git checkout -b fix/login-redirect-loop
git checkout -b docs/api-documentation
```

Branch naming conventions:

- `feature/<description>` - New features
- `fix/<description>` - Bug fixes
- `docs/<description>` - Documentation updates
- `refactor/<description>` - Code refactoring

### 3. Make Your Changes

- Write your code following the code standards
- Add or update tests as necessary
- Update documentation if needed

### 4. Commit Your Changes

Follow the Conventional Commits format:

```bash
git add .
git commit -m 'feat(tickets): add ability to merge duplicate tickets'
```

### 5. Push to Your Fork

```bash
git push origin feature/add-ticket-merge
```

### 6. Create a Pull Request

1. Navigate to the original QueueDesk repository
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template:
   - **Title**: Clear, concise summary following Conventional Commits
   - **Description**: Explain what and why
   - **Testing**: Describe how you tested the changes
   - **Screenshots**: Include before/after if UI changes

### 7. Review Process

- Repository maintainers will review your PR
- Address any feedback or requested changes
- Once approved, a maintainer will merge your PR
- Delete the branch after merge (can be done automatically)

## Issue Templates

### Bug Report Template

```markdown
## Bug Description
[A clear and concise description of what the bug is.]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What you expected to happen.]

## Screenshots
[If applicable, add screenshots to help explain your problem.]

## Environment
 - OS: [e.g., macOS, Windows, Linux]
 - Browser: [e.g., Chrome, Safari, Firefox]
 - Version: [e.g., 0.3.0]

## Additional Context
[Any other context about the problem.]
```

### Feature Request Template

```markdown
## Problem Statement
[Clearly describe the problem you're trying to solve.]

## Proposed Solution
[Describe the solution you'd like.]

## Use Cases
[Describe the use cases this feature would support.]

## Additional Context
[Add any other context, mockups, or examples about the feature request.]
```

## Getting Help

- Open an issue for bugs or feature requests
- Join our community discussions
- Read the project documentation

## License

By contributing to QueueDesk, you agree that your contributions will be licensed under the [MIT License](LICENSE).
