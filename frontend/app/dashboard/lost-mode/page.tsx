"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function LostModePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/items/items/')
      .then((res) => {
        const allItems = res.data.results || res.data
        setItems(allItems.filter((i: any) => i.is_lost_mode || i.status === 'lost'))
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-muted py-5 text-center">Loading lost mode items...</div>
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0">Lost Mode Items</h1>
        <p className="text-muted small mb-0">Items currently in Lost Mode or marked as lost.</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No items in lost mode.</p>
        </div>
      ) : (
        <div className="row g-4">
          {items.map((item) => (
            <div className="col-md-6 col-lg-4" key={item.id}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{item.name}</h5>
                    <span className="badge bg-warning">Lost Mode</span>
                  </div>
                  <p className="card-text text-muted small">{item.description?.slice(0, 100) || 'No description'}</p>
                  <p className="text-muted small mb-3">
                    <strong>Public ID:</strong> {item.public_item_id}
                  </p>
                  {item.last_reported_location && (
                    <p className="card-text text-muted small mb-3">
                      <strong>Last seen:</strong> {item.last_reported_location}
                    </p>
                  )}
                  <div className="d-grid gap-2">
                    <a href={`/dashboard/items/${item.public_item_id}`} className="btn btn-outline-primary btn-sm">
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
