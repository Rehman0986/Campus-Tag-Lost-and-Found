"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/finder/reports/')
      .then((res) => setReports(res.data.results || res.data))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="mb-4 fw-bold">Finder Reports</h1>
      {loading ? (
        <div className="text-muted">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-5 text-muted">No finder reports yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Item</th>
                <th>Finder</th>
                <th>Message</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.item_public_id}</td>
                  <td>{r.finder_name || 'Anonymous'}</td>
                  <td>{r.message}</td>
                  <td>{r.location || '—'}</td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${r.is_read ? 'bg-secondary' : 'bg-primary'}`}>
                      {r.is_read ? 'Read' : 'Unread'}
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
