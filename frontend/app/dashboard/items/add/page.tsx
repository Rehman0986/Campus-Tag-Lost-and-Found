"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { LocationPicker } from '@/components/MapComponent'

export default function AddItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    status: 'active',
    is_lost_mode: false,
    last_reported_location: '',
    last_reported_latitude: null as number | null,
    last_reported_longitude: null as number | null,
  })
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)

  useEffect(() => {
    api.get('/items/categories/')
      .then((res) => setCategories(res.data.results || res.data))
      .catch(() => setCategories([]))
  }, [])

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setMapLocation({ lat, lng, address: address || '' })
    setForm({
      ...form,
      last_reported_location: address || '',
      last_reported_latitude: lat,
      last_reported_longitude: lng,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/items/items/', {
        name: form.name,
        description: form.description,
        category: form.category || undefined,
        status: form.status,
        is_lost_mode: form.is_lost_mode,
        last_reported_location: form.last_reported_location,
        last_reported_latitude: form.last_reported_latitude,
        last_reported_longitude: form.last_reported_longitude,
      })
      router.push('/dashboard/items')
    } catch (err: any) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const firstField = Object.values(data)[0]
        setError(Array.isArray(firstField) ? firstField[0] : String(firstField))
      } else {
        setError(data?.detail || 'Failed to create item.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <nav className="mb-4">
        <a href="/dashboard/items" className="text-muted text-decoration-none">&larr; Back to Items</a>
      </nav>
      <h1 className="mb-4 fw-bold">Add New Item</h1>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="card shadow-sm border-0 p-4" style={{ maxWidth: 700 }}>
        <div className="mb-3">
          <label className="form-label">Item Name</label>
          <input
            type="text"
            className="form-control"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            className="form-select"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="lost">Lost</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <div className="mb-3 form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={form.is_lost_mode}
            onChange={(e) => setForm({ ...form, is_lost_mode: e.target.checked })}
          />
          <label className="form-check-label">Mark as Lost Mode</label>
        </div>

        <hr className="my-4" />
        <h6 className="mb-3 fw-bold">Location (Optional)</h6>
        <p className="text-muted small mb-3">Set where the item was last seen. This helps finders locate it on the map.</p>
        <LocationPicker
          value={form.last_reported_latitude && form.last_reported_longitude
            ? [form.last_reported_latitude, form.last_reported_longitude]
            : null}
          address={form.last_reported_location}
          onChange={handleLocationSelect}
          height="350px"
        />

        <div className="mt-4">
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Creating...' : 'Create Item'}
          </button>
        </div>
      </form>
    </div>
  )
}
