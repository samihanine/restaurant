import { router } from '@/server/trpc';
import { settingsRouter } from '@/server/router/settings';
import { restaurantsRouter } from './restaurants';
import { categoriesRouter } from './categories';
import { itemsRouter } from './items';
import { ordersRouter } from './orders';
import { employeesRouter } from './employees';
import { itemsOrdersRouter } from './items-orders';

export const appRouter = router({
  settings: settingsRouter,
  restaurants: restaurantsRouter,
  categories: categoriesRouter,
  items: itemsRouter,
  orders: ordersRouter,
  employees: employeesRouter,
  itemsOrders: itemsOrdersRouter,
});

export type AppRouter = typeof appRouter;
