"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/organizations/')
      .then((res) => setOrganizations(res.data.results || res.data))
      .catch(() => setOrganizations([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="mb-4 fw-bold">Organization Management</h1>
      {loading ? (
        <div className="text-muted">Loading organizations...</div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-5 text-muted">No organizations found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Contact Email</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td>{org.name}</td>
                  <td><span className="text-muted small">{org.slug}</span></td>
                  <td>{org.contact_email || '—'}</td>
                  <td>
                    <span className={`badge ${org.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {org.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(org.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
