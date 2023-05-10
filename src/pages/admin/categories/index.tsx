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
import { Categories } from '@prisma/client';
import { InputText } from '@/components/inputs/InputText';
import { Button } from '@/components/inputs/Button';
import { Modal } from '@/components/layouts/Modal';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { useRestaurant } from '@/hooks/useRestaurant';

const Categories: NextPage = () => {
  const { data, isLoading, isError, refetch } = useCategories();
  const [editItem, setEditItem] = useState<Partial<Categories> | null>(null);
  const [destroyItem, setDestroyItem] = useState<Partial<Categories> | null>(null);
  const { data: restaurant } = useRestaurant();
  const deleteMutation = trpc.categories.destroy.useMutation();
  const updateMutation = trpc.categories.update.useMutation();
  const createMutation = trpc.categories.create.useMutation();
  console.log(restaurant);
  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(restaurant);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const item = {
      ...editItem,
      ...data,
      menuId: restaurant?.menuId,
      order: Number(data.order),
    };

    try {
      if (item.id === 'new') {
        delete item.id;
        await createMutation.mutateAsync(item);
      } else {
        await updateMutation.mutateAsync(item);
      }

      toast.success('Catégorie enregistrée');
      setEditItem(null);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue');
    }
  };

  const onDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Catégorie supprimée');
        setDestroyItem(null);
        refetch();
      },
      onError: (err) => {
        console.log(err);
        toast.error('Une erreur est survenue');
      },
    });
  };

  useEffect(() => {
    if (isError) {
      toast.error('Une erreur est survenue');
    }
  }, [isError]);

  const columnHelper = createColumnHelper<(typeof data)[0]>();

  const columns = [
    columnHelper.accessor('order', {
      header: () => <span>Ordre d'affichage</span>,
      cell: ({ row }) => <p>{row.original.order}</p>,
    }),
    columnHelper.accessor('name', {
      header: () => <span>Nom</span>,
      cell: ({ row }) => <p>{row.original.name}</p>,
    }),
    columnHelper.accessor('id', {
      header: () => <span>Actions</span>,
      cell: ({ row }) => {
        const resource = row.original;
        return (
          <div className="flex gap-2">
            <Button className="!p-1" onClick={() => setEditItem(resource)}>
              <PencilIcon className="h-5 w-5" />
            </Button>
            <Button className="!p-1" onClick={() => setDestroyItem(resource)} variant="red">
              <TrashIcon className="h-5 w-5" />
            </Button>
          </div>
        );
      },
    }),
  ];

  return (
    <>
      <Wrapper title={'Catégories'}>
        <Card>
          <div className="flex flex-col gap-5">
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  setEditItem({
                    id: 'new',
                    name: '',
                    color: '',
                    order: 1,
                  })
                }
              >
                Ajouter
              </Button>
            </div>

            <Table loading={isLoading} data={data} columns={columns} />
          </div>
        </Card>
      </Wrapper>

      {editItem && (
        <Modal title="Editer" onClose={() => setEditItem(null)}>
          <form className="flex flex-col gap-5" onSubmit={onEdit}>
            <InputText defaultValue={editItem.name} label="Nom" name="name" id={'name'} />
            <InputText
              type="number"
              defaultValue={editItem.order || 1}
              label="Ordre d'affichage"
              name="order"
              id={'order'}
            />
            <Button type="submit">Enregistrer</Button>
          </form>
        </Modal>
      )}

      {destroyItem && (
        <Modal title="Supprimer" onClose={() => setDestroyItem(null)}>
          <div className="flex flex-col gap-5">
            <p>Êtes-vous sûr de vouloir supprimer cette catégorie ?</p>
            <div className="flex gap-5">
              <Button onClick={() => setDestroyItem(null)}>Annuler</Button>
              <Button onClick={() => onDelete(destroyItem?.id || '')} variant="red">
                Supprimer
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export const getServerSideProps = getLocaleProps;

export default Categories;
