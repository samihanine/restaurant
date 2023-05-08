import { z } from 'zod';
import { protectedProcedure, router } from '@/server/trpc';

const schema = z.object({
  id: z.string().optional(),

  name: z.string(),
  description: z.string().default(''),
  price: z.number(),
  outOfStock: z.boolean().default(false),
  promotion: z.number().default(0),
  type: z.enum(['REGULAR', 'DRINK', 'SAUCE', 'MENU']),
  imageUrl: z.string().optional(),
  categoryId: z.string(),
  restaurantId: z.string(),
  isHidden: z.boolean().default(false),

  deletedAt: z.date().optional().nullable(),
  updateAt: z.date().optional().nullable(),
  createdAt: z.date().optional().nullable(),
});

export const itemsRouter = router({
  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const item = await ctx.prisma.items.findFirst({
      where: {
        id: input,
        deletedAt: null,
      },
    });

    return item;
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.items.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        category: true,
      },
    });

    return items;
  }),
  getAllByRestaurantId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const items = await ctx.prisma.items.findMany({
      where: {
        restaurantId: input,
        deletedAt: null,
      },
    });

    return items;
  }),
  create: protectedProcedure.input(schema).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.items.create({
      data: {
        ...input,
      },
    });

    return item;
  }),
  update: protectedProcedure.input(schema).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.items.update({
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
    const item = await ctx.prisma.items.update({
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
