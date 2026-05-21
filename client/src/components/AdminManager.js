'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreateAdvertiser from './CreateAdvertiser';

export default function AdminManager({ initialAdvertisers = [] }) {
  const router = useRouter();
  const [advertisers, setAdvertisers] = useState(initialAdvertisers);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit State
  const [editingAdvertiser, setEditingAdvertiser] = useState(null);

  // Sync server data updates
  useEffect(() => {
    setAdvertisers(initialAdvertisers);
  }, [initialAdvertisers]);

  const handleDeleteAdvertiser = async (id) => {
    if (!confirm('Are you sure you want to delete this advertiser? All related campaigns and orders will be paused.')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/advertisers/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setAdvertisers(advertisers.filter(item => item._id !== id));
      router.refresh();
    }
  };

  const filteredAdvertisers = advertisers.filter(adv => 
    adv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    adv.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Advertisers', value: advertisers.length, icon: 'business', color: 'text-[#1a73e8]' },
          { label: 'Network Name', value: 'Mintserve', icon: 'dns', color: 'text-[#5f6368]' },
          { label: 'Environment', value: process.env.NODE_ENV || 'development', icon: 'code', color: 'text-[#5f6368]' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="gam-card p-4 flex items-center space-x-4">
            <span className={`material-icons text-2xl ${color}`}>{icon}</span>
            <div>
              <p className="text-xs text-[#5f6368]">{label}</p>
              <p className="text-lg font-medium text-[#202124]">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Advertisers list */}
      <div className="gam-card overflow-hidden">
        <div className="p-4 border-b border-[#dadce0] flex flex-wrap gap-4 items-center justify-between bg-[#f8f9fa]">
          <div className="flex items-center space-x-3 flex-1 max-w-md">
            {/* Search Input */}
            <div className="relative flex items-center flex-1">
              <span className="material-icons absolute left-3 text-[#5f6368] text-base pointer-events-none">search</span>
              <input
                type="text"
                placeholder="Search advertisers by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-styled py-1.5 text-xs"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>
          <div className="text-xs text-[#5f6368] font-medium">
            Found {filteredAdvertisers.length} advertisers
          </div>
        </div>

        <table className="w-full gam-table">
          <thead className="bg-[#f8f9fa]">
            <tr>
              <th className="w-10 text-center"><input type="checkbox" className="rounded border-[#dadce0]" /></th>
              <th>Name</th>
              <th>Contact Email</th>
              <th>Total Spend</th>
              <th className="w-24 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdvertisers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-[#5f6368]">
                  No advertisers found.
                </td>
              </tr>
            ) : (
              filteredAdvertisers.map((adv) => (
                <tr key={adv._id} className="hover:bg-[#f1f3f4] transition-colors">
                  <td className="text-center"><input type="checkbox" className="rounded border-[#dadce0]" /></td>
                  <td className="font-medium text-[#1a73e8] hover:underline cursor-pointer" onClick={() => setEditingAdvertiser(adv)}>
                    {adv.name}
                  </td>
                  <td className="text-[#5f6368]">{adv.contactEmail}</td>
                  <td>${(adv.totalSpend || 0).toFixed(2)}</td>
                  <td className="text-right pr-6 space-x-2">
                    <button
                      onClick={() => setEditingAdvertiser(adv)}
                      className="p-1 hover:bg-[#f1f3f4] rounded text-[#5f6368] hover:text-[#202124] transition-colors"
                      title="Edit Advertiser"
                    >
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAdvertiser(adv._id)}
                      className="p-1 hover:bg-red-50 rounded text-[#5f6368] hover:text-red-600 transition-colors"
                      title="Delete Advertiser"
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer info */}
        <div className="p-3 border-t border-[#dadce0] flex justify-end items-center text-sm text-[#5f6368]">
          <span className="mr-4">1-{filteredAdvertisers.length} of {filteredAdvertisers.length}</span>
          <span className="material-icons cursor-not-allowed opacity-40 mr-2">chevron_left</span>
          <span className="material-icons cursor-not-allowed opacity-40">chevron_right</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editingAdvertiser && (
        <CreateAdvertiser
          editAdvertiser={editingAdvertiser}
          isOpen={true}
          onClose={() => setEditingAdvertiser(null)}
        />
      )}
    </div>
  );
}
