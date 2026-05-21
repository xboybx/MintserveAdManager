import React from 'react';
import AdminManager from '@/components/AdminManager';

export const dynamic = 'force-dynamic';

async function getAdvertisers() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/advertisers`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error('Failed');
    return res.json();
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const advertisers = await getAdvertisers();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h2 className="text-2xl font-normal text-[#202124]">Admin</h2>
        <div className="text-sm text-[#5f6368] mt-1 flex items-center">
          <span>Admin</span>
          <span className="material-icons text-xs mx-1">chevron_right</span>
          <span>Global Settings & Advertisers</span>
        </div>
      </header>

      {/* Admin Manager (KPIs + Advertiser CRUD table) */}
      <AdminManager initialAdvertisers={advertisers} />

      {/* API Reference Card */}
      <div className="gam-card p-6 mt-6">
        <h3 className="text-base font-medium text-[#202124] mb-4 flex items-center">
          <span className="material-icons mr-2 text-[#5f6368]">api</span>
          Ad Tag / API Reference
        </h3>
        <p className="text-sm text-[#5f6368] mb-3">
          Use this endpoint from any publisher website to serve ads from your network:
        </p>
        <div className="bg-[#f8f9fa] border border-[#dadce0] rounded p-4 font-mono text-sm text-[#202124] overflow-x-auto">
          GET {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/serve?adUnitId=&#123;ID&#125;&device=Desktop&geo=US
        </div>
        <p className="text-xs text-[#5f6368] mt-3">
          Tracking pixel fires automatically on impression. Click tracking redirects to the advertiser's landing page.
        </p>
      </div>
    </div>
  );
}
