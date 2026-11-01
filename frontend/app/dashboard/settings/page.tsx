"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/customers/profiles/me/')
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="mb-4 fw-bold">Organization Settings</h1>
      {loading ? (
        <div className="text-muted">Loading settings...</div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <p className="text-muted"><strong>Organization:</strong> {profile?.organization?.name || '—'}</p>
            <p className="text-muted"><strong>Contact Email:</strong> {profile?.organization?.contact_email || '—'}</p>
            <p className="text-muted"><strong>Contact Phone:</strong> {profile?.phone || '—'}</p>
            <p className="text-muted"><strong>Address:</strong> {profile?.address || '—'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
