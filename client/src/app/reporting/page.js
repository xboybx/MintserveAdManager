import React from 'react';

export const dynamic = 'force-dynamic';

async function getReports() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/reports`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error('Failed');
    return res.json();
  } catch {
    return { impressions: 0, clicks: 0, revenue: 0 };
  }
}

async function getAllLineItems() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/line-items`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error('Failed');
    return res.json();
  } catch {
    return [];
  }
}

export default async function ReportingPage() {
  const [stats, lineItems] = await Promise.all([getReports(), getAllLineItems()]);

  const ctr =
    stats.impressions > 0
      ? ((stats.clicks / stats.impressions) * 100).toFixed(2)
      : '0.00';

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-normal text-[#202124]">Reporting</h2>
          <div className="text-sm text-[#5f6368] mt-1 flex items-center">
            <span>Reporting</span>
            <span className="material-icons text-xs mx-1">chevron_right</span>
            <span>Ad server</span>
          </div>
        </div>
        <button className="btn-primary flex items-center">
          <span className="material-icons text-sm mr-2">download</span>
          Export (CSV)
        </button>
      </header>

      {/* KPI Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Impressions', value: stats.impressions.toLocaleString(), icon: 'visibility' },
          { label: 'Total Clicks', value: stats.clicks.toLocaleString(), icon: 'ads_click' },
          { label: 'CTR', value: `${ctr}%`, icon: 'percent' },
          { label: 'Est. Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: 'attach_money', highlight: true },
        ].map(({ label, value, icon, highlight }) => (
          <div key={label} className="gam-card p-4 flex items-start space-x-3">
            <span className={`material-icons mt-0.5 ${highlight ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`}>{icon}</span>
            <div>
              <p className="text-xs text-[#5f6368] mb-1">{label}</p>
              <p className={`text-2xl font-normal ${highlight ? 'text-[#1a73e8]' : 'text-[#202124]'}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Table by Line Item */}
      <div className="gam-card overflow-hidden">
        <div className="p-4 border-b border-[#dadce0]">
          <h3 className="text-base font-medium text-[#202124]">Performance by Line Item</h3>
          <p className="text-xs text-[#5f6368] mt-1">Showing pacing and delivery data for all campaigns</p>
        </div>

        <table className="w-full gam-table">
          <thead className="bg-[#f8f9fa]">
            <tr>
              <th>Line Item Name</th>
              <th>Goal Type</th>
              <th>Total Limit</th>
              <th>Delivered</th>
              <th>Pacing</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-[#5f6368]">
                  No campaigns found. Create a line item to see data here.
                </td>
              </tr>
            ) : (
              lineItems.map((item) => {
                const pct = item.totalLimit > 0
                  ? Math.min((item.delivered / item.totalLimit) * 100, 100)
                  : 0;
                return (
                  <tr key={item._id} className="hover:bg-[#f1f3f4] transition-colors">
                    <td className="font-medium text-[#1a73e8]">{item.name}</td>
                    <td>{item.goalType}</td>
                    <td>{item.totalLimit?.toLocaleString()}</td>
                    <td>{item.delivered?.toLocaleString()}</td>
                    <td>
                      <div className="w-32">
                        <div className="bg-[#dadce0] rounded-full h-1.5 overflow-hidden w-full">
                          <div
                            className="bg-[#1a73e8] h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[#5f6368] mt-0.5 block">{pct.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        item.status === 'Active' ? 'bg-green-100 text-green-800' :
                        item.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="p-3 border-t border-[#dadce0] flex justify-end items-center text-sm text-[#5f6368]">
          <span className="mr-4">1–{lineItems.length} of {lineItems.length}</span>
          <span className="material-icons opacity-40 mr-2 cursor-not-allowed">chevron_left</span>
          <span className="material-icons opacity-40 cursor-not-allowed">chevron_right</span>
        </div>
      </div>
    </div>
  );
}
