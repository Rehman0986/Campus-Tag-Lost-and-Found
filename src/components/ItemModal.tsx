import React, { useState } from 'react';
import { Item, ItemCategory } from '../types';
import { X, Upload, Sparkles, AlertCircle, Shield, Tag } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<Item>) => void;
  initialItem?: Item | null;
  tenantId: string;
}

const CATEGORIES: ItemCategory[] = [
  'Electronics & Laptops',
  'Lab & Research Equipment',
  'Textbooks & Notebooks',
  'Keys & Access Badges',
  'Bicycles & Scooters',
  'Musical Instruments',
  'Bags & Backpacks',
  'Other Essentials'
];

const SAMPLE_PHOTOS: { label: string; url: string; cat: ItemCategory }[] = [
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', cat: 'Electronics & Laptops' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', cat: 'Electronics & Laptops' },
  { label: 'Lab Instrument', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', cat: 'Lab & Research Equipment' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', cat: 'Bags & Backpacks' },
  { label: 'Bicycle', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80', cat: 'Bicycles & Scooters' },
  { label: 'Campus Keys', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80', cat: 'Keys & Access Badges' },
];

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  tenantId
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(initialItem?.name || '');
  const [category, setCategory] = useState<ItemCategory>(initialItem?.category || 'Electronics & Laptops');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [serialNumber, setSerialNumber] = useState(initialItem?.serialNumber || '');
  const [rewardOffered, setRewardOffered] = useState(initialItem?.rewardOffered || '');
  const [photoUrl, setPhotoUrl] = useState(initialItem?.photoUrl || SAMPLE_PHOTOS[0].url);
  const [isLost, setIsLost] = useState(initialItem?.isLost || false);
  const [lostNote, setLostNote] = useState(initialItem?.lostNote || '');
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError('Image file must be under 4MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    const payload: Partial<Item> = {
      ...(initialItem || {}),
      name: name.trim(),
      category,
      description: description.trim(),
      serialNumber: serialNumber.trim() || undefined,
      rewardOffered: rewardOffered.trim() || undefined,
      photoUrl,
      isLost,
      lostNote: isLost ? lostNote.trim() : undefined,
      lostDate: isLost ? (initialItem?.lostDate || new Date().toISOString()) : undefined,
      tenantId: initialItem?.tenantId || tenantId,
      publicId: initialItem?.publicId || `cpt-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`,
      scanCount: initialItem?.scanCount || 0,
      createdAt: initialItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRecovered: initialItem?.isRecovered || false,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialItem ? 'Edit Protected Item' : 'Register New Campus Item'}
              </h2>
              <p className="text-xs text-slate-500">
                A permanent, privacy-preserving QR code will be bound to this item.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Item Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. MacBook Pro 14 (Space Black)"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Public Description (Visible to Finder)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Has stickers on lid, blue case, bio lab tag. Do not include your personal phone or email here!"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Keep private credentials out. Finders contact you through our anonymous relay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Serial Number / Asset Tag (Optional)
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. C02GK990MD6R or STAN-8821"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Reward Offered (Optional)
              </label>
              <input
                type="text"
                value={rewardOffered}
                onChange={(e) => setRewardOffered(e.target.value)}
                placeholder="e.g. $40 Cash or Campus Coffee Card"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Photo Selection / Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Photo
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <span className="text-xs text-slate-400">or pick sample:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PHOTOS.map((sp) => (
                    <button
                      key={sp.label}
                      type="button"
                      onClick={() => {
                        setPhotoUrl(sp.url);
                        setCategory(sp.cat);
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        photoUrl === sp.url ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lost Mode Section */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div>
                <span className="text-xs font-bold text-amber-900 block">LOST MODE BROADCAST</span>
                <span className="text-xs text-amber-700">
                  When enabled, any scan will highlight an emergency banner with your custom recovery note.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLost}
                  onChange={(e) => setIsLost(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {isLost && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-amber-900 mb-1">
                  Urgent Lost Instructions for Finder
                </label>
                <input
                  type="text"
                  value={lostNote}
                  onChange={(e) => setLostNote(e.target.value)}
                  placeholder="e.g. Please take this to Packard Hall 2nd Floor Helpdesk or message me below!"
                  className="w-full px-3.5 py-2 border border-amber-300 bg-amber-50/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              {initialItem ? 'Save Changes' : 'Generate Campus Tag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
