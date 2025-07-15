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

## Typescript
- Use "paths": {"~/*": ["./src/*"]} in tsconfig.json for absolute imports.
- Use interfaces for complex types and avoid inline type definitions.
- Use enums for fixed sets of values instead of strings or numbers.
- Use type guards for runtime type checking when necessary.
- Use `unknown` type for values that can be of any type, and narrow down types with type assertions or checks.
- Prefer `const` over `let` for variables that do not change.
- Use `readonly` for arrays and objects that should not be mutated.
- Use `as const` for literals that should be treated as their literal type.