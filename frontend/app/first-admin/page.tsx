"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function FirstSuperAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })

  useEffect(() => {
    api.get('/auth/first-admin-check/')
      .then((res) => {
        if (res.data.super_admin_exists) {
          router.push('/auth/login')
        } else {
          setChecking(false)
        }
      })
      .catch(() => {
        setChecking(false)
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/first-super-admin-register/', {
        email: form.email,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
      })
      api.auth.setToken(res.data.access, res.data.refresh)
      router.push('/admin')
    } catch (err: any) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const firstField = Object.values(data)[0]
        setError(Array.isArray(firstField) ? firstField[0] : String(firstField))
      } else {
        setError(data?.error || data?.detail || 'Super admin registration failed.')
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Checking setup...</p>
        </div>
      </div>
    )
  }

  if (checking) {
    return null
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
        <div className="container">
          <Link href="/" className="navbar-brand fw-bold text-primary fs-4">Campus Tag</Link>
        </div>
      </nav>
      <main className="flex-fill py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-sm border-0 p-4">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">First-Time Setup</h2>
                  <p className="text-muted">Register your platform Super Admin account.</p>
                </div>
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
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Creating Super Admin...' : 'Create Super Admin'}
                  </button>
                </form>
                <p className="text-center mt-4 text-muted small">
                  This is a one-time setup. Public registration creates customer accounts only.
                </p>
                <p className="text-center mt-2">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary fw-medium">Sign In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-dark text-white pt-4 pb-3">
        <div className="container text-center">
          <p className="text-muted small mb-0">&copy; {new Date().getFullYear()} Campus Tag. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
