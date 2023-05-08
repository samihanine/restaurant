import React, { useEffect, useState } from 'react';
import { trpc } from '@/utils/trpc';
import { toast } from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { Table } from '@/components/ui/Table';
import type { NextPage } from 'next';
import { Wrapper } from '@/components/layouts/Wrapper';
import { getLocaleProps } from '@/utils/locales';
import { Card } from '@/components/layouts/Card';
import { useRestaurantId } from '@/hooks/useRestaurantId';
import { useCategories } from '@/hooks/useCategories';
import type { Orders } from '@prisma/client';
import { InputText } from '@/components/inputs/InputText';
import { Button } from '@/components/inputs/Button';
import { Modal } from '@/components/layouts/Modal';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { useItems } from '@/hooks/useItems';
import { InputSelect } from '@/components/inputs/InputSelect';
import { useEmployees } from '@/hooks/useEmployees';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { useRouter } from 'next/router';

const OrdersPage: NextPage = () => {
  const { data, isLoading } = useCategories();
  const { data: items = [], isLoading: itemsIsLoading } = useItems();
  const restaurantId = useRestaurantId();
  const { data: orders = [], refetch } = trpc.orders.getAllByRestaurantId.useQuery(restaurantId);
  const { data: employees } = useEmployees();
  const { currentEmployee, setCurrentEmployee } = useCurrentEmployee();
  const createMutation = trpc.orders.create.useMutation();
  const destroyMutation = trpc.orders.destroy.useMutation();
  const router = useRouter();

  const destroyOrder = async (order: typeof Orders) => {
    try {
      await destroyMutation.mutateAsync(order.id);
      toast.success('Commande supprimée');
      refetch();
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue');
    }
  };

  const createOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const order = {
      restaurantId,
      employeeId: data.employeeId,
    };
    try {
      const newOrder = await createMutation.mutateAsync(order);
      router.push(`/orders/${newOrder.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue');
    }
  };

  const columnHelper = createColumnHelper<(typeof orders)[0]>();

  const columns = [
    columnHelper.accessor('createdAt', {
      header: () => <span>Date</span>,
      cell: ({ row }) => <p>{new Date(row.original.createdAt).toLocaleDateString()}</p>,
    }),
    columnHelper.accessor('employeeId', {
      header: () => <span>Employé</span>,
      cell: ({ row }) => <p>{employees.find((e) => e.id === row.original.employeeId)?.firstName || ''}</p>,
    }),
    columnHelper.accessor('id', {
      header: () => <span>Actions</span>,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button className="!p-1" onClick={() => router.push('/orders/' + row.original.id)}>
            Continuer
          </Button>
          <Button className="!p-1" onClick={() => destroyOrder(row.original)} variant="red">
            <TrashIcon className="h-5 w-5" />
          </Button>
        </div>
      ),
    }),
  ];

  return (
    <>
      <Wrapper title={'Commandes'}>
        <div className="flex flex-col gap-10">
          <Card>
            <form onSubmit={createOrder} className="flex flex-col gap-5">
              <InputSelect
                value={currentEmployee || ''}
                onChange={(e) => setCurrentEmployee(e.target.value)}
                label="Employé"
                name="employeeId"
                id="employeeId"
              >
                {employees?.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </InputSelect>
              <Button type="submit" className="self-center text-xl">
                Commencer une nouvelle commande
              </Button>
            </form>
          </Card>

          <Card>
            <div>
              <h2 className="mb-3 text-lg font-bold">Commandes non validée</h2>
              <Table columns={columns} data={orders || []} loading={isLoading || itemsIsLoading} />
            </div>
          </Card>
        </div>
      </Wrapper>
    </>
  );
};

export const getServerSideProps = getLocaleProps;

export default OrdersPage;
