"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/site-content/')
      .then((res) => {
        const contents = res.data.results || res.data
        const map: Record<string, string> = {}
        contents.forEach((c: any) => { map[c.key] = c.value })
        setSettings(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="mb-4 fw-bold">Website Settings</h1>
      {loading ? (
        <div className="text-muted">Loading settings...</div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label className="form-label">Site Name</label>
                <input type="text" className="form-control" defaultValue={settings.site_name || 'Campus Tag'} />
              </div>
              <div className="mb-3">
                <label className="form-label">Footer Text</label>
                <input type="text" className="form-control" defaultValue={settings.footer_text || 'Scan It to Find It'} />
              </div>
              <div className="mb-3">
                <label className="form-label">Site URL</label>
                <input type="url" className="form-control" defaultValue={settings.site_url || 'http://localhost:3000'} />
              </div>
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  defaultChecked={settings.maintenance_mode === 'true'}
                />
                <label className="form-check-label">Enable maintenance mode</label>
              </div>
              <button type="submit" className="btn btn-primary">Save Settings</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
