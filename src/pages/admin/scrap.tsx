import React, { useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Table } from '@/components/ui/Table';
import type { NextPage } from 'next';
import { Wrapper } from '@/components/layouts/Wrapper';
import { getLocaleProps } from '@/utils/locales';
import { Card } from '@/components/layouts/Card';

import { useOrders } from '@/hooks/useOrders';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/inputs/Button';
import { parse } from 'papaparse';
import { trpc } from '@/utils/trpc';
import { useRestaurantId } from '@/hooks/useRestaurantId';
import toast from 'react-hot-toast';
import { useRestaurant } from '@/hooks/useRestaurant';

const History: NextPage = () => {
  const { data, isLoading, isError, refetch } = useOrders();
  const columnHelper = createColumnHelper<(typeof data)[0]>();
  const createMutation = trpc.items.create.useMutation();
  const restaurant = useRestaurant();

  // Function to convert CSV to JSON

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const groupId = data.groupId !== '' ? data.groupId : null;
    const json = JSON.parse(data.json as string);
    const categoryId = data.categoryId !== '' ? data.categoryId : null;

    console.log(json);
    console.log(groupId);
    console.log(categoryId);

    const items = json.map((item: any) => ({
      name: item.name,
      price: parseFloat(item.price.replace(',', '.')),
      tvaPercent: 10,
      promotion: 0,
      groupId: groupId,
      categoryId: categoryId,
      menuId: restaurant.data?.menuId,
      description: item.description,
    }));

    for (const item of items) {
      await createMutation.mutateAsync(item);
    }

    toast.success('Menu enregistrée');
  };

  return (
    <>
      <Wrapper title={'Catégories'}>
        <Card>
          <h2 className="text-2xl font-bold text-primary">Historique</h2>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <label>Category</label>
            <input name="categoryId" />
            <label>Group</label>
            <input name="groupId" />

            <label>Json</label>
            <textarea name="json" />

            <Button type="submit">Ajouter</Button>
          </form>
        </Card>
      </Wrapper>
    </>
  );
};

export const getServerSideProps = getLocaleProps;

export default History;
