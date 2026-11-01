"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    if (!sessionId) {
      setLoading(false)
      return
    }

    api.get('/subscriptions/success/', { params: { session_id: sessionId } })
      .then((res) => {
        setTransaction(res.data.transaction)
        if (res.data.status === 'success') {
          toast.success('Payment successful! Your subscription is now active.')
        } else {
          toast('Payment is being processed.')
        }
      })
      .catch(() => {
        toast.error('Failed to verify payment status.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Verifying payment...</p>
        </div>
      </div>
    )
  }

  const isSuccess = transaction?.status === 'success'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-vh-100 d-flex flex-column"
    >
      <main className="flex-fill py-5">
        <div className="container text-center">
          <div className="mb-4">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="mx-auto text-success">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="fw-bold mb-3">{isSuccess ? 'Payment Successful!' : 'Payment Processing'}</h1>
          <p className="text-muted mb-5">
            {isSuccess ? 'Your subscription has been activated successfully.' : 'We are verifying your payment. You will be redirected shortly.'}
          </p>

          {transaction && (
            <div className="card shadow-sm border-0 mx-auto mb-5" style={{ maxWidth: 500 }}>
              <div className="card-body">
                <h6 className="text-muted mb-3">Transaction Details</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Transaction ID</span>
                  <span className="text-truncate" style={{ maxWidth: '200px' }}>{transaction.id}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Amount</span>
                  <span className="fw-bold">${transaction.amount} {transaction.currency}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Status</span>
                  <span className={`badge ${transaction.status === 'success' ? 'bg-success' : 'bg-warning'}`}>
                    {transaction.status}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Plan</span>
                  <span>{transaction.plan?.name || '—'}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Date</span>
                  <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="d-grid gap-2" style={{ maxWidth: 300, margin: '0 auto' }}>
            <button className="btn btn-primary" onClick={() => router.push('/dashboard/subscription')}>
              Go to Subscription
            </button>
            <button className="btn btn-outline-secondary" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </motion.div>
  )
}
