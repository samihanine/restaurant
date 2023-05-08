import { trpc } from '@/utils/trpc';
import { useRestaurantId } from './useRestaurantId';

export const useCategories = () => {
  const restaurantId = useRestaurantId();

  const res = trpc.categories.getAllByRestaurantId.useQuery(restaurantId, {
    staleTime: Infinity,
  });

  return {
    ...res,
    data: res.data || [],
  };
};
