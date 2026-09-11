import { createTRPCRouter } from '../init';
import { billingRouter } from './billing';
import { generationsRouter } from './generations';
import { voicesRouter } from './voices';
import { transcriptionsRouter } from './transcriptions';

export const appRouter = createTRPCRouter({
  voices: voicesRouter,
  generations: generationsRouter,
  billing: billingRouter,
  transcriptions: transcriptionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
