import { trpc } from '@/utils/trpc';

export const useRestaurantId = (): string => {
  const res = trpc.restaurants.getRestaurantId.useQuery(undefined, {
    staleTime: Infinity,
  });

  return res.data || '';
};
