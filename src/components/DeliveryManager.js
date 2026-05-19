'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CreateLineItem from './CreateLineItem';
import CreateOrder from './CreateOrder';
import CreateAdvertiser from './CreateAdvertiser';

export default function DeliveryManager({ initialLineItems = [], initialOrders = [], adUnits = [], advertisers = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('line-items'); // 'line-items' | 'orders'
  
  // Local states to allow instant update on actions
  const [lineItems, setLineItems] = useState(initialLineItems);
  const [orders, setOrders] = useState(initialOrders);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [advertiserFilter, setAdvertiserFilter] = useState('');

  // Editing state
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingLineItem, setEditingLineItem] = useState(null);

  // Sync state if server data refreshes
  useEffect(() => {
    setLineItems(initialLineItems);
  }, [initialLineItems]);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Clean filters when switching tabs
  useEffect(() => {
    setSearchQuery('');
    setStatusFilter('');
    setAdvertiserFilter('');
  }, [activeTab]);

  // ── Actions: DELETE ────────────────────────────────────────
  const handleDeleteOrder = async (id) => {
    if (!confirm('Are you sure you want to delete this order? All associated line items will be deleted permanently.')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/orders/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setOrders(orders.filter(item => item._id !== id));
      // Remove related line items
      setLineItems(lineItems.filter(item => item.orderId?._id !== id && item.orderId !== id));
      router.refresh();
    }
  };

  const handleDeleteLineItem = async (id) => {
    if (!confirm('Are you sure you want to delete this line item?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/line-items/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setLineItems(lineItems.filter(item => item._id !== id));
      router.refresh();
    }
  };

  // ── Actions: TOGGLE STATUS (Pause / Resume) ─────────────────
  const handleToggleLineItemStatus = async (item) => {
    const newStatus = item.status === 'Active' ? 'Paused' : 'Active';
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/line-items/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      setLineItems(lineItems.map(li => li._id === item._id ? { ...li, status: newStatus } : li));
      router.refresh();
    }
  };

  const handleToggleOrderStatus = async (item) => {
    const newStatus = item.status === 'Approved' ? 'Paused' : 'Approved';
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/orders/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      setOrders(orders.map(o => o._id === item._id ? { ...o, status: newStatus } : o));
      // If order status changes, related line items status might shift on backend, sync client
      router.refresh();
    }
  };

  // ── Filtering calculations ───────────────────────────────
  const filteredLineItems = lineItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesAdvertiser = advertiserFilter
      ? item.advertiserId?._id === advertiserFilter || item.advertiserId === advertiserFilter
      : true;
    return matchesSearch && matchesStatus && matchesAdvertiser;
  });

  const filteredOrders = orders.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesAdvertiser = advertiserFilter
      ? item.advertiserId?._id === advertiserFilter || item.advertiserId === advertiserFilter
      : true;
    return matchesSearch && matchesStatus && matchesAdvertiser;
  });

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-normal text-[#202124]">Delivery</h2>
          <div className="text-sm text-[#5f6368] mt-1 flex items-center">
            <span>Delivery</span>
            <span className="material-icons text-xs mx-1">chevron_right</span>
            <span>{activeTab === 'line-items' ? 'Line items' : 'Orders'}</span>
          </div>
        </div>
        <div className="flex space-x-3">
          <CreateAdvertiser />
          <CreateOrder advertisers={advertisers} />
          <CreateLineItem adUnits={adUnits} orders={orders} />
        </div>
      </header>

      {/* Tabs */}
      <div className="gam-card overflow-hidden">
        <div className="px-4 border-b border-[#dadce0] flex space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('line-items')}
            className={`py-3 outline-none border-b-2 transition-all ${
              activeTab === 'line-items'
                ? 'text-[#1a73e8] border-[#1a73e8]'
                : 'text-[#5f6368] border-transparent hover:text-[#202124]'
            }`}
          >
            Line items
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 outline-none border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'text-[#1a73e8] border-[#1a73e8]'
                : 'text-[#5f6368] border-transparent hover:text-[#202124]'
            }`}
          >
            Orders
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-[#dadce0] bg-[#f8f9fa] flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center flex-1 max-w-2xl">
            {/* Search Input */}
            <div className="relative flex items-center flex-1 min-w-[200px]">
              <span className="material-icons absolute left-3 text-[#5f6368] text-base pointer-events-none">search</span>
              <input
                type="text"
                placeholder={`Search ${activeTab === 'line-items' ? 'line items' : 'orders'}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-styled py-1.5 text-xs"
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>

            {/* Advertiser Filter */}
            <select
              value={advertiserFilter}
              onChange={e => setAdvertiserFilter(e.target.value)}
              className="input-styled w-44 py-1.5 text-xs"
            >
              <option value="">All Advertisers</option>
              {advertisers.map(adv => (
                <option key={adv._id} value={adv._id}>{adv.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-styled w-36 py-1.5 text-xs"
            >
              <option value="">All Statuses</option>
              {activeTab === 'line-items' ? (
                <>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </>
              ) : (
                <>
                  <option value="Draft">Draft</option>
                  <option value="Approved">Approved</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </>
              )}
            </select>
          </div>

          <div className="text-xs text-[#5f6368] font-medium">
            Found {activeTab === 'line-items' ? filteredLineItems.length : filteredOrders.length} items
          </div>
        </div>

        {/* Data Table */}
        {activeTab === 'line-items' ? (
          <table className="w-full gam-table">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="w-10 text-center"><input type="checkbox" className="rounded border-[#dadce0]" /></th>
                <th>Name</th>
                <th>Order</th>
                <th>Advertiser</th>
                <th>Priority</th>
                <th>Targeting</th>
                <th>Progress</th>
                <th>Status</th>
                <th className="w-28 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLineItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-[#5f6368]">
                    No line items match your criteria.
                  </td>
                </tr>
              ) : (
                filteredLineItems.map((item) => {
                  const progressPct = item.totalLimit > 0
                    ? Math.min((item.delivered / item.totalLimit) * 100, 100)
                    : 0;
                  return (
                    <tr key={item._id} className="hover:bg-[#f1f3f4] transition-colors">
                      <td className="text-center"><input type="checkbox" className="rounded border-[#dadce0]" /></td>
                      <td className="font-medium text-[#1a73e8] hover:underline" onClick={() => setEditingLineItem(item)}>
                        {item.name}
                      </td>
                      <td className="text-[#5f6368]">{item.orderId?.name || 'N/A'}</td>
                      <td>{item.advertiserId?.name || 'N/A'}</td>
                      <td>{item.priority}</td>
                      <td>
                        <span className="text-xs text-[#5f6368]">
                          {item.targeting?.device?.[0] || 'Any'} / {item.targeting?.geo?.[0] || 'Any'}
                        </span>
                      </td>
                      <td>
                        <div className="w-24">
                          <div className="bg-[#dadce0] rounded-full h-1 overflow-hidden w-full">
                            <div
                              className="bg-[#1a73e8] h-full rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[#5f6368] mt-0.5 block">
                            {item.delivered?.toLocaleString()} / {item.totalLimit?.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.status === 'Active' ? 'bg-green-100 text-green-800' :
                          item.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="text-right pr-6 space-x-2">
                        <button
                          onClick={() => handleToggleLineItemStatus(item)}
                          className="p-1 hover:bg-[#e8f0fe] rounded text-[#5f6368] hover:text-[#1a73e8] transition-colors"
                          title={item.status === 'Active' ? 'Pause Campaign' : 'Activate Campaign'}
                        >
                          <span className="material-icons text-sm">
                            {item.status === 'Active' ? 'pause' : 'play_arrow'}
                          </span>
                        </button>
                        <button
                          onClick={() => setEditingLineItem(item)}
                          className="p-1 hover:bg-[#f1f3f4] rounded text-[#5f6368] hover:text-[#202124] transition-colors"
                          title="Edit Line Item"
                        >
                          <span className="material-icons text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteLineItem(item._id)}
                          className="p-1 hover:bg-red-50 rounded text-[#5f6368] hover:text-red-600 transition-colors"
                          title="Delete Line Item"
                        >
                          <span className="material-icons text-sm">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full gam-table">
            <thead className="bg-[#f8f9fa]">
              <tr>
                <th className="w-10 text-center"><input type="checkbox" className="rounded border-[#dadce0]" /></th>
                <th>Name</th>
                <th>Advertiser</th>
                <th>Trafficker</th>
                <th>Status</th>
                <th className="w-28 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#5f6368]">
                    No orders match your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#f1f3f4] transition-colors">
                    <td className="text-center"><input type="checkbox" className="rounded border-[#dadce0]" /></td>
                    <td className="font-medium text-[#1a73e8] hover:underline" onClick={() => setEditingOrder(order)}>
                      {order.name}
                    </td>
                    <td>{order.advertiserId?.name || 'N/A'}</td>
                    <td>{order.trafficker}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        order.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        order.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-right pr-6 space-x-2">
                      <button
                        onClick={() => handleToggleOrderStatus(order)}
                        className="p-1 hover:bg-[#e8f0fe] rounded text-[#5f6368] hover:text-[#1a73e8] transition-colors"
                        title={order.status === 'Approved' ? 'Pause Order' : 'Approve Order'}
                      >
                        <span className="material-icons text-sm">
                          {order.status === 'Approved' ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="p-1 hover:bg-[#f1f3f4] rounded text-[#5f6368] hover:text-[#202124] transition-colors"
                        title="Edit Order"
                      >
                        <span className="material-icons text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="p-1 hover:bg-red-50 rounded text-[#5f6368] hover:text-red-600 transition-colors"
                        title="Delete Order"
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Footer info */}
        <div className="p-3 border-t border-[#dadce0] flex justify-end items-center text-sm text-[#5f6368]">
          <span className="mr-4">
            Showing {activeTab === 'line-items' ? filteredLineItems.length : filteredOrders.length} items
          </span>
          <span className="material-icons cursor-not-allowed opacity-40 mr-2">chevron_left</span>
          <span className="material-icons cursor-not-allowed opacity-40">chevron_right</span>
        </div>
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <CreateOrder
          editOrder={editingOrder}
          isOpen={true}
          onClose={() => setEditingOrder(null)}
          advertisers={advertisers}
        />
      )}

      {/* Edit Line Item Modal */}
      {editingLineItem && (
        <CreateLineItem
          editLineItem={editingLineItem}
          isOpen={true}
          onClose={() => setEditingLineItem(null)}
          adUnits={adUnits}
          orders={orders}
        />
      )}
    </div>
  );
}
