import { z } from 'zod';
import { protectedProcedure, router } from '@/server/trpc';

const schema = z.object({
  id: z.string().optional(),

  orderId: z.string(),
  itemId: z.string(),
  parentItemOrderId: z.string().optional().nullable(),
  quantity: z.number().default(1).nullable(),
  price: z.number().optional().nullable(),

  deletedAt: z.date().optional().nullable(),
  updateAt: z.date().optional().nullable(),
  createdAt: z.date().optional().nullable(),
});

export const itemsOrdersRouter = router({
  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const item = await ctx.prisma.ordersItems.findFirst({
      where: {
        id: input,
        deletedAt: null,
      },
      include: {
        item: true,
      },
    });

    return item;
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.ordersItems.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        item: true,
      },
    });

    return items;
  }),
  getAllByOrderId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const items = await ctx.prisma.ordersItems.findMany({
      where: {
        orderId: input,
        deletedAt: null,
      },
      include: {
        item: true,
      },
    });

    return items;
  }),
  create: protectedProcedure.input(schema).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.ordersItems.create({
      data: {
        ...input,
      },
    });

    return item;
  }),
  update: protectedProcedure.input(schema).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.ordersItems.update({
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
    const resultChildrens = await ctx.prisma.ordersItems.deleteMany({
      where: {
        parentItemOrderId: input,
      },
    });

    const resultItem = await ctx.prisma.ordersItems.deleteMany({
      where: {
        id: input,
      },
    });

    return resultChildrens.count + resultItem.count;
  }),
});
