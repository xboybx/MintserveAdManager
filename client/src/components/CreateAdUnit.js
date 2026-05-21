'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAdUnit({ editAdUnit, isOpen: externalIsOpen, onClose }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [floor, setFloor] = useState('');
  const [isActive, setIsActive] = useState(true);
  const router = useRouter();

  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const isEditing = !!editAdUnit;

  useEffect(() => {
    if (editAdUnit) {
      setName(editAdUnit.name || '');
      setWidth(editAdUnit.dimensions?.width || '');
      setHeight(editAdUnit.dimensions?.height || '');
      setFloor(editAdUnit.basePriceFloor || '');
      setIsActive(editAdUnit.isActive !== undefined ? editAdUnit.isActive : true);
    } else {
      setName('');
      setWidth('');
      setHeight('');
      setFloor('');
      setIsActive(true);
    }
  }, [editAdUnit, isModalOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      dimensions: { width: Number(width), height: Number(height) },
      basePriceFloor: Number(floor),
      isActive
    };

    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/ad-units/${editAdUnit._id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/ad-units`;

    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      handleClose();
      if (!isEditing) {
        setName(''); setWidth(''); setHeight(''); setFloor('');
      }
      router.refresh();
    }
  };

  return (
    <>
      {externalIsOpen === undefined && (
        <button onClick={() => setInternalIsOpen(true)} className="btn-primary">
          + New Ad Unit
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#202124]/40 flex items-center justify-center z-50">
          <div className="gam-card p-6 w-full max-w-md bg-white">
            <h3 className="text-xl font-normal mb-4 text-[#202124]">
              {isEditing ? 'Edit Ad unit' : 'New Ad unit'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5f6368] mb-1">Name</label>
                <input required type="text" className="input-styled" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Header_Banner" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Width (px)</label>
                  <input required type="number" className="input-styled" value={width} onChange={e => setWidth(e.target.value)} placeholder="728" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Height (px)</label>
                  <input required type="number" className="input-styled" value={height} onChange={e => setHeight(e.target.value)} placeholder="90" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5f6368] mb-1">Base floor ($)</label>
                <input required type="number" step="0.01" className="input-styled" value={floor} onChange={e => setFloor(e.target.value)} placeholder="1.50" />
              </div>

              {isEditing && (
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded border-[#dadce0] text-[#1a73e8]" />
                  <label htmlFor="isActive" className="text-sm font-medium text-[#202124]">Active inventory slot</label>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-[#dadce0]">
                <button type="button" onClick={handleClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Save changes' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
