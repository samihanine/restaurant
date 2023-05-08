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
import type { Employees } from '@prisma/client';
import { InputText } from '@/components/inputs/InputText';
import { Button } from '@/components/inputs/Button';
import { Modal } from '@/components/layouts/Modal';
import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { useEmployees } from '@/hooks/useEmployees';

const Employees: NextPage = () => {
  const { data, isLoading, isError, refetch } = useEmployees();
  const [editItem, setEditItem] = useState<Partial<Employees> | null>(null);
  const [destroyItem, setDestroyItem] = useState<Partial<Employees> | null>(null);
  const restaurantId = useRestaurantId();
  const deleteMutation = trpc.employees.destroy.useMutation();
  const updateMutation = trpc.employees.update.useMutation();
  const createMutation = trpc.employees.create.useMutation();

  const onEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const item = {
      ...editItem,
      ...data,
      restaurantId,
    };

    try {
      if (item.id === 'new') {
        delete item.id;
        await createMutation.mutateAsync(item);
      } else {
        await updateMutation.mutateAsync(item);
      }

      toast.success('Employé enregistré');
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
        toast.success('Employé supprimé');
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
    columnHelper.accessor('firstName', {
      header: () => <span>Prénom</span>,
      cell: ({ row }) => <p>{row.original.firstName}</p>,
    }),
    columnHelper.accessor('lastName', {
      header: () => <span>Nom</span>,
      cell: ({ row }) => <p>{row.original.lastName}</p>,
    }),
    columnHelper.accessor('id', {
      header: () => <span>Actions</span>,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button className="!p-1" onClick={() => setEditItem(row.original)}>
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
      <Wrapper title={'Employés'}>
        <Card>
          <div className="flex flex-col gap-5">
            <div className="flex justify-end">
              <Button
                onClick={() =>
                  setEditItem({
                    id: 'new',
                    firstName: '',
                    lastName: '',
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
            <InputText defaultValue={editItem.firstName} label="Prénom" name="firstName" id={'firstName'} />
            <InputText defaultValue={editItem.lastName} label="Nom" name="lastName" id={'lastName'} />
            <Button type="submit">Enregistrer</Button>
          </form>
        </Modal>
      )}

      {destroyItem && (
        <Modal title="Supprimer" onClose={() => setDestroyItem(null)}>
          <div className="flex flex-col gap-5">
            <p>Êtes-vous sûr de vouloir supprimer cette employé ?</p>
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

export default Employees;
