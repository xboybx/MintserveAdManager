'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateLineItem({ editLineItem, isOpen: externalIsOpen, onClose, adUnits = [], orders: propOrders }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [orders, setOrders] = useState(propOrders || []);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const isEditing = !!editLineItem;

  const [formData, setFormData] = useState({
    name: '',
    orderId: '',
    adUnitId: '',
    priority: 10,
    startDate: '',
    endDate: '',
    goalType: 'CPM',
    totalLimit: '',
    targetingDevice: 'Desktop',
    targetingGeo: 'US',
    mediaUrl: '',
    clickUrl: '',
    status: 'Active'
  });

  useEffect(() => {
    if (isModalOpen && !propOrders) {
      // Fetch orders when modal opens if not passed as prop
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/orders`)
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(err => console.error(err));
    }
  }, [isModalOpen, propOrders]);

  useEffect(() => {
    if (editLineItem) {
      // Format dates to YYYY-MM-DD for input fields
      const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toISOString().split('T')[0];
      };

      setFormData({
        name: editLineItem.name || '',
        orderId: editLineItem.orderId?._id || editLineItem.orderId || '',
        adUnitId: editLineItem.adUnitId?._id || editLineItem.adUnitId || '',
        priority: editLineItem.priority || 10,
        startDate: formatDate(editLineItem.startDate),
        endDate: formatDate(editLineItem.endDate),
        goalType: editLineItem.goalType || 'CPM',
        totalLimit: editLineItem.totalLimit || '',
        targetingDevice: editLineItem.targeting?.device?.[0] || 'Desktop',
        targetingGeo: editLineItem.targeting?.geo?.[0] || 'US',
        mediaUrl: editLineItem.creativeDetails?.mediaUrl || '',
        clickUrl: editLineItem.creativeDetails?.clickUrl || '',
        status: editLineItem.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        orderId: '',
        adUnitId: '',
        priority: 10,
        startDate: '',
        endDate: '',
        goalType: 'CPM',
        totalLimit: '',
        targetingDevice: 'Desktop',
        targetingGeo: 'US',
        mediaUrl: '',
        clickUrl: '',
        status: 'Active'
      });
    }
  }, [editLineItem, isModalOpen]);

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

    const payload = {
      name: formData.name,
      orderId: formData.orderId,
      adUnitId: formData.adUnitId,
      priority: Number(formData.priority),
      startDate: formData.startDate,
      endDate: formData.endDate,
      goalType: formData.goalType,
      totalLimit: Number(formData.totalLimit),
      targeting: {
        device: [formData.targetingDevice],
        geo: [formData.targetingGeo]
      },
      creativeDetails: {
        mediaUrl: formData.mediaUrl,
        clickUrl: formData.clickUrl
      },
      status: formData.status
    };

    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/line-items/${editLineItem._id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/line-items`;

    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      handleClose();
      if (!isEditing) {
        setFormData({
          name: '',
          orderId: '',
          adUnitId: '',
          priority: 10,
          startDate: '',
          endDate: '',
          goalType: 'CPM',
          totalLimit: '',
          targetingDevice: 'Desktop',
          targetingGeo: 'US',
          mediaUrl: '',
          clickUrl: '',
          status: 'Active'
        });
      }
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <>
      {externalIsOpen === undefined && (
        <button onClick={() => setInternalIsOpen(true)} className="btn-primary">
          + New Line Item
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#202124]/40 flex items-center justify-center z-50 p-4">
          <div className="gam-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <h3 className="text-xl font-normal mb-4 text-[#202124]">
              {isEditing ? 'Edit Line item' : 'New Line item'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Name</label>
                  <input required type="text" className="input-styled" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Nike Winter Promo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Order</label>
                  <select required className="input-styled" value={formData.orderId} onChange={e => setFormData({...formData, orderId: e.target.value})}>
                    <option value="">Select Order...</option>
                    {orders.map(order => (
                      <option key={order._id} value={order._id}>{order.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Ad unit</label>
                  <select required className="input-styled" value={formData.adUnitId} onChange={e => setFormData({...formData, adUnitId: e.target.value})}>
                    <option value="">Select Ad Unit...</option>
                    {adUnits.map(unit => (
                      <option key={unit._id} value={unit._id}>{unit.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Priority (1 = Highest)</label>
                  <input required type="number" className="input-styled" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Start time</label>
                  <input required type="date" className="input-styled" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">End time</label>
                  <input required type="date" className="input-styled" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Quantity</label>
                  <input required type="number" className="input-styled" placeholder="e.g. 10000" value={formData.totalLimit} onChange={e => setFormData({...formData, totalLimit: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Device targeting</label>
                  <select required className="input-styled" value={formData.targetingDevice} onChange={e => setFormData({...formData, targetingDevice: e.target.value})}>
                    <option value="Desktop">Desktop</option>
                    <option value="Mobile">Mobile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Geo targeting</label>
                  <select required className="input-styled" value={formData.targetingGeo} onChange={e => setFormData({...formData, targetingGeo: e.target.value})}>
                    <option value="US">US</option>
                    <option value="IN">IN</option>
                    <option value="UK">UK</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Media URL</label>
                  <input required type="url" className="input-styled" placeholder="https://..." value={formData.mediaUrl} onChange={e => setFormData({...formData, mediaUrl: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Click URL</label>
                  <input required type="url" className="input-styled" placeholder="https://..." value={formData.clickUrl} onChange={e => setFormData({...formData, clickUrl: e.target.value})} />
                </div>
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-[#5f6368] mb-1">Status</label>
                  <select required className="input-styled" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}

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
