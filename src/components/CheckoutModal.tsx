import React, { useState } from 'react';
import { SubscriptionPlan, Tenant, Subscription } from '../types';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText, 
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  plan: SubscriptionPlan;
  tenant: Tenant;
  onClose: () => void;
  onPaymentSuccess: (newPlanId: string, invoice: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  plan,
  tenant,
  onClose,
  onPaymentSuccess,
}) => {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'po'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(tenant.name || '');
  const [billingZip, setBillingZip] = useState('94305');
  const [poNumber, setPoNumber] = useState('');

  // States: 'idle' | 'processing' | 'success' | 'failed'
  const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validations
    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        setErrorMessage('Please enter a valid 16-digit credit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMessage('Please enter a valid expiration date (MM/YY).');
        return;
      }
      if (cardCvc.length < 3) {
        setErrorMessage('Please enter a valid 3 or 4-digit CVC code.');
        return;
      }
    } else {
      if (!poNumber.trim()) {
        setErrorMessage('Please provide your university Purchase Order or Cost Center ID.');
        return;
      }
    }

    setCheckoutState('processing');

    // Simulate real gateway latency & webhook verification
    setTimeout(() => {
      if (simulateFailure) {
        setCheckoutState('failed');
        setErrorMessage('Card declined by issuing bank: Insufficient funds or invalid security code. (Simulated)');
        return;
      }

      const invoice = {
        id: `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        planName: plan.name,
        amount: plan.price,
        billingCycle: plan.billingCycle,
        tenantName: tenant.name,
        timestamp: new Date().toISOString(),
        paymentMethod: paymentMethod === 'card' ? `Card ending in ${cardNumber.slice(-4) || '4242'}` : `PO #${poNumber}`,
        webhookVerificationSignature: `whsec_${Math.random().toString(36).substring(2, 12)}`,
        status: 'PAID',
      };

      setGeneratedInvoice(invoice);
      setCheckoutState('success');
      onPaymentSuccess(plan.id, invoice);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Secure University Checkout</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              256-bit encrypted payment gateway & academic billing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Summary Bar */}
        <div className="p-5 bg-blue-50/40 border-b border-blue-100/70 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              Upgrading Workspace Plan
            </span>
            <div className="text-sm font-bold text-slate-900">{plan.name}</div>
            <div className="text-xs text-slate-500">
              Capacity: Up to {plan.itemLimit} items · {plan.trialDays > 0 ? `${plan.trialDays} days free trial included` : 'Instant activation'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900">${plan.price}</div>
            <div className="text-[11px] text-slate-500">per {plan.billingCycle}</div>
          </div>
        </div>

        {/* Success View */}
        {checkoutState === 'success' && generatedInvoice && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Subscription Activated!</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Payment verified. Your item limit has been upgraded to <strong>{plan.itemLimit} campus tags</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-left font-mono space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-bold text-slate-900">{generatedInvoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-700">${generatedInvoice.amount} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="text-slate-700">{generatedInvoice.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Webhook Hash:</span>
                <span className="text-slate-400">{generatedInvoice.webhookVerificationSignature}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Return to Workspace
              </button>
            </div>
          </div>
        )}

        {/* Checkout Form (Idle / Processing / Failed) */}
        {checkoutState !== 'success' && (
          <form onSubmit={handleProcessPayment} className="p-6 space-y-5 text-xs">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div>
              <label className="block text-slate-700 font-bold uppercase tracking-wider mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('po')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold cursor-pointer transition-all ${
                    paymentMethod === 'po'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>University PO / Invoice</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. Dr. Marcus Chen"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 4242 4242 4242"
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                      Expires (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="12/28"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                      placeholder="•••"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
                    University Purchase Order Number / Cost Center
                  </label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="e.g. PO-STAN-2026-8812"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    An itemized electronic invoice will be dispatched to {tenant.contactEmail}.
                  </p>
                </div>
              </div>
            )}

            {/* Test Edge-Case Simulator Checkbox */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                />
                <span>Simulate card decline error (Edge case testing)</span>
              </label>

              <span className="flex items-center gap-1 text-slate-400">
                <Lock className="w-3 h-3" />
                <span>TLS 1.3 Verified</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={checkoutState === 'processing'}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {checkoutState === 'processing' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Payment with Provider Webhook...</span>
                </>
              ) : (
                <span>Pay ${plan.price} & Activate {plan.name}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
