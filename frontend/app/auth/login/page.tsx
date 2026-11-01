"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login/', { email, password })
      api.auth.setToken(data.access, data.refresh)
      router.push('/dashboard')
    } catch (err: any) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        const firstField = Object.values(data)[0]
        setError(Array.isArray(firstField) ? firstField[0] : String(firstField))
      } else {
        setError(data?.detail || 'Login failed. Please try again.')
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
            <h2 className="text-center mb-4 fw-bold">Welcome Back</h2>
            {error && <div className="alert alert-danger mb-3">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="text-center mt-3 text-muted small">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
