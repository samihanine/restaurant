import { trpc } from '@/utils/trpc';

export const useUserInformations = () => {
  const res = trpc.restaurants.getUserInformations.useQuery(undefined, {
    staleTime: Infinity,
  });

  return res.data || null;
};
