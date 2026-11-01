"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import PublicLayout from '@/components/PublicLayout'

interface Plan {
  id: number
  name: string
  price: number
  currency: string
  trial_days: number
  item_limit: number
  features: string
  is_active: boolean
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/subscriptions/plans/')
      .then((res) => {
        const data = res.data.results || res.data
        setPlans(data.filter((p: Plan) => p.is_active))
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <section className="py-5">
        <div className="container">
          <h1 className="mb-4 fw-bold">Pricing</h1>
          <p className="text-center mb-5">Choose the plan that fits your needs.</p>
          <div className="row g-4 justify-content-center">
            {loading ? (
              <div className="col-12 text-center py-5 text-muted">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="col-12 text-center py-5 text-muted">No plans available.</div>
            ) : (
              plans.map((plan) => (
                <div className="col-md-4" key={plan.id}>
                  <div className={`card shadow-sm border-0 h-100 text-center ${plan.item_limit >= 999999 ? 'border-primary' : ''}`}>
                    <div className="card-body">
                      {plan.item_limit >= 999999 && <span className="badge bg-primary mb-3">Most Popular</span>}
                      <h5 className="card-title">{plan.name}</h5>
                      <div className="display-4 fw-bold mb-3">${plan.price}</div>
                      <span className="text-muted small d-block mb-4">{plan.currency} / year</span>
                      <ul className="list-unstyled mb-4 text-start small text-muted">
                        {plan.item_limit >= 999999 ? (
                          <li>Unlimited items</li>
                        ) : (
                          <li>Up to {plan.item_limit} items</li>
                        )}
                        {plan.trial_days > 0 && <li>{plan.trial_days} day free trial</li>}
                        <li>QR code generation</li>
                        <li>Finder reports</li>
                      </ul>
                      <Link
                        href={plan.name === 'Free' ? '/auth/register' : '/dashboard/subscription'}
                        className={`btn ${plan.item_limit >= 999999 ? 'btn-primary' : 'btn-outline-primary'} w-100`}
                      >
                        {plan.name === 'Free' ? 'Start Free' : 'Choose Plan'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
