import { trpc } from '@/utils/trpc';
import { useRestaurantId } from './useRestaurantId';

export const useGroups = () => {
  const restaurantId = useRestaurantId();

  const res = trpc.groups.getAllByRestaurantId.useQuery(restaurantId, {
    staleTime: Infinity,
  });

  return {
    ...res,
    data: res.data || [],
  };
};
