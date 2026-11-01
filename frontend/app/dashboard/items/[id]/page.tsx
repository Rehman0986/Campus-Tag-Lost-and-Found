"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import MapComponent from '@/components/MapComponent'

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/items/items/${params.id}/`)
      .then((res) => setItem(res.data))
      .catch(() => router.push('/dashboard/items'))
      .finally(() => setLoading(false))
  }, [params.id, router])

  if (loading) {
    return <div className="text-muted py-5 text-center">Loading item...</div>
  }
  if (!item) {
    return <div className="text-center py-5 text-muted">Item not found.</div>
  }

  const hasLocation = item.last_reported_latitude && item.last_reported_longitude

  return (
    <div>
      <nav className="mb-4">
        <a href="/dashboard/items" className="text-muted text-decoration-none">&larr; Back to Items</a>
      </nav>
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h1 className="card-title mb-0">{item.name}</h1>
            <span className={`badge ${item.status === 'lost' ? 'bg-warning' : item.status === 'recovered' ? 'bg-success' : 'bg-primary'}`}>
              {item.status}
            </span>
          </div>
          {item.is_lost_mode && <span className="badge bg-warning mb-2">Lost Mode Active</span>}
          <p className="text-muted"><strong>Public ID:</strong> {item.public_item_id}</p>
          <p className="text-muted"><strong>Category:</strong> {item.category_name || '—'}</p>
          <p className="text-muted"><strong>Description:</strong> {item.description || 'No description provided.'}</p>
          {hasLocation && (
            <div className="mt-4">
              <h6 className="fw-bold mb-2">Last Reported Location</h6>
              <p className="text-muted small">{item.last_reported_location}</p>
              <div className="border rounded p-2" style={{ height: '250px' }}>
                <MapComponent
                  center={[item.last_reported_latitude, item.last_reported_longitude]}
                  zoom={16}
                  showMarker
                  initialMarker={[item.last_reported_latitude, item.last_reported_longitude]}
                  searchEnabled={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <button
            onClick={() => {
              item.status === 'lost' ? markRecovered() : toggleLostMode()
            }}
            className={`btn w-100 ${item.status === 'lost' ? 'btn-success' : 'btn-outline-warning'}`}
          >
            {item.status === 'lost' ? 'Mark as Recovered' : 'Toggle Lost Mode'}
          </button>
        </div>
      </div>
    </div>
  )

  function toggleLostMode() {
    api.post(`/items/items/${item.public_item_id}/toggle-lost-mode/`)
      .then(() => router.push(`/dashboard/items/${item.public_item_id}`))
      .catch(() => alert('Failed to toggle lost mode'))
  }

  function markRecovered() {
    api.post(`/items/items/${item.public_item_id}/mark-recovered/`)
      .then(() => router.push(`/dashboard/items/${item.public_item_id}`))
      .catch(() => alert('Failed to mark recovered'))
  }
}
