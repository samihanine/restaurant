import type { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { Wrapper } from '@/components/layouts/Wrapper';
import { getLocaleProps } from '@/utils/locales';
import { Card } from '@/components/layouts/Card';
import Link from 'next/link';
import { Button } from '@/components/inputs/Button';
import { useRestaurantId } from '@/hooks/useRestaurantId';

const Dashboard: NextPage = () => {
  const t = useTranslations();
  const id = useRestaurantId();

  console.log(id);

  return (
    <Wrapper title={t('navigation.dashboard')}>
      <Card>
        <Button>
          <Link href="/admin/orders">Nouvelle commande</Link>
        </Button>
      </Card>
    </Wrapper>
  );
};

export const getServerSideProps = getLocaleProps;

export default Dashboard;
