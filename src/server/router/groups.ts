import { z } from 'zod';
import { protectedProcedure, router } from '@/server/trpc';

const schema = z.object({
  id: z.string().optional(),

  name: z.string().default(''),
  menuId: z.string(),

  deletedAt: z.date().optional().nullable(),
  updateAt: z.date().optional().nullable(),
  createdAt: z.date().optional().nullable(),
});

const schemaOption = z.object({
  id: z.string().optional(),

  name: z.string().default(''),
  groupId: z.string(),
  categoryId: z.string().nullable().optional(),
  multiple: z.boolean().default(false),
  addonPrice: z.number().nullable().optional().default(0),
  required: z.boolean().default(false),

  deletedAt: z.date().optional().nullable(),
  updateAt: z.date().optional().nullable(),
  createdAt: z.date().optional().nullable(),
});

export const groupsRouter = router({
  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const item = await ctx.prisma.groups.findFirst({
      where: {
        id: input,
        deletedAt: null,
      },
      include: {
        groupsOptions: true,
      },
    });

    return item;
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.groups.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        groupsOptions: true,
      },
    });

    return items;
  }),
  getAllByRestaurantId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const restaurant = await ctx.prisma.restaurants.findFirst({
      where: {
        id: input,
      },
    });

    const items = await ctx.prisma.groups.findMany({
      where: {
        deletedAt: null,
        menuId: restaurant?.menuId || '',
      },
      include: {
        groupsOptions: true,
      },
    });

    return items;
  }),
  getGroupsOptionsByGroupId: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const items = await ctx.prisma.groupsOptions.findMany({
      where: {
        deletedAt: null,
        groupId: input,
      },
    });

    return items;
  }),
  addGroupOptions: protectedProcedure.input(schemaOption).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.groupsOptions.create({
      data: {
        ...input,
      },
    });

    return item;
  }),
  destroyGroupOptions: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.groupsOptions.deleteMany({
      where: {
        id: input,
      },
    });

    return item;
  }),
  updateGroupOptions: protectedProcedure.input(schemaOption).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.groupsOptions.update({
      data: {
        ...input,
      },
      where: {
        id: input.id,
      },
    });

    return item;
  }),
  create: protectedProcedure.input(schema).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.groups.create({
      data: {
        ...input,
      },
    });

    return item;
  }),
  update: protectedProcedure.input(schema).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.groups.update({
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
    const item = await ctx.prisma.groups.update({
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
