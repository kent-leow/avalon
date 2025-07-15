---
applyTo: '**'
---
# Project Architecture Instructions

## Package Management
- Use `yarn` as the package manager.

## Structure
- Organize code by feature/domain, following T3 conventions.
- All source code must reside in `/src`.
- Pages must be in `/src/app` (Next.js App Router).
- Reusable UI components must be in `/src/app/_components`.
- API routes must be in `/src/app/api`.
- Server logic must be in `/src/server`.
- Use `/src/env.js` for environment variable management.
- Styles must be in `/src/styles`.

## API & Data
- Use TRPC for all type-safe API calls between client and server.
- Validate all API inputs/outputs with Zod.
- Do not expose sensitive data to the client.

## Modularity
- Keep modules, components, and files focused on a single responsibility.
- Use clear, descriptive file and folder names.
- Avoid circular dependencies.

## Scalability
- Design for scalability: new features should be easy to add without major refactoring.
- Document architectural decisions and patterns in a `docs/` folder if needed.
