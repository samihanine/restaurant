import { z } from 'zod';
import { protectedProcedure, router } from '@/server/trpc';

const schema = z.object({
  id: z.string().optional(),

  customerLastName: z.string().default(''),
  customerFirstName: z.string().default(''),
  customerEmail: z.string().default(''),
  customerPhone: z.string().default(''),
  customerAddress: z.string().default(''),
  restaurantId: z.string(),
  status: z.enum(['ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELED']).default('ACCEPTED'),
  employeeId: z.string().optional(),
  type: z.enum(['DELIVERY', 'TAKEAWAY', 'ONSPOT']).default('ONSPOT'),
  deletedAt: z.date().optional().nullable(),
  updateAt: z.date().optional().nullable(),
  createdAt: z.date().optional().nullable(),
});

export const ordersRouter = router({
  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const item = await ctx.prisma.orders.findFirst({
      where: {
        id: input,
        deletedAt: null,
      },
    });

    return item;
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.orders.findMany({
      where: {
        deletedAt: null,
      },
    });

    return items;
  }),
  getAllByRestaurantId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const items = await ctx.prisma.orders.findMany({
      where: {
        restaurantId: input,
        deletedAt: null,
      },
    });

    return items;
  }),
  create: protectedProcedure.input(schema).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.orders.create({
      data: {
        ...input,
      },
    });

    return item;
  }),
  update: protectedProcedure.input(schema).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.orders.update({
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
    const item = await ctx.prisma.orders.update({
      where: {
        id: input,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return item;
  }),
});
