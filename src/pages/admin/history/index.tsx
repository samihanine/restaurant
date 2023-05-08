import React, { useEffect, useState } from 'react';
import { trpc } from '@/utils/trpc';
import { toast } from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { Table } from '@/components/ui/Table';
import type { NextPage } from 'next';
import { Wrapper } from '@/components/layouts/Wrapper';
import { getLocaleProps } from '@/utils/locales';
import { Card } from '@/components/layouts/Card';

import { useOrders } from '@/hooks/useOrders';
import { Tag } from '@/components/ui/Tag';

const History: NextPage = () => {
  const { data, isLoading, isError, refetch } = useOrders();
  const columnHelper = createColumnHelper<(typeof data)[0]>();

  useEffect(() => {
    refetch();
  }, []);

  const columns = [
    columnHelper.accessor('number', {
      header: () => <span>Numéro</span>,
      cell: ({ row }) => <p>{row.original.number}</p>,
    }),
    columnHelper.accessor('status', {
      header: () => <span>Statut</span>,
      cell: ({ row }) => (
        <>
          {row.original.status === 'PENDING' && <Tag className="!bg-red-200 !text-red-600">En attente</Tag>}
          {row.original.status === 'PREPARING' && <Tag>En préparation</Tag>}
          {row.original.status === 'READY' && <Tag>Prêt</Tag>}
          {row.original.status === 'DELIVERED' && <Tag>Livré</Tag>}
          {row.original.status === 'CANCELED' && <Tag>Annulé</Tag>}
        </>
      ),
    }),
    columnHelper.accessor('employee', {
      header: () => <span>Ordre d'affichage</span>,
      cell: ({ row }) => <p>{row.original.employee?.firstName + ' ' + row.original.employee?.lastName}</p>,
    }),
    columnHelper.accessor('createdAt', {
      header: () => <span>Nom</span>,
      cell: ({ row }) => <p>{new Date(row.original.createdAt).toLocaleDateString()}</p>,
    }),
    columnHelper.accessor('id', {
      header: () => <span>Total</span>,
      cell: ({ row }) => (
        <p>
          {row.original.ordersItems
            .reduce((acc, item) => acc + item.price * item.quantity, 0)
            .toFixed(2)
            .replace('.', ',')}
          {' €'}
        </p>
      ),
    }),
    columnHelper.accessor('type', {
      header: () => <span>Type</span>,
      cell: ({ row }) => (
        <>
          {row.original.type === 'TAKEAWAY' && <Tag>À emporter</Tag>}
          {row.original.type === 'DELIVERY' && <Tag>Livraison</Tag>}
          {row.original.type === 'ONSPOT' && <Tag>Sur place</Tag>}
        </>
      ),
    }),
  ];

  return (
    <>
      <Wrapper title={'Catégories'}>
        <Card>
          <h2 className="text-2xl font-bold text-primary">Historique</h2>
          <div className="flex flex-col gap-5">
            <Table loading={isLoading} data={data} columns={columns} />
          </div>
        </Card>
      </Wrapper>
    </>
  );
};

export const getServerSideProps = getLocaleProps;

export default History;
