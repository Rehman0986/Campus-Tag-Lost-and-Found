"use client"

import React from 'react'
import { Navbar } from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="container py-4">{children}</main>
      <Footer />
    </>
  )
}
