import { z } from 'zod';
import { protectedProcedure, router } from '@/server/trpc';
import PDFDocument from 'pdfkit';
import { priceToString } from '@/utils/priceToString';
import getStream from 'get-stream';

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
  confirm: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        cashTendered: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const orderId = input.id;
      const cashTendered = input.cashTendered;

      const order = await ctx.prisma.orders.findFirst({
        where: {
          id: orderId,
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

      if (!order) {
        throw new Error('Order not found');
      }

      const lastOrder = await ctx.prisma.orders.findFirst({
        where: {
          restaurantId: order?.restaurantId,
          deletedAt: null,
          status: 'READY',
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      console.log(lastOrder);

      let orderNumber = lastOrder ? lastOrder.number + 1 : 1;

      console.log(orderNumber);

      if (lastOrder?.updatedAt.getDay() !== order.updatedAt.getDay()) {
        orderNumber = 1;
      }
      console.log(lastOrder?.updatedAt.getDay());
      console.log(new Date().getDay());
      console.log(orderNumber);

      const pdf: string = await generateInvoicePdf({
        orderNumber: orderNumber.toString(),
        orderId: order.id,
        restaurantAddress: order.restaurant.address,
        restaurantName: order.restaurant.name,
        date: order.createdAt,
        items: order.ordersItems.map((item) => ({
          id: item.id,
          name: item.item.name,
          quantity: item.quantity,
          price: item.price,
          tvaPercent: item.item.tvaPercent,
          parentId: item.parentItemOrderId || undefined,
        })),
        siret: order.restaurant.siretNumber,
        tva: order.restaurant.tvaNumber,
        phone: order.restaurant.phone,
        cashTendered: cashTendered,
      });

      const finalOrder = await ctx.prisma.orders.update({
        where: {
          id: orderId,
        },
        data: {
          status: 'READY',
          number: orderNumber,
          pdfBase64: pdf,
          cashTendered: cashTendered,
        },
      });

      return finalOrder;
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
  cashTendered: number;
}): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: [57 * 2.83465, 11.69 * 72], margin: 5 });

      // Nom et adresse du restaurant
      doc.fontSize(8).text(props.restaurantName, { align: 'center' });
      doc.fontSize(8).text(props.restaurantAddress, { align: 'center' });

      // Numéro de commande
      doc.moveDown().fontSize(18).text(`E${props.orderNumber}`, { align: 'center', underline: true });

      // Date
      doc.moveDown().fontSize(8).text(`Date: ${props.date.toLocaleDateString()}`, { align: 'right' });

      doc.moveDown();

      const groupedItems: { [key: string]: typeof props.items } = { root: [] };

      props.items.forEach((item) => {
        if (item.parentId) {
          if (!groupedItems[item.parentId]) {
            groupedItems[item.parentId] = [];
          }
          groupedItems[item.parentId]?.push(item);
        } else {
          groupedItems?.root?.push(item);
        }
      });

      // Trier les éléments pour que les enfants suivent directement leurs parents
      const sortedItems: typeof props.items = [];

      groupedItems?.root?.forEach((parentItem) => {
        sortedItems.push(parentItem);
        if (groupedItems[parentItem.id]) {
          sortedItems.push(...groupedItems[parentItem.id]);
        }
      });

      let totalHT = 0;
      let totalTVA = 0;
      let totalTTC = 0;

      sortedItems.forEach((item) => {
        const isParent = !item.parentId;
        const itemName = isParent ? item.name : `     ${item.name}`;
        const itemTotalPriceTTC = item.price * item.quantity;
        const itemTVA = item.tvaPercent / 100;
        const itemTotalPriceHT = itemTotalPriceTTC / (1 + itemTVA);
        const itemTotalTVA = itemTotalPriceTTC - itemTotalPriceHT;

        totalHT += itemTotalPriceHT;
        totalTVA += itemTotalTVA;
        totalTTC += itemTotalPriceTTC;

        doc
          .fontSize(8)
          .text(`${itemName} x${item.quantity}`, { continued: true })
          .text(itemTotalPriceTTC === 0 ? ' ' : priceToString(itemTotalPriceTTC), { align: 'right' });
      });

      // Total HT et TVA
      doc
        .moveDown()
        .fontSize(8)
        .text(`Total HT:`, { continued: true })
        .text(priceToString(totalHT), { align: 'right' });

      doc.fontSize(8).text(`Total TVA:`, { continued: true }).text(priceToString(totalTVA), { align: 'right' });

      // Total TTC
      doc.fontSize(14).text(`Total TTC:`, { continued: true }).text(priceToString(totalTTC), { align: 'right' });

      // Espèces
      doc
        .moveDown()
        .fontSize(8)
        .text(`Espèces:`, { continued: true })
        .text(priceToString(props.cashTendered), { align: 'right' });

      // Monnaie rendue
      doc
        .fontSize(8)
        .text(`Monnaie rendue:`, { continued: true })
        .text(priceToString(props.cashTendered - (totalHT + totalTVA)), { align: 'right' });

      // Informations légales
      doc.moveDown().fontSize(8).text(`SIRET: ${props.siret}`);
      doc.text(`TVA: ${props.tva}`);
      doc.text(`Téléphone: ${props.phone}`);

      doc.end();

      const res = await getStream.buffer(doc);

      resolve(res.toString('base64'));
    } catch (error) {
      // Rejeter la promesse en cas d'erreur
      reject(error);
    }
  });
}
