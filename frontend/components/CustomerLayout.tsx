"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { auth } from '@/lib/api'
import { AnimatePresence, motion } from 'framer-motion'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const handleLogout = () => {
    auth.clearToken()
    window.location.href = '/auth/login'
  }

  return (
    <div className="d-flex">
      <aside className="sidebar">
        <Link href="/dashboard" className="sidebar-brand">Campus Tag</Link>
        <nav className="sidebar-nav p-0">
          <Link href="/dashboard" className={`nav-link ${pathname === '/' ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">dashboard</span> Overview
          </Link>
          <Link href="/dashboard/items" className={`nav-link ${pathname.startsWith('/dashboard/items') ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">inventory_2</span> My Items
          </Link>
          <Link href="/dashboard/items/add" className={`nav-link ${pathname === '/dashboard/items/add' ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">add_circle</span> Add Item
          </Link>
          <Link href="/dashboard/qr-codes" className={`nav-link ${pathname === '/dashboard/qr-codes' ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">qr_code</span> QR Codes
          </Link>
          <Link href="/dashboard/reports" className={`nav-link ${pathname === '/dashboard/reports' ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">report</span> Finder Reports
          </Link>
          <Link href="/dashboard/subscription" className={`nav-link ${pathname.startsWith('/dashboard/subscription') ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">payment</span> Subscription
          </Link>
          <Link href="/dashboard/checkout" className={`nav-link ${pathname === '/dashboard/checkout' ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">shopping_cart</span> Checkout
          </Link>
          <Link href="/dashboard/messages" className={`nav-link ${pathname.startsWith('/dashboard/messages') ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">notifications</span> Messages
          </Link>
          <Link href="/dashboard/lost-mode" className={`nav-link ${pathname === '/dashboard/lost-mode' ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">warning</span> Lost Mode
          </Link>
          <Link href="/dashboard/recovered-items" className={`nav-link ${pathname === '/dashboard/recovered-items' ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">check_circle</span> Recovered Items
          </Link>
          <Link href="/dashboard/help" className={`nav-link ${pathname === '/dashboard/help' ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">help</span> Help
          </Link>
          <Link href="/dashboard/settings" className={`nav-link ${pathname === '/dashboard/settings' ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">settings</span> Settings
          </Link>
          <Link href="/dashboard/profile" className={`nav-link ${pathname === '/dashboard/profile' ? 'active' : ''} d-flex align-items-center gap-2`}>
            <span className="material-symbols-outlined">person</span> Profile
          </Link>
        </nav>
        <div className="p-3 border-top">
          <button className="btn btn-danger w-100" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <div className="flex-grow-1">
        <header className="topbar">
          <h5 className="mb-0 text-dark">Dashboard</h5>
          <div className="text-end">
            <span className="badge bg-success">Online</span>
          </div>
        </header>
        <main className="dashboard-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fade-in-page"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
