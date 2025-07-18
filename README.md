# Avalon - Online Game

A real-time multiplayer implementation of The Resistance: Avalon using the T3 Stack.

## Technology Stack

This project is built with:

- [Next.js](https://nextjs.org) - React framework with App Router
- [tRPC](https://trpc.io) - End-to-end typesafe APIs with SSE subscriptions for real-time updates
- [Prisma](https://prisma.io) - Database ORM
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Zod](https://zod.dev) - Schema validation

## Development

### Prerequisites

- Node.js 18+
- Yarn package manager
- PostgreSQL database

### Getting Started

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Set up your database:
   ```bash
   yarn db:push
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

The app will be available at `http://localhost:3000` (or next available port).

### Available Scripts

- `yarn dev` - Start development server with Turbo mode
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn typecheck` - Run TypeScript check
- `yarn db:studio` - Open Prisma Studio

## Real-time Features

The application uses **tRPC subscriptions with Server-Sent Events (SSE)** for real-time communication instead of WebSockets, making it compatible with serverless deployments like Vercel.

Key real-time features:
- Live player joins/leaves
- Real-time voting and mission selection
- Game state synchronization
- Connection status indicators

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com) with no additional configuration required for SSE-based real-time features.

For other platforms, ensure your deployment supports:
- Server-Sent Events (SSE)
- Long-running API routes for subscriptions

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks (SSE-based)
├── lib/           # Utility functions
├── server/        # tRPC API and database logic
├── styles/        # Global styles
├── trpc/          # tRPC configuration
└── types/         # TypeScript type definitions
```

## Game Rules

This implements the official rules of The Resistance: Avalon. See `docs/requirements/avalon-official-rules.md` for complete rule set.
