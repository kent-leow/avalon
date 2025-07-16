import { roomRouter } from "~/server/api/routers/room";
import { antiCheatSecurityRouter } from "~/server/api/routers/anti-cheat-security";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  room: roomRouter,
  antiCheatSecurity: antiCheatSecurityRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.room.getRoomInfo();
 */
export const createCaller = createCallerFactory(appRouter);
