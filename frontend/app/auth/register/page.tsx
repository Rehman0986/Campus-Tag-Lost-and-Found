"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register/', {
        email: form.email,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
      })
      router.push('/auth/login')
    } catch (err: any) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const firstField = Object.values(data)[0]
        setError(Array.isArray(firstField) ? firstField[0] : String(firstField))
      } else {
        setError(data?.detail || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="text-center mb-4 fw-bold">Create Account</h2>
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            <form onSubmit={handleSubmit}>
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
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <div className="form-text">Minimum 8 characters</div>
              </div>
              <div className="mb-3">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
            <p className="text-center mt-3 text-muted small">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
