"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  motion,
  AnimatePresence,
} from 'framer-motion'

interface Plan {
  id: number
  name: string
  slug: string
  price: number
  currency: string
  trial_days: number
  item_limit: number
  features: string
  is_active: boolean
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const cardHover = {
  rest: { scale: 1, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  hover: { scale: 1.02, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' },
}

export default function CheckoutPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/subscriptions/plans/')
      const data = res.data.results || res.data
      setPlans(data.filter((p: Plan) => p.is_active))
    } catch (err: any) {
      setError('Failed to load plans. Please try again later.')
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
    setError('')
    toast.success(`Selected ${plan.name} plan`)
  }

  const handleCheckout = async () => {
    if (!selectedPlan) {
      setError('Please select a plan first.')
      return
    }

    setCreating(true)
    setError('')
    try {
      const res = await api.post('/subscriptions/create-checkout-session/', {
        plan_id: selectedPlan.id,
        success_url: `${window.location.origin}/dashboard/subscription/success`,
        cancel_url: `${window.location.origin}/dashboard/subscription/cancel`,
      })

      const checkoutUrl = res.data.checkout_url
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        setError('No checkout URL returned from server.')
      }
    } catch (err: any) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const firstField = Object.values(data)[0]
        setError(Array.isArray(firstField) ? firstField[0] : String(firstField))
      } else {
        setError(data?.error || data?.detail || 'Failed to start checkout. Please try again.')
      }
      toast.error(error || 'Checkout failed')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="d-flex align-items-center justify-content-center min-vh-100"
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading plans...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-vh-100 d-flex flex-column"
    >
      <main className="flex-fill py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fw-bold mb-0">Select a Plan</h1>
                <Link href="/dashboard/subscription" className="btn btn-outline-secondary btn-sm">
                  ← Back to Subscription
                </Link>
              </div>
              <p className="text-muted mb-4">Choose the subscription plan that fits your needs.</p>

              {error && (
                <div className="alert alert-danger mb-3" role="alert">
                  {error}
                </div>
              )}

              <div className="row g-4">
                {plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    whileHover={cardHover.hover}
                    whileTap={cardHover.rest}
                    initial={fadeInUp.hidden}
                    animate={fadeInUp.visible}
                    className="col-md-6 col-lg-4"
                  >
                    <div className={`card border-0 shadow-sm h-100 ${selectedPlan?.id === plan.id ? 'border-primary' : 'border-light'}`}>
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title mb-0">{plan.name}</h5>
                          {plan.trial_days > 0 && (
                            <span className="badge bg-info text-dark">Free Trial</span>
                          )}
                        </div>
                        <div className="mb-3">
                          <span className="display-4 fw-bold">${plan.price}</span>
                          <span className="text-muted"> {plan.currency}</span>
                          <span className="text-muted small">/year</span>
                        </div>
                        <div className="mb-3 flex-grow-1">
                          <h6 className="text-muted small mb-2">Features</h6>
                          <ul className="list-unstyled text-muted small">
                            {(plan.features || '').split(',').map((f, i) => (
                              <li key={i} className="mb-1 d-flex align-items-start">
                                <span className="me-2 text-success">✓</span>
                                {f.trim()}
                              </li>
                            ))}
                            <li className="mt-2 d-flex align-items-start">
                              <span className="me-2 text-primary">📦</span>
                              {plan.item_limit} items limit
                            </li>
                            {plan.trial_days > 0 && (
                              <li className="d-flex align-items-start">
                                <span className="me-2 text-info">🎁</span>
                                {plan.trial_days} day free trial
                              </li>
                            )}
                          </ul>
                        </div>
                        <button
                          onClick={() => handleSelectPlan(plan)}
                          className={`btn w-100 mb-2 ${selectedPlan?.id === plan.id ? 'btn-primary' : 'btn-outline-primary'}`}
                          disabled={creating}
                        >
                          {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {selectedPlan && (
                <motion.div
                  initial={fadeInUp.hidden}
                  animate={fadeInUp.visible}
                  className="mt-5 card shadow-sm border-0"
                >
                  <div className="card-header bg-white border-bottom">
                    <h5 className="mb-0 fw-bold">Checkout Summary</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Selected Plan</span>
                      <span className="fw-bold">{selectedPlan.name}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Amount</span>
                      <span className="fw-bold">${selectedPlan.price} {selectedPlan.currency}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <span className="text-muted">Billing Cycle</span>
                      <span className="text-muted">Annual</span>
                    </div>
                    <div className="d-grid">
                      <button
                        onClick={handleCheckout}
                        className="btn btn-primary btn-lg"
                        disabled={creating}
                      >
                        {creating ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          'Proceed to Payment'
                        )}
                      </button>
                    </div>
                    <p className="text-muted small mt-3">
                      You will be redirected to a secure payment page to complete your purchase.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  )
}
