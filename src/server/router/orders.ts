import { z } from 'zod';
import { protectedProcedure, router } from '@/server/trpc';
import PDFDocument from 'pdfkit';
import { priceToString } from '@/utils/priceToString';

const schema = z.object({
  id: z.string().optional(),

  customerLastName: z.string().default(''),
  customerFirstName: z.string().default(''),
  customerEmail: z.string().default(''),
  customerPhone: z.string().default(''),
  customerAddress: z.string().default(''),
  restaurantId: z.string(),
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELED']).default('PENDING'),
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
      include: {
        ordersItems: true,
        employee: true,
      },
    });

    return item;
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.orders.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        ordersItems: true,
        employee: true,
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
      include: {
        ordersItems: true,
        employee: true,
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
  confirm: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    // get numer of the last order, if it's the first order, set it to 1
    // and if iam not wrong, it's the first order
    // and if the last order is from yesterday, set it to 1

    const lastOrder = await ctx.prisma.orders.findFirst({
      where: {
        restaurantId: input,
        deletedAt: null,
        status: 'READY',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const newOrder = await ctx.prisma.orders.findFirst({
      where: {
        id: input,
        deletedAt: null,
      },
    });

    const lastOrderNumber = lastOrder ? lastOrder?.number : 0;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastOrderDate = lastOrder ? lastOrder.updatedAt : yesterday;

    const orderNumber = lastOrderDate.getDate() === newOrder?.updatedAt.getDate() ? lastOrderNumber + 1 : 1;

    console.log('orderNumber', orderNumber);

    await ctx.prisma.orders.update({
      where: {
        id: input,
      },
      data: {
        status: 'READY',
        number: orderNumber,
      },
    });

    const order = await ctx.prisma.orders.findFirst({
      where: {
        id: input,
        deletedAt: null,
      },
      include: {
        ordersItems: {
          include: {
            item: true,
          },
        },
        restaurant: true,
      },
    });

    return order;
    if (!order) {
      throw new Error('Order not found');
    }

    const pdf: string = await generateInvoicePdf({
      orderNumber: order.number.toString(),
      orderId: order.id,
      restaurantAddress: order.restaurant.address,
      restaurantName: order.restaurant.name,
      date: order.createdAt,
      items: order.ordersItems.map((item) => ({
        id: item.id,
        name: item.item.name,
        quantity: item.quantity,
        price: item.item.price,
        tvaPercent: item.item.tvaPercent,
        parentId: item.parentItemOrderId || undefined,
      })),
      siret: order.restaurant.siretNumber,
      tva: order.restaurant.tvaNumber,
      phone: order.restaurant.phone,
    });

    console.log(pdf);

    return {
      order: order,
      pdf: pdf,
      number: orderNumber,
    };
  }),
});

async function generateInvoicePdf(props: {
  orderNumber: string;
  orderId?: string;
  restaurantAddress: string;
  restaurantName: string;
  date: Date;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    tvaPercent: number;
    parentId?: string;
  }[];
  siret: string;
  tva: string;
  phone: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: [57 * 2.83465, 11.69 * 72], margin: 50 });

      const buffers: Buffer[] = [];
      doc.on('data', (buffer: Buffer) => buffers.push(buffer));
      doc.on('end', () => {
        // Convertir le buffer en base64 et résoudre la promesse
        const base64PDF = Buffer.concat(buffers).toString('base64');
        resolve(base64PDF);
      });

      // Nom et adresse du restaurant
      doc.fontSize(14).text(props.restaurantName, { align: 'center' });
      doc.fontSize(10).text(props.restaurantAddress, { align: 'center' });

      // Numéro de commande
      doc.fontSize(24).text(`Commande #${props.orderNumber}`, { align: 'center', underline: true });

      // Date
      doc.fontSize(10).text(`Date: ${props.date.toLocaleDateString()}`, { align: 'right' });

      // Liste des articles
      let totalHT = 0;
      let totalTVA = 0;

      const sortedItems = props.items.sort((a, b) => {
        if (a.parentId === b.parentId) {
          return a.id.localeCompare(b.id);
        }
        if (a.parentId) {
          return a.parentId.localeCompare(b.id);
        }
        if (b.parentId) {
          return a.id.localeCompare(b.parentId);
        }
        return a.id.localeCompare(b.id);
      });

      sortedItems.forEach((item) => {
        const isParent = !item.parentId;
        const itemName = isParent ? item.name : `  ${item.name}`;
        const itemTotalPrice = item.price * item.quantity;
        const itemTVA = item.tvaPercent / 100;
        const itemTotalTVA = itemTotalPrice * itemTVA;

        totalHT += itemTotalPrice;
        totalTVA += itemTotalTVA;

        doc
          .fontSize(10)
          .text(`${itemName} x${item.quantity}`, { continued: true })
          .text(priceToString(itemTotalPrice), { align: 'right' });
      });

      // Total HT et TVA
      doc
        .moveDown()
        .fontSize(12)
        .text(`Total HT:`, { continued: true })
        .text(priceToString(totalHT), { align: 'right' });

      doc.fontSize(12).text(`Total TVA:`, { continued: true }).text(priceToString(totalTVA), { align: 'right' });

      // Informations légales
      doc.moveDown().fontSize(10).text(`SIRET: ${props.siret}`);
      doc.text(`TVA: ${props.tva}`);
      doc.text(`Téléphone: ${props.phone}`);
    } catch (error) {
      // Rejeter la promesse en cas d'erreur
      reject(error);
    }
  });
}
