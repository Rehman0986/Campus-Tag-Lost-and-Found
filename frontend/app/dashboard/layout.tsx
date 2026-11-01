"use client"

import CustomerLayout from '@/components/CustomerLayout'
import { CustomerGuard } from '@/components/RoleGuard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CustomerGuard>
      <CustomerLayout>{children}</CustomerLayout>
    </CustomerGuard>
  )
}
