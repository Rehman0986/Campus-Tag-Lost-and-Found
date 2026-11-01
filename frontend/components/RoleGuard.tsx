"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

type UserRole = 'super_admin' | 'customer'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  redirectTo = '/auth/login',
}: RoleGuardProps) {
  const router = useRouter()
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    api.get('/auth/me/')
      .then((res) => {
        setRole(res.data.role as UserRole)
        setChecked(true)
      })
      .catch(() => {
        setRole(null)
        setChecked(true)
      })
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    if (!checked) return
    if (!role || !allowedRoles.includes(role)) {
      router.push(redirectTo)
    }
  }, [role, checked, allowedRoles, redirectTo, router])

  if (loading || !checked) {
    return fallback ?? (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!role || !allowedRoles.includes(role)) {
    return fallback ?? <div className="text-center py-5">Access denied.</div>
  }

  return <>{children}</>
}

export function SuperAdminGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleGuard allowedRoles={['super_admin']} children={children} fallback={fallback} redirectTo="/auth/login" />
}

export function CustomerGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleGuard allowedRoles={['customer', 'super_admin']} children={children} fallback={fallback} redirectTo="/auth/login" />
}
