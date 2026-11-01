"use client"

import { useState } from 'react'
import { api } from '@/lib/api'
import PublicLayout from '@/components/PublicLayout'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contact/messages/', form)
      toast.success('Message sent successfully!')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <section className="py-5">
        <div className="container">
          <h1 className="mb-4 fw-bold">Contact Support</h1>
          <div className="row g-4">
            <div className="col-md-6">
              <form className="card shadow-sm border-0 p-4" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm border-0 p-4">
                <h5 className="card-title">Contact Info</h5>
                <p className="card-text"><strong>Email:</strong> support@campustag.local</p>
                <p className="card-text"><strong>Phone:</strong> +1 (555) 000-0000</p>
                <p className="card-text"><strong>Address:</strong> 123 Campus Lane, University City</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
