"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function PaymentPendingPage() {
  const router = useRouter()
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

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
          toast.success('Payment confirmed! Redirecting to subscription...')
          setTimeout(() => router.push('/dashboard/subscription'), 2000)
        }
      })
      .catch(() => {
        toast.error('Failed to check payment status.')
      })
      .finally(() => setLoading(false))
  }, [router])

  const checkStatus = () => {
    setChecking(true)
    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    if (!sessionId) return

    api.get('/subscriptions/success/', { params: { session_id: sessionId } })
      .then((res) => {
        setTransaction(res.data.transaction)
        if (res.data.status === 'success') {
          toast.success('Payment confirmed!')
          router.push('/dashboard/subscription')
        } else {
          toast('Payment is still pending. Please wait.')
        }
      })
      .catch(() => {
        toast.error('Failed to check payment status.')
      })
      .finally(() => setChecking(false))
  }

  const spinnerVariants = {
    rotate: { rotate: 360 },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-vh-100 d-flex flex-column"
    >
      <main className="flex-fill py-5">
        <div className="container text-center">
          <div className="mb-4">
            <motion.div
              animate={spinnerVariants.rotate}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="d-inline-block"
              style={{ width: '60px', height: '60px', border: '4px solid #f3f3f3', borderTop: '4px solid #0d6efd', borderRadius: '50%' }}
            />
          </div>
          <h1 className="fw-bold mb-3">Payment Pending</h1>
          <p className="text-muted mb-5">
            Your payment is being processed. Please wait while we verify the transaction.
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
                  <span className="badge bg-info text-dark">{transaction.status}</span>
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
            <button
              className="btn btn-primary"
              onClick={checkStatus}
              disabled={checking}
            >
              {checking ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Checking...
                </>
              ) : (
                'Check Status'
              )}
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
