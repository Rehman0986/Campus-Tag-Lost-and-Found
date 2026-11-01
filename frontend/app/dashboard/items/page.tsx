"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/items/items/')
      .then((res) => setItems(res.data.results || res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0">My Items</h1>
        <a href="/dashboard/items/add" className="btn btn-primary">Add Item</a>
      </div>
      {loading ? (
        <div className="text-muted">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No items yet. <a href="/dashboard/items/add" className="text-primary fw-medium">Add your first item</a>.</p>
        </div>
      ) : (
        <div className="row g-4">
          {items.map((item) => (
            <div className="col-md-6 col-lg-4" key={item.id}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{item.name}</h5>
                    <span className={`badge ${item.status === 'lost' ? 'bg-warning' : item.status === 'recovered' ? 'bg-success' : item.status === 'disabled' ? 'bg-secondary' : 'bg-primary'}`}>
                      {item.status}
                    </span>
                  </div>
                  {item.is_lost_mode && (
                    <span className="badge bg-warning mb-2">Lost Mode Active</span>
                  )}
                  <p className="card-text text-muted small">{item.description?.slice(0, 100) || 'No description'}</p>
                  {item.last_reported_location && (
                    <p className="card-text text-muted small">
                      <strong>Last seen:</strong> {item.last_reported_location}
                    </p>
                  )}
                  <div className="mt-3">
                    <a href={`/dashboard/items/${item.public_item_id}`} className="btn btn-outline-primary btn-sm">View Details</a>
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
