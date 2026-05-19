'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateOrder({ editOrder, isOpen: externalIsOpen, onClose, advertisers: propAdvertisers }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [advertisers, setAdvertisers] = useState(propAdvertisers || []);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    advertiserId: '',
    trafficker: 'Ad Server Admin',
    status: 'Approved',
    notes: ''
  });

  const router = useRouter();
  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const isEditing = !!editOrder;

  useEffect(() => {
    if (isModalOpen && !propAdvertisers) {
      // Fetch advertisers when modal opens if not passed as prop
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/advertisers`)
        .then(res => res.json())
        .then(data => setAdvertisers(data))
        .catch(err => console.error(err));
    }
  }, [isModalOpen, propAdvertisers]);

  useEffect(() => {
    if (editOrder) {
      setFormData({
        name: editOrder.name || '',
        advertiserId: editOrder.advertiserId?._id || editOrder.advertiserId || '',
        trafficker: editOrder.trafficker || 'Ad Server Admin',
        status: editOrder.status || 'Approved',
        notes: editOrder.notes || ''
      });
    } else {
      setFormData({
        name: '',
        advertiserId: '',
        trafficker: 'Ad Server Admin',
        status: 'Approved',
        notes: ''
      });
    }
  }, [editOrder, isModalOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/orders/${editOrder._id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/orders`;

    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      handleClose();
      if (!isEditing) {
        setFormData({
          name: '',
          advertiserId: '',
          trafficker: 'Ad Server Admin',
          status: 'Approved',
          notes: ''
        });
      }
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <>
      {externalIsOpen === undefined && (
        <button onClick={() => setInternalIsOpen(true)} className="btn-secondary">
          + New Order
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#202124]/40 flex items-center justify-center z-50 p-4">
          <div className="gam-card p-6 w-full max-w-md bg-white">
            <h3 className="text-xl font-normal mb-4 text-[#202124]">
              {isEditing ? 'Edit Order' : 'New Order'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5f6368] mb-1">Order Name</label>
                <input required type="text" className="input-styled" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Nike Q3 Launch" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f6368] mb-1">Advertiser</label>
                <select required className="input-styled" value={formData.advertiserId} onChange={e => setFormData({...formData, advertiserId: e.target.value})}>
                  <option value="">Select Advertiser...</option>
                  {advertisers.map(adv => (
                    <option key={adv._id} value={adv._id}>{adv.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f6368] mb-1">Trafficker</label>
                <input required type="text" className="input-styled" value={formData.trafficker} onChange={e => setFormData({...formData, trafficker: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f6368] mb-1">Status</label>
                <select required className="input-styled" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Draft">Draft</option>
                  <option value="Approved">Approved</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5f6368] mb-1">Notes</label>
                <textarea className="input-styled h-20 resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Order comments..." />
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-[#dadce0]">
                <button type="button" onClick={handleClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
