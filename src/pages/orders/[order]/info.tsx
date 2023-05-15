import type { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { Support } from '@/components/settings/Support';
import { Wrapper } from '@/components/layouts/Wrapper';
import { getLocaleProps } from '@/utils/locales';
import { useRouter } from 'next/router';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/inputs/Button';

import React, { useState } from 'react';
import { Card } from '@/components/layouts/Card';

const Settings: NextPage = () => {
  const t = useTranslations();
  const router = useRouter();
  const orderId = router.query.order as string;
  const { data: order, isLoading: orderIsLoading } = trpc.orders.getOne.useQuery(orderId);

  const print = (base64Pdf: string) => {
    const byteCharacters = atob(base64Pdf);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const pdfBlob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });

    // Create a new URL for the PDF file
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const iframe = document.createElement('iframe');
    iframe.src = pdfUrl;
    iframe.width = '100%';
    iframe.height = '100%';
    document.body.appendChild(iframe);
    iframe.style.display = 'none';

    // Wait for the iframe to load
    iframe.addEventListener('load', async () => {
      // Print the document
      iframe.contentWindow?.print();
    });
  };
  return (
    <Wrapper title={t('navigation.settings')}>
      <div className="flex flex-col gap-5">
        <h1 className="w-full text-center text-3xl font-bold">Commande #{order?.number}</h1>

        <Card>
          <div className="flex flex-row justify-around gap-2">
            <Button onClick={() => print(order?.pdfBase64)}>Imprimer</Button>
            <Button onClick={() => router.push(`/orders/`)}>Commande suivante</Button>
          </div>
        </Card>

        <Card className="bor">
          {order?.pdfBase64 && (
            <iframe src={`data:application/pdf;base64,${order.pdfBase64}`} width="100%" height="600px" />
          )}
        </Card>
      </div>
    </Wrapper>
  );
};

export const getServerSideProps = getLocaleProps;

export default Settings;
