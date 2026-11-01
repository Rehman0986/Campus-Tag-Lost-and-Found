"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function CustomerDashboard() {
  const [stats, setStats] = useState<any>({ items: 0, lost: 0, recovered: 0, reports: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/items/items/')
      .then((res) => {
        const items = res.data.results || res.data
        setStats({
          items: items.length,
          lost: items.filter((i: any) => i.status === 'lost').length,
          recovered: items.filter((i: any) => i.status === 'recovered').length,
        })
      })
      .catch(() => {})
    api.get('/finder/reports/')
      .then((res) => {
        const reports = res.data.results || res.data
        setStats((prev) => ({ ...prev, reports: reports.length }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="mb-4 fw-bold">Overview</h1>
      <div className="row g-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <div className="text-primary fs-4 fw-bold">{stats.items}</div>
              <div className="text-muted small">Total Items</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <div className="text-warning fs-4 fw-bold">{stats.lost}</div>
              <div className="text-muted small">Lost Items</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <div className="text-success fs-4 fw-bold">{stats.recovered}</div>
              <div className="text-muted small">Recovered</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body text-center">
              <div className="text-info fs-4 fw-bold">{stats.reports}</div>
              <div className="text-muted small">Finder Reports</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="mb-3 fw-bold">Quick Actions</h3>
        <div className="row g-3">
          <div className="col-md-3">
            <a href="/dashboard/items/add" className="btn btn-primary w-100">Add Item</a>
          </div>
          <div className="col-md-3">
            <a href="/dashboard/qr-codes" className="btn btn-outline-primary w-100">QR Codes</a>
          </div>
          <div className="col-md-3">
            <a href="/dashboard/reports" className="btn btn-outline-primary w-100">Finder Reports</a>
          </div>
          <div className="col-md-3">
            <a href="/dashboard/subscription" className="btn btn-outline-primary w-100">Subscription</a>
          </div>
        </div>
      </div>
    </div>
  )
}
