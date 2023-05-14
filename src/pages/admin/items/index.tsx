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
import { useRestaurant } from '@/hooks/useRestaurant';
import { useGroups } from '@/hooks/useGroups';

const Menu: NextPage = () => {
  const { data, isLoading, isError, refetch } = useItems();
  const { data: categories } = useCategories();
  const [editItem, setEditItem] = useState<Partial<Items> | null>(null);
  const [destroyItem, setDestroyItem] = useState<Partial<Items> | null>(null);
  const { data: restaurant } = useRestaurant();
  const { data: groups } = useGroups();
  const deleteMutation = trpc.items.destroy.useMutation();
  const updateMutation = trpc.items.update.useMutation();
  const createMutation = trpc.items.create.useMutation();

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const item = {
      ...editItem,
      ...data,
      menuId: restaurant?.menuId,
      price: parseFloat(data.price as string),
      promotion: parseFloat(data.promotion as string),
      tvaPercent: parseFloat(data.tvaPercent as string),
      groupId: data.groupId !== '' ? data.groupId : null,
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
    columnHelper.accessor('groupId', {
      header: () => <span>Menu</span>,
      cell: ({ row }) => (
        <>
          {!row.original.groupId && <Tag className="!bg-yellow-200 !text-yellow-600">Seul</Tag>}
          {row.original.groupId && (
            <Tag className="!bg-green-200 !text-green-600">
              {groups.find((g) => g.id === row.original.groupId)?.name}
            </Tag>
          )}
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Nourriture</h2>
              <Button
                onClick={() =>
                  setEditItem({
                    id: 'new',
                    name: '',
                    description: '',
                    price: 0,
                    promotion: 0,
                    categoryId: '',
                    groupId: null,
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
              defaultValue={editItem.price || '1.00'}
              label="Prix"
              name="price"
              id={'price'}
              type="text"
              placeholder="1.00"
              pattern="[0-9]+(\.[0-9]+)?"
            />
            <InputSelect defaultValue={editItem.categoryId} label="Catégorie" name="categoryId" id={'categoryId'}>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </InputSelect>

            <InputSelect defaultValue={editItem.groupId} label="Menu" name="groupId" id={'groupId'}>
              <option value="">{'Seul'}</option>
              {groups?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
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

            <InputSelect
              defaultValue={editItem.tvaPercent?.toString() || '10'}
              id="tvaPercent"
              name="tvaPercent"
              label="% de TVA"
            >
              <option value="10">10%</option>
              <option value="20">20%</option>
              <option value="5">5%</option>
            </InputSelect>

            <InputText defaultValue={editItem.imageUrl || ''} label="Url de l'image" name="imageUrl" id={'imageUrl'} />

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
