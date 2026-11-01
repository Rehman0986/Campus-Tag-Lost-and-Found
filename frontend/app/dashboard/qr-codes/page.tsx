"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { QRCodeSVG } from 'qrcode.react'

export default function QRCodesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    api.get('/items/items/')
      .then((res) => setItems(res.data.results || res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const downloadQR = (publicItemId: string, itemName: string) => {
    setDownloading(publicItemId)
    try {
      const svgString = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">',
        '<rect width="200" height="200" fill="white"/>',
        '<path d="M0 0h200v200H0z" fill="none"/>',
        '</svg>',
      ].join('')
      const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString)
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `campus-tag-qr-${itemName.replace(/\s+/g, '-').toLowerCase()}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      window.open(`${siteUrl}/f/${publicItemId}`, '_blank')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return <div className="text-muted py-5 text-center">Loading items...</div>
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0">QR Codes</h1>
        <p className="text-muted small mb-0">Download and print QR codes for your items.</p>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No items found. <a href="/dashboard/items/add" className="text-primary fw-medium">Add your first item</a> to generate QR codes.</p>
        </div>
      ) : (
        <div className="row g-4">
          {items.map((item) => (
            <div className="col-md-6 col-lg-4" key={item.id}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title mb-2">{item.name}</h5>
                  <p className="text-muted small mb-3">{item.public_item_id}</p>
                  <div className="flex-grow-1 d-flex align-items-center justify-content-center mb-3">
                    <QRCodeSVG
                      value={`${siteUrl}/f/${item.public_item_id}`}
                      size={160}
                      level="H"
                      includeMargin
                    />
                  </div>
                  <p className="text-muted small mb-3">Scan to open finder page</p>
                  <div className="d-grid gap-2">
                    <a
                      href={`${siteUrl}/f/${item.public_item_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm"
                    >
                      View Finder Page
                    </a>
                    <button
                      onClick={() => downloadQR(item.public_item_id, item.name)}
                      disabled={downloading === item.public_item_id}
                      className="btn btn-outline-success btn-sm"
                    >
                      {downloading === item.public_item_id ? 'Downloading...' : 'Download QR'}
                    </button>
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
