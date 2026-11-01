"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    api.get('/auth/users/')
      .then((res) => setUsers(res.data.results || res.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSuspend = async (id: string) => {
    setSaving(id)
    try {
      await api.post(`/auth/users/${id}/suspend/`)
      setUsers(users.map((u) => u.id === id ? { ...u, is_active: false } : u))
    } catch {
      alert('Failed to suspend user')
    } finally {
      setSaving(null)
    }
  }

  const handleReactivate = async (id: string) => {
    setSaving(id)
    try {
      await api.post(`/auth/users/${id}/reactivate/`)
      setUsers(users.map((u) => u.id === id ? { ...u, is_active: true } : u))
    } catch {
      alert('Failed to reactivate user')
    } finally {
      setSaving(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    setSaving(id)
    try {
      await api.delete(`/auth/users/${id}/`)
      setUsers(users.filter((u) => u.id !== id))
    } catch {
      alert('Failed to delete user')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0">User Management</h1>
      </div>
      {loading ? (
        <div className="text-muted">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-5 text-muted">No users found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Date Joined</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'super_admin' ? 'bg-danger' : 'bg-primary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.organization_name || u.organization || '—'}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'bg-success' : 'bg-secondary'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td className="text-end">
                    {u.role !== 'super_admin' && (
                      <>
                        {u.is_active ? (
                          <button
                            className="btn btn-sm btn-warning mb-1"
                            onClick={() => handleSuspend(u.id)}
                            disabled={saving === u.id}
                          >
                            {saving === u.id ? '...' : 'Suspend'}
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-success mb-1"
                            onClick={() => handleReactivate(u.id)}
                            disabled={saving === u.id}
                          >
                            {saving === u.id ? '...' : 'Reactivate'}
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(u.id)}
                          disabled={saving === u.id}
                        >
                          Delete
                        </button>
                      </>
                    )}
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
