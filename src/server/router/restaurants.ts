import { z } from 'zod';
import { protectedProcedure, router } from '@/server/trpc';

const schema = z.object({
  id: z.string().optional(),

  name: z.string(),
  address: z.string().default(''),
  phone: z.string().default(''),
  siretNumber: z.string().default(''),
  tvaNumber: z.string().default(''),
  latitude: z.number().default(0),
  longitude: z.number().default(0),
  userId: z.string(),

  deletedAt: z.date().optional().nullable(),
  updateAt: z.date().optional().nullable(),
  createdAt: z.date().optional().nullable(),
});

export const restaurantsRouter = router({
  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const item = await ctx.prisma.restaurants.findFirst({
      where: {
        id: input,
        deletedAt: null,
      },
    });

    return item;
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.restaurants.findMany({
      where: {
        deletedAt: null,
      },
    });

    return items;
  }),
  create: protectedProcedure.input(schema).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.restaurants.create({
      data: {
        ...input,
      },
    });

    return item;
  }),
  update: protectedProcedure.input(schema).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.restaurants.update({
      where: {
        id: input.id,
      },
      data: {
        ...input,
      },
    });

    return item;
  }),
  destroy: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.restaurants.update({
      where: {
        id: input,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return item;
  }),
  getRestaurantId: protectedProcedure.query(async ({ ctx }) => {
    const item = await ctx.prisma.usersRestaurants.findFirst({
      where: {
        userId: ctx.user?.id || '',
        deletedAt: null,
      },
      include: {
        restaurant: true,
      },
    });

    console.log(ctx.user?.id);

    return item?.restaurant?.id;
  }),
});
