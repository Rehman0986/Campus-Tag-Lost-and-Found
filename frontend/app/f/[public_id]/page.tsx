"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import MapComponent from '@/components/MapComponent'

export default function FinderPage({ params }: { params: { public_id: string } }) {
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [finderName, setFinderName] = useState('')
  const [finderContact, setFinderContact] = useState('')
  const [location, setLocation] = useState('')
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setMapLocation({ lat, lng, address: address || '' })
    setLocation(address || '')
  }

  useEffect(() => {
    fetch(`${baseUrl}/finder/public/${params.public_id}/`)
      .then((r) => r.json())
      .then((data) => { setItem(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.public_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('message', message)
      formData.append('finder_name', finderName)
      formData.append('finder_contact', finderContact)
      formData.append('location', location)
      if (mapLocation) {
        formData.append('latitude', String(mapLocation.lat))
        formData.append('longitude', String(mapLocation.lng))
      }
      const res = await fetch(`${baseUrl}/finder/public/${params.public_id}/report/`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-muted py-5 text-center">Loading...</div>
  if (!item) return <div className="text-danger py-5 text-center">Item not found.</div>

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h2 className="text-center mb-4 fw-bold">Item Found</h2>
              <h5 className="text-center mb-3">{item.name}</h5>
              <p className="text-muted text-center">{item.description || 'No description provided.'}</p>
              {item.category && <p className="text-muted text-center small"><strong>Category:</strong> {item.category}</p>}
              <p className="text-center"><span className={`badge ${item.is_lost_mode ? 'bg-warning' : 'bg-success'}`}>
                {item.is_lost_mode ? 'Lost Mode Active' : 'Active'}
              </span></p>
              {item.photos?.length > 0 && (
                <div className="text-center mb-3">
                  <img src={item.photos[0].image} alt={item.name} className="img-fluid rounded" style={{ maxHeight: 200 }} />
                </div>
              )}
              {status === 'success' && (
                <div className="alert alert-success text-center mb-3">Message sent successfully!</div>
              )}
              {status === 'error' && (
                <div className="alert alert-danger text-center mb-3">Failed to send message. Try again.</div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Your Message</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Let the owner know where you found the item..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Your Name (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={finderName}
                    onChange={(e) => setFinderName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contact (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={finderContact}
                    onChange={(e) => setFinderContact(e.target.value)}
                    placeholder="Email or phone number"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Location (optional)</label>
                  <p className="text-muted small mb-2">Drop a pin on the map or type the location where you found the item.</p>
                  <div className="border rounded p-2 mb-2" style={{ height: '200px' }}>
                    <MapComponent
                      center={[31.2304, 121.4737]}
                      zoom={15}
                      showMarker
                      onLocationSelect={handleLocationSelect}
                      searchEnabled
                      height="200px"
                    />
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Library, 2nd floor"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message to Owner'}
                </button>
              </form>
              <p className="text-center text-muted small mt-3">
                Your message is sent anonymously. The owner will not see your private details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
