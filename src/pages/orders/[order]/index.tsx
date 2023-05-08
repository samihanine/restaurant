import React from 'react';
import type { NextPage } from 'next';
import { Wrapper } from '@/components/layouts/Wrapper';
import { getLocaleProps } from '@/utils/locales';
import { Card } from '@/components/layouts/Card';
import { useRestaurantId } from '@/hooks/useRestaurantId';
import { useCategories } from '@/hooks/useCategories';
import type { Items, OrdersItems } from '@prisma/client';
import { useItems } from '@/hooks/useItems';
import { useRouter } from 'next/router';
import { trpc } from '@/utils/trpc';
import { Modal } from '@/components/layouts/Modal';
import { InputSelect } from '@/components/inputs/InputSelect';
import { ButtonCircle } from '@/components/inputs/ButtonCircle';
import { Button } from '@/components/inputs/Button';
import { toast } from 'react-hot-toast';
import { InputSelectMultiple } from '@/components/inputs/InputSelectMultiple';

const ItemsCard = ({ item, quantity = 0 }: { item: Items; quantity?: number }) => (
  <Card
    className={`!p-1 hover:cursor-pointer hover:shadow-lg ${
      Boolean(quantity) ? 'border-2 border-l-4 border-primary' : ''
    }`}
  >
    <div key={item.id} className="flex flex-row items-center justify-between">
      <div className="flex flex-1 flex-col gap-1 p-2">
        <p className="flex items-center gap-2">
          <span className="overflow-ellipsis text-lg font-bold">
            {Boolean(quantity) && <span className="mr-2 text-base font-medium text-primary">x{quantity}</span>}
            {item.name} ({item.price}€)
          </span>
        </p>

        <span className="w-full overflow-hidden overflow-ellipsis text-sm">{item.description}</span>
      </div>
      <div className="flex w-20">
        <img
          src={item.imageUrl || 'https://www.iconpacks.net/icons/1/free-restaurant-icon-952-thumb.png'}
          className="h-20 object-cover p-1"
          alt={item.name}
        />
      </div>
    </div>
  </Card>
);

const ItemCart = ({
  orderItem,
  updateQuantity,
  orderChilds = [],
}: {
  orderItem: OrdersItems;
  orderChilds?: OrdersItems[];
  quantity?: number;
  updateQuantity: (orderItem: OrdersItems, quantity: number) => void;
}) => {
  console.log(orderItem, orderChilds);
  return (
    <>
      <div className="flex w-full justify-between">
        <div className="text-xl font-bold">
          {orderItem.item.name} ({orderItem.item.price}€)
        </div>
        <div className="flex gap-3">
          <ButtonCircle
            className="!h-7 text-xl font-bold"
            onClick={() => updateQuantity(orderItem, orderItem.quantity - 1)}
          >
            -
          </ButtonCircle>
          <span className="font-bold">{orderItem.quantity}</span>
          <ButtonCircle
            className="!h-7 text-xl font-bold"
            onClick={() => updateQuantity(orderItem, orderItem.quantity + 1)}
          >
            +
          </ButtonCircle>
        </div>
      </div>
      {orderChilds.length > 0 && (
        <div className="ml-3 flex gap-1">
          {orderChilds.map((orderItemChild, index) => (
            <div key={orderItemChild.id} className="">
              {orderItemChild.item.name} {index !== orderChilds.length - 1 && ' + '}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const Orders: NextPage = () => {
  const router = useRouter();
  const orderId = router.query.order as string;
  const { data, isLoading } = useCategories();
  const { data: items, isLoading: itemsIsLoading } = useItems();
  const restaurantId = useRestaurantId();
  const { data: ordersItems, refetch } = trpc.itemsOrders.getAllByOrderId.useQuery(orderId);
  const updateItemsOrders = trpc.itemsOrders.update.useMutation();
  const createItemsOrders = trpc.itemsOrders.create.useMutation();
  const destroyItemsOrders = trpc.itemsOrders.destroy.useMutation();
  const [selectedItem, setSelectedItem] = React.useState<Items | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  const updateQuantity = async (itemsOrders: OrdersItems, quantityValue: number) => {
    try {
      const idLoading = toast.loading('Loading...');

      if (quantityValue === 0) {
        await destroyItemsOrders.mutateAsync(itemsOrders.id);
      } else {
        await updateItemsOrders.mutateAsync({ ...itemsOrders, orderId, quantity: quantityValue });
      }

      await refetch();

      toast.remove(idLoading);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const drinkId = formData.get('drinkId') as string;
    const saucesId = (formData.get('saucesId') as string) || '';
    const sauceArray = saucesId
      .split(',')
      .filter(Boolean)
      .filter((sauce) => sauce !== '' && sauce !== 'undefined');

    if (!selectedItem) {
      return;
    }

    const idLoading = toast.loading('Loading...');

    const newOrder = await createItemsOrders.mutateAsync({
      orderId,
      itemId: selectedItem.id,
      quantity,
      parentItemOrderId: null,
      price: selectedItem.price,
    });

    if (selectedItem.type === 'MENU') {
      await createItemsOrders.mutateAsync({
        orderId,
        itemId: drinkId,
        quantity,
        parentItemOrderId: newOrder.id,
        price: 0,
      });

      for (const sauceId of sauceArray) {
        await createItemsOrders.mutateAsync({
          orderId,
          itemId: sauceId,
          quantity,
          parentItemOrderId: newOrder.id,
          price: 0,
        });
      }
    }

    await refetch();

    setSelectedItem(null);
    setQuantity(1);
    toast.remove(idLoading);
  };

  console.log(ordersItems);

  return (
    <>
      <Wrapper>
        <Card className="mb-4 flex w-full max-w-full justify-end border-b border-gray-300 bg-white">
          <h2 className="text-xl font-bold text-primary">Panier de la commande</h2>
          <div className="flex flex-col gap-2">
            {ordersItems
              ?.sort((a, b) => a.createdAt - b.createdAt)
              .filter((orderItem) => !orderItem.parentItemOrderId)
              .map((orderItem) => (
                <ItemCart
                  key={orderItem.id}
                  orderItem={orderItem}
                  updateQuantity={updateQuantity}
                  orderChilds={ordersItems
                    ?.sort((a, b) => a.createdAt - b.createdAt)
                    .filter((orderItemChild) => orderItemChild.parentItemOrderId === orderItem.id)}
                />
              ))}
          </div>
          <div className="self-end text-xl font-bold">
            Total: {ordersItems?.reduce((acc, curr) => acc + curr.price * curr.quantity, 0)}€
          </div>
          <Button disabled={!Boolean(ordersItems?.length)} className="self-center text-lg">
            Valider la commande
          </Button>
        </Card>
        <div className="flex flex-col gap-5">
          {data?.map((category) => (
            <div key={category.id} className="flex flex-col">
              <h2 className="mb-3 text-xl font-semibold">{category.name}</h2>
              <div className="flex flex-col gap-2">
                {items
                  .filter((item) => item.categoryId === category.id)
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div key={item.id} onClick={() => setSelectedItem(item)}>
                      <ItemsCard
                        quantity={ordersItems?.reduce(
                          (acc, curr) => (curr.itemId === item.id ? acc + curr.quantity : acc),
                          0
                        )}
                        item={item}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Wrapper>
      {selectedItem && (
        <Modal onClose={() => setSelectedItem(null)} title={'Ajouter au panier'}>
          <form className="flex flex-col gap-5" onSubmit={handleSubmitItem}>
            <div className="flex w-full items-center justify-center gap-4">
              <ButtonCircle
                type="button"
                className="!w-10 text-xl font-bold"
                onClick={() => setQuantity((old) => old - 1)}
              >
                -
              </ButtonCircle>
              <span className="text-xl">{quantity}</span>

              <ButtonCircle
                type="button"
                className="!w-10 text-xl font-bold"
                onClick={() => setQuantity((old) => old + 1)}
              >
                +
              </ButtonCircle>
            </div>

            {selectedItem.type === 'MENU' && (
              <>
                <InputSelectMultiple
                  options={items
                    .filter((item) => item.type === 'SAUCE')
                    .map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  id={'saucesId'}
                  label={'Sauces'}
                  name={'saucesId'}
                ></InputSelectMultiple>
                <InputSelect id={'drinkId'} label={'Boisson'} name={'drinkId'}>
                  {items
                    .filter((item) => item.type === 'DRINK')
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </InputSelect>
              </>
            )}

            <Button className="self-center" type="submit">
              Ajouter
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
};

export const getServerSideProps = getLocaleProps;

export default Orders;
