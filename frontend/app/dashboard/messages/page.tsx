"use client"

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications/')
      .then((res) => setNotifications(res.data.results || res.data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/mark-read/`)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read/')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) {
    return <div className="text-muted py-5 text-center">Loading messages...</div>
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0">Messages & Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn btn-outline-primary btn-sm">
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="list-group list-group-flush">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`list-group-item list-group-item-action border-0 ${!n.is_read ? 'bg-light' : ''} d-flex justify-content-between align-items-center`}
              onClick={() => !n.is_read && markRead(n.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className={`mb-0 ${!n.is_read ? 'fw-bold' : 'fw-normal'}`}>{n.title}</h6>
                  <span className={`badge ${!n.is_read ? 'bg-primary' : 'bg-secondary'}`}>
                    {!n.is_read ? 'New' : 'Read'}
                  </span>
                </div>
                <p className="text-muted small mb-1">{n.message}</p>
                <div className="text-muted small">{new Date(n.created_at).toLocaleDateString()}</div>
              </div>
              {!n.is_read && (
                <span className="badge bg-primary rounded-pill">New</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
