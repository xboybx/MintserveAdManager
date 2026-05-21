import React from 'react';
import InventoryManager from '@/components/InventoryManager';

export const dynamic = 'force-dynamic';

async function getAdUnits() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/ad-units`, { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    console.error('Error fetching ad units:', error);
    return [];
  }
}

export default async function InventoryPage() {
  const adUnits = await getAdUnits();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <InventoryManager initialAdUnits={adUnits} />
    </div>
  );
}
