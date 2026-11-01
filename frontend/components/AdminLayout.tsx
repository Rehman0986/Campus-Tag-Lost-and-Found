"use client"

import React from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="d-flex">
      <aside className="sidebar">
        <div className="sidebar-brand bg-dark text-white">Campus Tag Admin</div>
        <nav className="sidebar-nav p-0">
          <a href="/admin" className="nav-link active d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">dashboard</span> Overview
          </a>
          <a href="/admin/users" className="nav-link d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">people</span> Users
          </a>
          <a href="/admin/organizations" className="nav-link d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">business</span> Organizations
          </a>
          <a href="/admin/subscriptions" className="nav-link d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">payment</span> Subscriptions
          </a>
          <a href="/admin/reports" className="nav-link d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">analytics</span> Reports
          </a>
          <a href="/admin/audit" className="nav-link d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">history</span> Audit Logs
          </a>
          <a href="/admin/settings" className="nav-link d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">settings</span> Settings
          </a>
        </nav>
      </aside>
      <div className="flex-grow-1">
        <header className="topbar">
          <h5 className="mb-0 text-dark">Super Admin Panel</h5>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  )
}
