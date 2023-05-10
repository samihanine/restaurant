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
import type { Groups, GroupsOptions } from '@prisma/client';
import { InputText } from '@/components/inputs/InputText';
import { Button } from '@/components/inputs/Button';
import { Modal } from '@/components/layouts/Modal';
import { CheckIcon, PencilIcon, PlusIcon, SaveIcon, TrashIcon } from '@heroicons/react/outline';
import { useGroups } from '@/hooks/useGroups';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useCategories } from '@/hooks/useCategories';
import { group } from 'console';
import { Separator } from '@/components/ui/Separator';
import { InputSelect } from '@/components/inputs/InputSelect';
import { ButtonCircle } from '@/components/inputs/ButtonCircle';
import { ca } from 'date-fns/locale';
import { InputSwitch } from '@/components/inputs/InputSwitch';
import { InputPrice } from '@/components/inputs/InputPrice';

const Groups: NextPage = () => {
  const { data, isLoading, isError, refetch } = useGroups();
  const [editItem, setEditItem] = useState<Partial<
    Groups & {
      groupsOptions: GroupsOptions[];
    }
  > | null>(null);
  const [destroyItem, setDestroyItem] = useState<Partial<
    Groups & {
      groupsOptions: GroupsOptions[];
    }
  > | null>(null);
  const { data: restaurant } = useRestaurant();
  const { data: categories } = useCategories();
  const deleteMutation = trpc.groups.destroy.useMutation();
  const updateMutation = trpc.groups.update.useMutation();
  const createMutation = trpc.groups.create.useMutation();

  const createOptionMutation = trpc.groups.addGroupOptions.useMutation();
  const updateOptionMutation = trpc.groups.updateGroupOptions.useMutation();
  const deleteOptionMutation = trpc.groups.destroyGroupOptions.useMutation();

  useEffect(() => {
    if (editItem) {
      const newItem = data?.find((item) => item.id === editItem.id);
      if (newItem) {
        setEditItem(newItem);
      }
    }
  }, [editItem, data]);

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const item = {
      ...editItem,
      ...data,
      menuId: restaurant?.menuId || '',
    };

    try {
      if (item.id === 'new') {
        delete item.id;
        await createMutation.mutateAsync(item);
      } else {
        await updateMutation.mutateAsync(item);
      }

      toast.success('Menu enregistré');
      setEditItem(null);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue');
    }
  };

  const updateGroupsOptions = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());

      const item = {
        ...data,
        groupId: editItem?.id || '',
        categoryId: (data.categoryId as string) || '',
        required: data.required === 'on',
        multiple: data.multiple === 'on',
        addonPrice: parseFloat(data.addonPrice as string),
      };
      await updateOptionMutation.mutateAsync(item);
      await refetch();
      toast.success('Section enregistrée');
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue');
    }
  };

  const createGroupsOptions = async () => {
    try {
      await createOptionMutation.mutateAsync({
        name: '',
        groupId: editItem?.id as string,
        categoryId: categories?.[0]?.id as string,
        multiple: false,
        addonPrice: 0,
        required: false,
      });
      await refetch();
      toast.success('Section enregistrée');
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue');
    }
  };

  const deleteGroupsOptions = async (id: string) => {
    try {
      await deleteOptionMutation.mutateAsync(id);
      await refetch();
      toast.success('Section supprimée');
    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue');
    }
  };

  const onDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Menu supprimé');
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
      header: () => <span>Nom du menu</span>,
      cell: ({ row }) => <p>{row.original.name}</p>,
    }),
    columnHelper.accessor('id', {
      header: () => <span>Nombre de sections</span>,
      cell: ({ row }) => <p>{row.original.groupsOptions.length}</p>,
    }),
    columnHelper.accessor('id', {
      header: () => <span>Actions</span>,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            className="!p-1"
            onClick={() => {
              setEditItem(row.original);
            }}
          >
            <PencilIcon className="h-5 w-5" />
          </Button>
          <Button className="!p-1" onClick={() => setDestroyItem(row.original)} variant="red">
            <TrashIcon className="h-5 w-5" />
          </Button>
        </div>
      ),
    }),
  ];

  return (
    <>
      <Wrapper title={'Menu'}>
        <Card>
          <div className="flex flex-col gap-5">
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  setEditItem({
                    id: 'new',
                    name: '',
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
            <InputText defaultValue={editItem.name} label="Nom du menu" name="name" id={'name'} />
            <Button type="submit">Enregistrer</Button>
          </form>
          <Separator />
          {editItem?.groupsOptions?.map((option, index) => (
            <React.Fragment key={option.id}>
              <form key={index} onSubmit={updateGroupsOptions} className="flex flex-col gap-3">
                <input className="hidden" type="hidden" name="id" defaultValue={option.id} />
                <InputSelect
                  defaultValue={option.categoryId}
                  label={`Catégorie lié`}
                  name={`categoryId`}
                  id={`categoryId`}
                >
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </InputSelect>
                <div className="flex items-center justify-between gap-2">
                  <InputPrice
                    defaultValue={option.addonPrice?.toString()}
                    label="Prix"
                    name="addonPrice"
                    id={'addonPrice'}
                    className="w-20"
                  />

                  <InputSwitch checked={option.required} label={`Obligatoire`} name={`required`} id={`required`} />
                  <InputSwitch checked={option.multiple} label={`Multiple`} name={`multiple`} id={`multiple`} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="!p-2">
                    <CheckIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => {
                      deleteGroupsOptions(option.id);
                    }}
                    type="button"
                    variant="red"
                    className="!p-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              </form>
              <Separator />
            </React.Fragment>
          ))}
          <Button className="p-1" type="button" onClick={createGroupsOptions}>
            <PlusIcon className="h-4 w-4" /> Ajouter une section
          </Button>
        </Modal>
      )}

      {destroyItem && (
        <Modal title="Supprimer" onClose={() => setDestroyItem(null)}>
          <div className="flex flex-col gap-5">
            <p>Êtes-vous sûr de vouloir supprimer ce menu ?</p>
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

export default Groups;
