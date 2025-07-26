import { createTRPCRouter } from '@/trcp/init';
import { messagesRouter } from '@/modules/messages/server/procedures';
import { projectsRouter } from '@/modules/projects/server/procedures';
import { usageRouter } from '@/modules/usage/server/procedures';
import { fitnessRouter } from '@/modules/fitness/server/procedures';
import { youtubeRouter } from './youtube';

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
  usage: usageRouter,
  fitness: fitnessRouter,
  youtube: youtubeRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;