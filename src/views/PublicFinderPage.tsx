import React, { useState, useEffect } from 'react';
import { Item, FinderReport, MessageThread } from '../types';
import { db } from '../mock/storage';
import { LeafletMap } from '../components/LeafletMap';
import { 
  ShieldCheck, 
  MapPin, 
  Send, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Building,
  Lock,
  Loader2,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';

interface PublicFinderPageProps {
  publicId: string;
  onNavigateHome?: () => void;
  onShowToast?: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const PublicFinderPage: React.FC<PublicFinderPageProps> = ({
  publicId,
  onNavigateHome,
  onShowToast,
}) => {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [finderContactNote, setFinderContactNote] = useState('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<FinderReport | null>(null);
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState<'report' | 'chat'>('report');

  // Rate Limiting on Client: allow max 3 reports per session
  const [submissionCount, setSubmissionCount] = useState<number>(() => {
    return parseInt(sessionStorage.getItem(`rate_limit_${publicId}`) || '0', 10);
  });

  useEffect(() => {
    const loadedItem = db.getItemByPublicId(publicId);
    setItem(loadedItem || null);

    const existingThread = db.getThreadByPublicId(publicId);
    setThread(existingThread || null);

    setLoading(false);
  }, [publicId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Evidence photo must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          setEvidencePhotoUrl(loadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (submissionCount >= 3) {
      alert('Rate limit reached: Maximum 3 reports per hour. Please use the two-way relay chat below to send additional updates.');
      setActiveTab('chat');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a short message describing where the item is.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const rep = db.submitFinderReport({
        itemId: item.id,
        publicId: item.publicId,
        itemName: item.name,
        tenantId: item.tenantId,
        message: message.trim(),
        finderContactNote: finderContactNote.trim() || undefined,
        evidencePhotoUrl: evidencePhotoUrl || undefined,
        location: selectedLocation || undefined,
      });

      // Update Rate limit counter
      const newCount = submissionCount + 1;
      setSubmissionCount(newCount);
      sessionStorage.setItem(`rate_limit_${publicId}`, newCount.toString());

      // Open/send message in thread
      const locationNote = selectedLocation?.address ? ` (Location: ${selectedLocation.address})` : '';
      db.sendMessage(item.publicId, `Finder Report: ${message.trim()}${locationNote}`, 'finder');

      setSubmittedReport(rep);
      setThread(db.getThreadByPublicId(publicId) || null);
      setIsSubmitting(false);
      setActiveTab('chat');

      if (onShowToast) {
        onShowToast('success', 'Recovery Notice Dispatched', 'The owner has been notified. You can chat anonymously below.');
      }
    }, 700);
  };

  const handleSendChatReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !item) return;

    db.sendMessage(item.publicId, replyText.trim(), 'finder');
    setReplyText('');
    setThread(db.getThreadByPublicId(publicId) || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Item Tag Not Registered</h1>
        <p className="text-slate-400 max-w-md text-xs mb-6 leading-relaxed">
          The tag <span className="font-mono text-blue-400 font-bold">{publicId}</span> is not currently bound to an active campus inventory.
        </p>
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Go to Campus Tag Homepage
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Banner / Privacy Bar */}
      <header className="bg-slate-900/95 border-b border-slate-800 backdrop-blur sticky top-0 z-40">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
              CT
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-white uppercase">CAMPUS TAG</div>
              <div className="text-[10px] text-blue-400 font-medium">Anonymous Recovery Relay</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-full text-[11px] text-emerald-400 font-semibold">
            <Lock className="w-3 h-3" />
            <span>Zero PII Exposed</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-5 space-y-4">
        {/* Urgent Lost Banner */}
        {item.isLost ? (
          <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex items-start gap-3 text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300 text-xs tracking-wide uppercase">
                URGENT: OWNER REPORTED THIS ITEM AS LOST
              </div>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                {item.lostNote || 'The owner is actively searching for this item. Please drop a note or turn it in to the nearest campus desk!'}
              </p>
              {item.rewardOffered && (
                <div className="inline-block mt-2 px-2.5 py-1 bg-amber-400/20 border border-amber-400/30 rounded-lg text-xs font-bold text-amber-300">
                  🎁 Reward Offered: {item.rewardOffered}
                </div>
              )}
            </div>
          </div>
        ) : item.isRecovered ? (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>This item is recorded as safely recovered with its owner.</span>
          </div>
        ) : (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-2 text-xs text-blue-300">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>This item is actively registered and protected under the Campus Tag network.</span>
          </div>
        )}

        {/* Item Card (Safe Info ONLY) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="relative h-44 bg-slate-800">
            <img
              src={item.photoUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                  {item.category}
                </span>
                <h1 className="text-lg font-bold text-white drop-shadow">
                  {item.name}
                </h1>
              </div>
              <span className="font-mono text-xs text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700">
                {item.publicId}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {item.description && (
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.description}
              </p>
            )}

            {item.serialNumber && (
              <div className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                Asset ID / Serial: {item.serialNumber}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-blue-300">
                <Building className="w-3.5 h-3.5" />
                Affiliated University Workspace
              </span>
              <span>Scanned {item.scanCount} times</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Report vs Chat) */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-2 font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'report' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Notify Owner (No Login)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Masked Relay Chat {thread?.messages.length ? `(${thread.messages.length})` : ''}</span>
          </button>
        </div>

        {/* TAB 1: NOTIFY OWNER */}
        {activeTab === 'report' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                <span>Send Handover Notice</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                The owner receives an immediate notification. No account or email needed from you.
              </p>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Where is this item safe? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Left with reception at Engineering Hall 2nd Floor desk under student name Alex, or handed to library security..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Finder Note (Optional)
                </label>
                <input
                  type="text"
                  value={finderContactNote}
                  onChange={(e) => setFinderContactNote(e.target.value)}
                  placeholder="e.g. I am sitting near the green sofas until 4pm or my phone (optional)"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* REAL INTERACTIVE MAP (OpenStreetMap Leaflet with Live Search & GPS Location) */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pin Location on Map (Search or Drop Pin)</span>
                </label>

                <div className="h-60 rounded-xl overflow-hidden border border-slate-800">
                  <LeafletMap
                    height="240px"
                    interactive={true}
                    showSearchBar={true}
                    center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [37.4275, -122.1697]}
                    marker={selectedLocation ? {
                      lat: selectedLocation.lat,
                      lng: selectedLocation.lng,
                      title: 'Item Found Here',
                      description: selectedLocation.address
                    } : undefined}
                    onLocationSelect={(loc) => setSelectedLocation(loc)}
                  />
                </div>

                {selectedLocation && (
                  <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 truncate">
                    Selected Location: <span className="font-semibold text-blue-400">{selectedLocation.address}</span>
                  </div>
                )}
              </div>

              {/* EVIDENCE PHOTO UPLOAD */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Evidence Photo of Item Safe (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-medium flex items-center gap-2 transition-colors">
                    <Camera className="w-4 h-4 text-blue-400" />
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  {evidencePhotoUrl && (
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-blue-500 shrink-0">
                        <img src={evidencePhotoUrl} alt="Evidence" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEvidencePhotoUrl('')}
                        className="text-slate-400 hover:text-red-400 p-1"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || submissionCount >= 3}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Notice...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Notice to Owner</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: ANONYMOUS CHAT RELAY */}
        {activeTab === 'chat' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Masked Two-Way Relay</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chat securely with the owner. Messages are sent instantly without exposing your phone number.
              </p>
            </div>

            <div className="h-64 overflow-y-auto bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
              {(!thread || thread.messages.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-4">
                  <ShieldCheck className="w-8 h-8 text-slate-600 mb-2" />
                  No messages yet. Send a report above to start the recovery conversation.
                </div>
              ) : (
                thread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'finder' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-slate-500 mb-0.5 px-1">
                      {msg.sender === 'finder' ? 'You (Finder)' : 'Item Owner'} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        msg.sender === 'finder'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChatReply} className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type anonymous message to owner..."
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* Campus Safe Handover Tips */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs space-y-2 text-slate-400">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-400" />
            <span>Recommended Campus Safe Drop Locations</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11px]">
            <li>Main University Library Circulation or Security Helpdesk</li>
            <li>Campus Public Safety / Police Building</li>
            <li>Student Union Information Counter</li>
            <li>Department Academic Office Reception</li>
          </ul>
        </div>
      </main>
    </div>
  );
};
