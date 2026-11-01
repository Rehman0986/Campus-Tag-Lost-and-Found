"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function PaymentCancelPage() {
  const router = useRouter()
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const verifyPayment = () => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    if (!sessionId) {
      setLoading(false)
      return
    }

    api.get('/subscriptions/cancel/', { params: { session_id: sessionId } })
      .then((res) => {
        setTransaction(res.data.transaction)
        toast('Payment was canceled.')
      })
      .catch(() => {
        toast.error('Failed to verify payment status.')
      })
      .finally(() => setLoading(false))
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="d-flex align-items-center justify-content-center min-vh-100"
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Checking payment status...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="min-vh-100 d-flex flex-column"
    >
      <main className="flex-fill py-5">
        <div className="container text-center">
          <div className="mb-4">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="mx-auto text-warning">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="fw-bold mb-3">Payment Canceled</h1>
          <p className="text-muted mb-5">
            Your payment was not completed. No charges were made to your account.
          </p>

          {transaction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card shadow-sm border-0 mx-auto mb-5"
              style={{ maxWidth: 500 }}
            >
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
                  <span className="badge bg-warning">{transaction.status}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Date</span>
                  <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="d-grid gap-2"
            style={{ maxWidth: 300, margin: '0 auto' }}
          >
            <button className="btn btn-primary" onClick={() => router.push('/dashboard/checkout')}>
              Try Again
            </button>
            <button className="btn btn-outline-secondary" onClick={() => router.push('/dashboard/subscription')}>
              Back to Subscription
            </button>
          </motion.div>
        </div>
      </main>
    </motion.div>
  )
}
