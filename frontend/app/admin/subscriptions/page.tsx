"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/subscriptions/plans/')
      .then((res) => setPlans(res.data.results || res.data))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="mb-4 fw-bold">Subscription Plans</h1>
      {loading ? (
        <div className="text-muted">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-5 text-muted">No subscription plans found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Plan Name</th>
                <th>Price</th>
                <th>Trial Days</th>
                <th>Item Limit</th>
                <th>Features</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>${p.price} {p.currency}</td>
                  <td>{p.trial_days}</td>
                  <td>{p.item_limit}</td>
                  <td>{p.features || '—'}</td>
                  <td>
                    <span className={`badge ${p.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
