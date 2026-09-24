import { createTRPCRouter } from '../init';
import { billingRouter } from './billing';
import { generationsRouter } from './generations';
import { voicesRouter } from './voices';
import { transcriptionsRouter } from './transcriptions';
import { studioRouter } from './studio';
import { agentRouter } from './agent';

export const appRouter = createTRPCRouter({
  voices: voicesRouter,
  generations: generationsRouter,
  billing: billingRouter,
  transcriptions: transcriptionsRouter,
  studio: studioRouter,
  agent: agentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
