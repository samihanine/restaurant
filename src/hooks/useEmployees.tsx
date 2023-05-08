import { trpc } from '@/utils/trpc';
import { useRestaurantId } from './useRestaurantId';

export const useEmployees = () => {
  const restaurantId = useRestaurantId();

  const res = trpc.employees.getAllByRestaurantId.useQuery(restaurantId, {
    staleTime: Infinity,
  });

  return {
    ...res,
    data: res.data || [],
  };
};
