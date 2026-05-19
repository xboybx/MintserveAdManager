'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAdvertiser({ editAdvertiser, isOpen: externalIsOpen, onClose }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const isEditing = !!editAdvertiser;

  useEffect(() => {
    if (editAdvertiser) {
      setName(editAdvertiser.name || '');
      setContactEmail(editAdvertiser.contactEmail || '');
    } else {
      setName('');
      setContactEmail('');
    }
  }, [editAdvertiser, isModalOpen]);

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
      name,
      contactEmail
    };

    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/advertisers/${editAdvertiser._id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/advertisers`;

    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      handleClose();
      if (!isEditing) {
        setName('');
        setContactEmail('');
      }
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <>
      {externalIsOpen === undefined && (
        <button onClick={() => setInternalIsOpen(true)} className="btn-secondary">
          + New Advertiser
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#202124]/40 flex items-center justify-center z-50">
          <div className="gam-card p-6 w-full max-w-md bg-white">
            <h3 className="text-xl font-normal mb-4 text-[#202124]">
              {isEditing ? 'Edit Advertiser' : 'New Advertiser'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5f6368] mb-1">Brand Name</label>
                <input required type="text" className="input-styled" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Nike" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5f6368] mb-1">Contact Email</label>
                <input required type="email" className="input-styled" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="media@nike.com" />
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
