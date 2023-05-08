import { trpc } from '@/utils/trpc';
import { useRestaurantId } from './useRestaurantId';

export const useItems = () => {
  const restaurantId = useRestaurantId();

  const res = trpc.items.getAllByRestaurantId.useQuery(restaurantId, {
    staleTime: Infinity,
  });

  return {
    ...res,
    data: res.data || [],
  };
};
