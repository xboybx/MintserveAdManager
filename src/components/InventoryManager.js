'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreateAdUnit from './CreateAdUnit';

export default function InventoryManager({ initialAdUnits = [] }) {
  const router = useRouter();
  const [adUnits, setAdUnits] = useState(initialAdUnits);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Editing state
  const [editingAdUnit, setEditingAdUnit] = useState(null);

  // Sync state if server data refreshes
  useEffect(() => {
    setAdUnits(initialAdUnits);
  }, [initialAdUnits]);

  // ── Actions: DELETE ────────────────────────────────────────
  const handleDeleteAdUnit = async (id) => {
    if (!confirm('Are you sure you want to delete this ad unit? Associated line items will be paused.')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/ad-units/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setAdUnits(adUnits.filter(item => item._id !== id));
      router.refresh();
    }
  };

  // ── Filtering calculations ───────────────────────────────
  const filteredAdUnits = adUnits.filter(unit => {
    const matchesSearch = unit.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter
      ? statusFilter === 'Active' ? unit.isActive : !unit.isActive
      : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-normal text-[#202124]">Ad units</h2>
          <div className="text-sm text-[#5f6368] mt-1 flex items-center">
            <span>Inventory</span>
            <span className="material-icons text-xs mx-1">chevron_right</span>
            <span>Ad units</span>
          </div>
        </div>
        <CreateAdUnit />
      </header>

      <div className="gam-card overflow-hidden">
        {/* Table Action Bar */}
        <div className="p-4 border-b border-[#dadce0] bg-[#f8f9fa] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1 max-w-xl">
            {/* Search Input */}
            <div className="relative flex items-center flex-1">
              <span className="material-icons absolute left-3 text-[#5f6368] text-base pointer-events-none">search</span>
              <input
                type="text"
                placeholder="Search ad units..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-styled py-1.5 text-xs"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-styled w-36 py-1.5 text-xs"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="text-xs text-[#5f6368] font-medium">
            Found {filteredAdUnits.length} slots
          </div>
        </div>

        <table className="w-full gam-table">
          <thead className="bg-[#f8f9fa]">
            <tr>
              <th className="w-10 text-center"><input type="checkbox" className="rounded border-[#dadce0]" /></th>
              <th>Name</th>
              <th>Sizes</th>
              <th>Floor Price</th>
              <th>Status</th>
              <th className="w-24 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdUnits.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-[#5f6368]">
                  No ad units found.
                </td>
              </tr>
            ) : (
              filteredAdUnits.map((unit) => (
                <tr key={unit._id} className="hover:bg-[#f1f3f4] transition-colors">
                  <td className="text-center"><input type="checkbox" className="rounded border-[#dadce0]" /></td>
                  <td className="font-medium text-[#1a73e8] hover:underline cursor-pointer" onClick={() => setEditingAdUnit(unit)}>
                    {unit.name}
                  </td>
                  <td>{unit.dimensions?.width}x{unit.dimensions?.height}</td>
                  <td>${(unit.basePriceFloor || 0).toFixed(2)}</td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      unit.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {unit.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-right pr-6 space-x-2">
                    <button
                      onClick={() => setEditingAdUnit(unit)}
                      className="p-1 hover:bg-[#f1f3f4] rounded text-[#5f6368] hover:text-[#202124] transition-colors"
                      title="Edit Ad Unit"
                    >
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAdUnit(unit._id)}
                      className="p-1 hover:bg-red-50 rounded text-[#5f6368] hover:text-red-600 transition-colors"
                      title="Delete Ad Unit"
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Footer */}
        <div className="p-3 border-t border-[#dadce0] flex justify-end items-center text-sm text-[#5f6368]">
          <span className="mr-4">1-{filteredAdUnits.length} of {filteredAdUnits.length}</span>
          <span className="material-icons cursor-not-allowed opacity-40 mr-2">chevron_left</span>
          <span className="material-icons cursor-not-allowed opacity-40">chevron_right</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editingAdUnit && (
        <CreateAdUnit
          editAdUnit={editingAdUnit}
          isOpen={true}
          onClose={() => setEditingAdUnit(null)}
        />
      )}
    </div>
  );
}
