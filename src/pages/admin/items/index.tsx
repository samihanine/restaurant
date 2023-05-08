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
import type { Items } from '@prisma/client';
import { InputText } from '@/components/inputs/InputText';
import { Button } from '@/components/inputs/Button';
import { Modal } from '@/components/layouts/Modal';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { useItems } from '@/hooks/useItems';
import { InputSelect } from '@/components/inputs/InputSelect';
import { useCategories } from '@/hooks/useCategories';
import { InputSwitch } from '@/components/inputs/InputSwitch';
import { Tag } from '@/components/ui/Tag';

const Menu: NextPage = () => {
  const { data, isLoading, isError, refetch } = useItems();
  const { data: categories } = useCategories();
  const [editItem, setEditItem] = useState<Partial<Items> | null>(null);
  const [destroyItem, setDestroyItem] = useState<Partial<Items> | null>(null);
  const restaurantId = useRestaurantId();
  const deleteMutation = trpc.items.destroy.useMutation();
  const updateMutation = trpc.items.update.useMutation();
  const createMutation = trpc.items.create.useMutation();

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    console.log(data);
    const item = {
      ...editItem,
      ...data,
      restaurantId,
      price: parseFloat(data.price as string),
      promotion: parseFloat(data.promotion as string),
    };

    try {
      if (item.id === 'new') {
        delete item.id;
        await createMutation.mutateAsync(item);
      } else {
        await updateMutation.mutateAsync(item);
      }

      toast.success('Menu enregistrée');
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
        toast.success('Menu supprimée');
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
    columnHelper.accessor('name', {
      header: () => <span>Nom</span>,
      cell: ({ row }) => <p>{row.original.name}</p>,
    }),
    columnHelper.accessor('type', {
      header: () => <span>Type</span>,
      cell: ({ row }) => (
        <>
          {row.original.type === 'REGULAR' && <Tag className="!bg-yellow-200 !text-yellow-600">Nourriture</Tag>}
          {row.original.type === 'MENU' && <Tag className="!bg-green-200 !text-green-600">Menu</Tag>}
          {row.original.type === 'DRINK' && <Tag className="!bg-blue-200 !text-blue-600">Boisson</Tag>}
          {row.original.type === 'SAUCE' && <Tag className="!bg-red-200 !text-red-600">Sauce</Tag>}
        </>
      ),
    }),
    columnHelper.accessor('price', {
      header: () => <span>Prix</span>,
      cell: ({ row }) => <p>{row.original.price}</p>,
    }),
    columnHelper.accessor('imageUrl', {
      header: () => <span>Image</span>,
      cell: ({ row }) => (
        <div>
          <img
            src={row.original.imageUrl || 'https://www.iconpacks.net/icons/1/free-restaurant-icon-952-thumb.png'}
            alt={row.original.name}
            className="h-10 w-10"
          />
        </div>
      ),
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
      <Wrapper title={'Elément'}>
        <Card>
          <div className="flex flex-col gap-5">
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  setEditItem({
                    id: 'new',
                    name: '',
                    description: '',
                    price: 0,
                    promotion: 0,
                    categoryId: '',
                    type: 'REGULAR',
                    outOfStock: false,
                    imageUrl: '',
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
          <form className="flex flex-col gap-2" onSubmit={onEdit}>
            <InputText defaultValue={editItem.name} label="Nom" name="name" id={'name'} />
            <InputText defaultValue={editItem.description} label="Description" name="description" id={'description'} />
            <InputText
              defaultValue={editItem.price || 0}
              label="Prix"
              name="price"
              id={'price'}
              type="text"
              pattern="[0-9]+(\.[0-9]+)?"
            />
            <InputSelect defaultValue={editItem.categoryId} label="Catégorie" name="categoryId" id={'categoryId'}>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </InputSelect>
            <InputSelect defaultValue={editItem.type} label="Type" name="type" id={'type'}>
              <option value="REGULAR">Nourriture</option>
              <option value="MENU">Menu</option>
              <option value="DRINK">Boisson</option>
              <option value="SAUCE">Sauce</option>
            </InputSelect>
            <InputSwitch
              checked={editItem.outOfStock || false}
              onChange={(checked) => setEditItem({ ...editItem, outOfStock: checked })}
              label="En rupture de stock ?"
              name="outOfStock"
              id={'outOfStock'}
            />

            <InputText
              defaultValue={editItem.promotion}
              label="Promotion (mettre 3 pour une promotion de -3 euros)"
              name="promotion"
              id={'promotion'}
              type="number"
            />
            <InputText defaultValue={editItem.imageUrl} label="Url de l'image" name="imageUrl" id={'imageUrl'} />

            <Button className="mt-5" type="submit">
              Enregistrer
            </Button>
          </form>
        </Modal>
      )}

      {destroyItem && (
        <Modal title="Supprimer" onClose={() => setDestroyItem(null)}>
          <div className="flex flex-col gap-5">
            <p>Êtes-vous sûr de vouloir supprimer cet élément ?</p>
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

export default Menu;
