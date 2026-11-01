import React, { useState, useEffect } from 'react';
import { Item } from '../types';
import { generateQRCodeDataURL } from '../services/qr';
import { Printer, Download, Eye, ShieldCheck, Tag, Info } from 'lucide-react';

interface PrintableLabelsProps {
  items: Item[];
  onClose?: () => void;
}

export const PrintableLabels: React.FC<PrintableLabelsProps> = ({ items, onClose }) => {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [labelSize, setLabelSize] = useState<'standard' | 'mini' | 'badge'>('standard');
  const [includeRewardBadge, setIncludeRewardBadge] = useState<boolean>(true);
  const [copiesPerItem, setCopiesPerItem] = useState<number>(2);

  useEffect(() => {
    async function loadQRs() {
      const map: Record<string, string> = {};
      const baseUrl = window.location.origin;

      for (const item of items) {
        const scanUrl = `${baseUrl}?mode=finder&public_id=${item.publicId}`;
        const dataUrl = await generateQRCodeDataURL(scanUrl, {
          width: 250,
          margin: 1,
          darkColor: '#0f172a'
        });
        map[item.id] = dataUrl;
      }
      setQrMap(map);
    }
    loadQRs();
  }, [items]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-5xl mx-auto overflow-hidden">
      {/* Control Header - will be hidden on print via .no-print */}
      <div className="no-print p-6 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Print-Ready Campus Tag Sheet</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Generate waterproof vinyl sticker sheets for your textbooks, laptops, bike, and lab equipment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Stickers
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Configuration Controls (hidden on print) */}
      <div className="no-print p-6 border-b border-slate-100 bg-white grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <label className="block font-medium text-slate-700 mb-2">Label Size & Layout</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLabelSize('standard')}
              className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                labelSize === 'standard' ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-600'
              }`}
            >
              Standard (2" × 1.2")
            </button>
            <button
              type="button"
              onClick={() => setLabelSize('mini')}
              className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                labelSize === 'mini' ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-600'
              }`}
            >
              Mini Keytag (1" × 1")
            </button>
            <button
              type="button"
              onClick={() => setLabelSize('badge')}
              className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                labelSize === 'badge' ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-600'
              }`}
            >
              Badge Card (3" × 2")
            </button>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-2">Copies Per Item</label>
          <select
            value={copiesPerItem}
            onChange={(e) => setCopiesPerItem(Number(e.target.value))}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-800"
          >
            <option value={1}>1 copy per item</option>
            <option value={2}>2 copies per item (Recommended)</option>
            <option value={4}>4 copies per item (Bulk sheet)</option>
          </select>
        </div>

        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={includeRewardBadge}
              onChange={(e) => setIncludeRewardBadge(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Include "Reward Offered" banner if set</span>
          </label>
        </div>
      </div>

      {/* Printable Sheet Viewport */}
      <div id="printable-labels" className="p-8 bg-slate-100 min-h-[500px] overflow-auto">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
          <div className="text-center pb-4 mb-6 border-b border-dashed border-slate-200 no-print">
            <p className="text-xs text-slate-400 font-medium">
              PRINT PREVIEW — Suitable for standard Avery 5160, 5163, or weatherproof sticker paper
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-4">
            {items.flatMap(item => Array.from({ length: copiesPerItem }, (_, i) => ({ item, index: i }))).map(({ item, index }) => (
              <div
                key={`${item.id}-${index}`}
                className={`border-2 border-slate-800 rounded-lg p-3.5 bg-white flex flex-col justify-between relative overflow-hidden transition-all hover:border-blue-600 ${
                  labelSize === 'mini' ? 'p-2' : labelSize === 'badge' ? 'p-5' : 'p-3.5'
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-blue-900 text-white flex items-center justify-center text-[10px] font-black">
                      CT
                    </div>
                    <div>
                      <div className="text-[11px] font-black tracking-wider text-slate-900 uppercase">CAMPUS TAG</div>
                      <div className="text-[9px] text-slate-500 font-medium">SCAN IT TO FIND IT</div>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.publicId}
                  </span>
                </div>

                {/* Body Content */}
                <div className="py-2.5 flex items-center gap-3">
                  <div className="shrink-0 bg-white p-1 border border-slate-200 rounded">
                    {qrMap[item.id] ? (
                      <img
                        src={qrMap[item.id]}
                        alt={`QR Tag for ${item.name}`}
                        className={labelSize === 'mini' ? 'w-16 h-16' : labelSize === 'badge' ? 'w-24 h-24' : 'w-20 h-20'}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 animate-pulse rounded" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">
                      {item.category}
                    </div>
                    {item.serialNumber && (
                      <div className="text-[9px] font-mono text-slate-600 truncate mt-1">
                        S/N: {item.serialNumber}
                      </div>
                    )}
                    {includeRewardBadge && item.rewardOffered && (
                      <div className="inline-block mt-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        🎁 {item.rewardOffered}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Callout */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-600">
                  <span className="font-medium">Found this? Scan with any phone camera</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No items selected for printing. Add or select items in your dashboard first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
