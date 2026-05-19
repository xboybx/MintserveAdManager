import React from 'react';
import DashboardChart from '@/components/DashboardChart';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/reports`, { 
      cache: 'no-store' 
    });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  } catch (error) {
    return { impressions: 0, clicks: 0, revenue: 0, daily: [] };
  }
}

export default async function Dashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-normal text-[#202124]">Home</h2>
        <div className="flex space-x-2">
          <button className="btn-secondary flex items-center">
            <span className="material-icons text-sm mr-2">calendar_today</span>
            Last 14 days
          </button>
        </div>
      </header>

      <div className="gam-card p-6 mb-6">
        <h3 className="text-lg font-medium text-[#202124] mb-4 border-b border-[#dadce0] pb-2">Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#dadce0]">
          
          <div className="p-4 flex flex-col justify-center">
            <h4 className="text-sm font-medium text-[#5f6368] mb-1 flex items-center">
              Total Revenue
              <span className="material-icons text-[#1a73e8] text-sm ml-1" title="Estimated Revenue">info_outline</span>
            </h4>
            <p className="text-3xl font-normal text-[#1a73e8]">
              ${stats.revenue.toFixed(2)}
            </p>
            <span className="text-xs text-green-600 mt-2 flex items-center">
              <span className="material-icons text-xs mr-1">arrow_upward</span>
              14-day dynamic telemetry
            </span>
          </div>

          <div className="p-4 flex flex-col justify-center">
            <h4 className="text-sm font-medium text-[#5f6368] mb-1 flex items-center">
              Total Impressions
            </h4>
            <p className="text-3xl font-normal text-[#202124]">
              {stats.impressions.toLocaleString()}
            </p>
            <span className="text-xs text-[#5f6368] mt-2">
              Ad server impressions
            </span>
          </div>

          <div className="p-4 flex flex-col justify-center">
            <h4 className="text-sm font-medium text-[#5f6368] mb-1 flex items-center">
              Total Clicks
            </h4>
            <p className="text-3xl font-normal text-[#202124]">
              {stats.clicks.toLocaleString()}
            </p>
            <span className="text-xs text-[#5f6368] mt-2">
              Ad server clicks
            </span>
          </div>

        </div>
      </div>
      
      {/* Real-time Performance Chart */}
      <div className="gam-card p-6">
        <h3 className="text-sm font-medium text-[#5f6368] mb-4">Daily Performance (Impressions & Clicks)</h3>
        <div className="w-full" style={{ height: '300px' }}>
          {stats.daily && stats.daily.length > 0 ? (
            <DashboardChart dailyData={stats.daily} />
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-[#dadce0] rounded">
              <div className="text-center">
                <span className="material-icons text-4xl text-[#dadce0] mb-2">show_chart</span>
                <p className="text-[#5f6368] text-sm">No historical tracking records found. Try seeding data.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
