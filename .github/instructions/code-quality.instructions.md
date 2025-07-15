---
applyTo: '**'
---
# Code Quality Instructions

## Principles
- Strictly follow T3 Stack and Next.js best practices.
- Apply SOLID, DRY, and KISS principles in all code.
- Use TypeScript for all code, ensuring type safety and maintainability.
- Prefer functional React components and hooks over class components.
- Keep components and functions small, focused, and reusable.
- Validate all props and API inputs using Zod schemas.
- Avoid magic numbers/strings; use constants or enums.
- Write clear, descriptive comments and documentation for all non-trivial logic.
- Ensure all code is covered by unit and integration tests.

## Linting & Formatting
- Use ESLint with T3/Next.js recommended rules.
- Use Prettier for code formatting; do not override formatting rules without strong justification.
- Fix all lint and formatting errors before committing.

## Testing
- Write tests for all business logic, API routes, and components.
- Use mocks/stubs for external dependencies in tests.
- Ensure tests are deterministic and do not rely on external state.

## General
- Do not duplicate code; extract shared logic into utilities or hooks.
- Do not introduce unnecessary complexity; keep solutions as simple as possible.
- Document all public APIs and exported functions.
- Review code for security, performance, and accessibility issues before merging.
