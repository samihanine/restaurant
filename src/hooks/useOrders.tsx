import { trpc } from '@/utils/trpc';
import { useRestaurantId } from './useRestaurantId';

export const useOrders = () => {
  const restaurantId = useRestaurantId();

  const res = trpc.orders.getAllByRestaurantId.useQuery(restaurantId, {
    staleTime: Infinity,
  });

  return {
    ...res,
    data: res.data || [],
  };
};
