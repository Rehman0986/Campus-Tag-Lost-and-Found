"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me/')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="mb-4 fw-bold">Profile & Security</h1>
      {loading ? (
        <div className="text-muted">Loading profile...</div>
      ) : user ? (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" defaultValue={user.email} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label">Role</label>
              <input type="text" className="form-control" defaultValue={user.role} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label">Organization</label>
              <input type="text" className="form-control" defaultValue={user.organization_name || '—'} readOnly />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-muted">Unable to load profile.</div>
      )}
    </div>
  )
}
