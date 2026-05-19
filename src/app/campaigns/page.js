import React from 'react';
import DeliveryManager from '@/components/DeliveryManager';

export const dynamic = 'force-dynamic';

async function getData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    const [lineItemsRes, ordersRes, adUnitsRes, advertisersRes] = await Promise.all([
      fetch(`${apiUrl}/api/admin/line-items`, { cache: 'no-store' }),
      fetch(`${apiUrl}/api/admin/orders`, { cache: 'no-store' }),
      fetch(`${apiUrl}/api/admin/ad-units`, { cache: 'no-store' }),
      fetch(`${apiUrl}/api/admin/advertisers`, { cache: 'no-store' })
    ]);

    if (!lineItemsRes.ok || !ordersRes.ok || !adUnitsRes.ok || !advertisersRes.ok) {
      throw new Error('Failed to fetch data');
    }

    return {
      lineItems: await lineItemsRes.json(),
      orders: await ordersRes.json(),
      adUnits: await adUnitsRes.json(),
      advertisers: await advertisersRes.json()
    };
  } catch (error) {
    console.error('Error fetching delivery data:', error);
    return { lineItems: [], orders: [], adUnits: [], advertisers: [] };
  }
}

export default async function CampaignsPage() {
  const { lineItems, orders, adUnits, advertisers } = await getData();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <DeliveryManager
        initialLineItems={lineItems}
        initialOrders={orders}
        adUnits={adUnits}
        advertisers={advertisers}
      />
    </div>
  );
}
