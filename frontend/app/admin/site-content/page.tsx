"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface SiteContentItem {
  id: string
  key: string
  value: string
  value_type: string
  is_public: boolean
  updated_by_email: string | null
  updated_at: string
}

export default function AdminSiteContentPage() {
  const [contents, setContents] = useState<SiteContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    api.get('/auth/site-content/')
      .then((res) => setContents(res.data.results || res.data))
      .catch(() => setContents([]))
      .finally(() => setLoading(false))
  }, [])

  const handleEdit = (item: SiteContentItem) => {
    setEditing(item.id)
    setEditValue(item.value)
  }

  const handleCancel = () => {
    setEditing(null)
    setEditValue('')
  }

  const handleSave = async (id: string) => {
    setSaving(id)
    try {
      await api.patch(`/auth/site-content/${id}/`, { value: editValue })
      setContents(contents.map((c) => c.id === id ? { ...c, value: editValue } : c))
      setEditing(null)
    } catch {
      alert('Failed to save content')
    } finally {
      setSaving(null)
    }
  }

  const defaultContent = [
    { key: 'site_name', label: 'Site Name', placeholder: 'Campus Tag' },
    { key: 'footer_text', label: 'Footer Text', placeholder: 'Scan It to Find It' },
    { key: 'site_url', label: 'Site URL', placeholder: 'http://localhost:3000' },
    { key: 'maintenance_mode', label: 'Maintenance Mode', placeholder: 'false' },
  ]

  useEffect(() => {
    const missing = defaultContent.filter((d: any) => !contents.find((c: any) => c.key === d.key))
    missing.forEach((d: any) => {
      api.post('/auth/site-content/', {
        key: d.key,
        value: d.placeholder,
        value_type: 'text',
        is_public: true,
      }).then((res: any) => {
        setContents((prev: any) => [...prev, res.data])
      }).catch(() => {})
    })
  }, [contents])

  if (loading) {
    return <div className="text-muted">Loading website content...</div>
  }

  return (
    <div>
      <h1 className="mb-4 fw-bold">Website Content</h1>
      <p className="text-muted mb-4">Manage dynamic website content. Changes take effect immediately.</p>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Key</th>
              <th>Label</th>
              <th>Value</th>
              <th>Type</th>
              <th>Public</th>
              <th>Updated</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contents.length > 0 ? contents.map((c: SiteContentItem) => (
              <tr key={c.id}>
                <td><code>{c.key}</code></td>
                <td>{defaultContent.find((d: any) => d.key === c.key)?.label || c.key}</td>
                <td>
                  {editing === c.id ? (
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleSave(c.id)}
                        disabled={saving === c.id}
                      >
                        {saving === c.id ? '...' : 'Save'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={handleCancel}
                        disabled={saving === c.id}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="text-truncate" style={{ maxWidth: '200px' }}>{c.value || '—'}</span>
                  )}
                </td>
                <td><span className="badge bg-secondary">{c.value_type}</span></td>
                <td>
                  <span className={`badge ${c.is_public ? 'bg-success' : 'bg-secondary'}`}>
                    {c.is_public ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>{new Date(c.updated_at).toLocaleDateString()}</td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(c)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">No content items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
