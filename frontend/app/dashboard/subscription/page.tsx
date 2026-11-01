"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/subscriptions/subscriptions/'),
      api.get('/subscriptions/plans/'),
    ]).then(([subRes, planRes]) => {
      const subs = subRes.data.results || subRes.data
      setSubscription(subs[0] || null)
      setPlans(planRes.data.results || planRes.data)
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSelectPlan = (plan: any) => {
    toast.success(`Selected ${plan.name}. Proceeding to checkout...`)
    // Will redirect to checkout
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-vh-100 d-flex flex-column"
    >
      <main className="flex-fill py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fw-bold mb-0">Subscription & Billing</h1>
            <Link href="/dashboard/checkout" className="btn btn-primary">
              Change Plan
            </Link>
          </div>

          {loading ? (
            <div className="text-muted">Loading subscription...</div>
          ) : (
            <>
              <div className="row mb-5">
                <div className="col-md-6 col-lg-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card shadow-sm border-0 h-100"
                  >
                    <div className="card-body text-center">
                      <h5 className="card-title mb-3">Current Plan</h5>
                      {subscription ? (
                        <>
                          <span className="display-4 fw-bold">{subscription.plan?.name || 'Free'}</span>
                          <p className="text-muted mb-3">${subscription.plan?.price || 0} {subscription.plan?.currency || 'USD'}</p>
                          <span className={`badge ${subscription.is_active_subscription ? 'bg-success' : 'bg-secondary'}`}>
                            {subscription.status}
                          </span>
                          <p className="text-muted small mt-3">
                            <strong>Expires:</strong> {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : '—'}
                          </p>
                          <p className="text-muted small">
                            <strong>Auto Renew:</strong> {subscription.auto_renew ? 'Yes' : 'No'}
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="display-4 fw-bold">No Plan</span>
                          <p className="text-muted mb-3">You are on the free plan.</p>
                          <span className="badge bg-secondary">Inactive</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card shadow-sm border-0 h-100"
                  >
                    <div className="card-body text-center">
                      <h5 className="card-title mb-3">Items Limit</h5>
                      <span className="display-4 fw-bold">{subscription?.plan?.item_limit || 5}</span>
                      <p className="text-muted mb-3">Total items allowed</p>
                    </div>
                  </motion.div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card shadow-sm border-0 h-100"
                  >
                    <div className="card-body text-center">
                      <h5 className="card-title mb-3">Trial Days</h5>
                      <span className="display-4 fw-bold">{subscription?.plan?.trial_days || 0}</span>
                      <p className="text-muted mb-3">Free trial period</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0 fw-bold">Available Plans</h5>
                </div>
                <div className="card-body">
                  {plans.length === 0 ? (
                    <div className="text-center py-4 text-muted">No plans available.</div>
                  ) : (
                    <div className="row g-4">
                      {plans.map((p) => (
                        <motion.div
                          key={p.id}
                          whileHover={{ y: -5 }}
                          initial={fadeInUp.hidden}
                          animate={fadeInUp.visible}
                          className="col-md-6 col-lg-4"
                        >
                          <div className={`card border-0 shadow-sm h-100 ${subscription?.plan?.id === p.id ? 'border-primary' : 'border-light'}`}>
                            <div className="card-body d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <h5 className="card-title mb-0">{p.name}</h5>
                                {subscription?.plan?.id === p.id && (
                                  <span className="badge bg-primary">Current</span>
                                )}
                                {p.trial_days > 0 && (
                                  <span className="badge bg-info text-dark">Free Trial</span>
                                )}
                              </div>
                              <div className="mb-3">
                                <span className="display-4 fw-bold">${p.price}</span>
                                <span className="text-muted"> {p.currency}</span>
                                <span className="text-muted small">/year</span>
                              </div>
                              <div className="mb-3 flex-grow-1">
                                <h6 className="text-muted small mb-2">Features</h6>
                                <ul className="list-unstyled text-muted small">
                                  {(p.features || '').split(',').map((f, i) => (
                                    <li key={i} className="mb-1 d-flex align-items-start">
                                      <span className="me-2 text-success">✓</span>
                                      {f.trim()}
                                    </li>
                                  ))}
                                  <li className="mt-2 d-flex align-items-start">
                                    <span className="me-2 text-primary">📦</span>
                                    {p.item_limit} items limit
                                  </li>
                                  {p.trial_days > 0 && (
                                    <li className="d-flex align-items-start">
                                      <span className="me-2 text-info">🎁</span>
                                      {p.trial_days} day free trial
                                    </li>
                                  )}
                                </ul>
                              </div>
                              {subscription?.plan?.id === p.id ? (
                                <button className="btn btn-outline-primary w-100" disabled>
                                  Current Plan
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSelectPlan(p)}
                                  className="btn btn-primary w-100"
                                >
                                  Select Plan
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </motion.div>
  )
}
