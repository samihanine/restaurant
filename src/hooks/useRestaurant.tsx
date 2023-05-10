import { trpc } from '@/utils/trpc';
import { useRestaurantId } from './useRestaurantId';

export const useRestaurant = () => {
  const restaurantId = useRestaurantId();

  const res = trpc.restaurants.getOne.useQuery(restaurantId, {
    staleTime: Infinity,
  });

  return {
    ...res,
    data: res.data,
  };
};
