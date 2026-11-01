"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { auth } from '@/lib/api'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const isAuth = auth.isAuthenticated()

  const handleLogout = () => {
    auth.clearToken()
    router.push('/auth/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <span className="fw-bold text-primary fs-4">Campus Tag</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Home</Link>
            </li>
            <li className="nav-item">
              <Link href="/about" className={`nav-link ${pathname === '/about' ? 'active' : ''}`}>How It Works</Link>
            </li>
            <li className="nav-item">
              <Link href="/features" className={`nav-link ${pathname === '/features' ? 'active' : ''}`}>Features</Link>
            </li>
            <li className="nav-item">
              <Link href="/pricing" className={`nav-link ${pathname === '/pricing' ? 'active' : ''}`}>Pricing</Link>
            </li>
            <li className="nav-item">
              <Link href="/contact" className={`nav-link ${pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
            </li>
          </ul>
          <div className="d-flex gap-2">
            {isAuth ? (
              <>
                {auth.getToken() && (
                  <>
                    <Link href="/dashboard" className="btn btn-outline-primary">Dashboard</Link>
                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-outline-primary">Sign In</Link>
                <Link href="/auth/register" className="btn btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
