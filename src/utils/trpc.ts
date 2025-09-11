import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink, splitLink, unstable_httpSubscriptionLink } from '@trpc/client';
import type { AppRouter } from '../server';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition(op) {
        // Use subscription link for subscription operations
        return op.type === 'subscription';
      },
      true: unstable_httpSubscriptionLink({
        url: '/api/trpc',
      }),
      false: httpBatchLink({
        url: '/api/trpc',
      }),
    }),
  ],
});
