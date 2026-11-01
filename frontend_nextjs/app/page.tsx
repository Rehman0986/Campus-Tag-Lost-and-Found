'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [demoId, setDemoId] = useState('cpt-8f92-a1b4');

  return (
    <main className="min-vh-100 d-flex flex-column">
      {/* University Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary py-3 shadow-sm">
        <div className="container">
          <Link href="/" className="navbar-brand fw-bold d-flex items-center gap-2">
            <span className="badge bg-white text-primary fs-6">CT</span>
            <span>Campus Tag</span>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <Link href="/dashboard" className="btn btn-outline-light btn-sm fw-semibold">
              Customer Portal
            </Link>
            <Link href="/admin" className="btn btn-danger btn-sm fw-semibold">
              Super Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-primary text-white py-5 text-center">
        <div className="container py-4">
          <div className="badge bg-white text-primary mb-3 px-3 py-2 text-uppercase fw-bold">
            University Gear Recovery
          </div>
          <h1 className="display-4 fw-black mb-3">Campus Tag — Scan It to Find It</h1>
          <p className="lead mx-auto text-light" style={{ maxWidth: '680px' }}>
            The privacy-first QR tagging and lost gear recovery platform built specifically for students, researchers, and campus faculty.
          </p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Link href="/dashboard" className="btn btn-light btn-lg fw-bold px-4 text-primary shadow-sm">
              Register Campus Items
            </Link>
            <Link href={`/f/${demoId}`} className="btn btn-outline-light btn-lg fw-semibold px-4">
              Test Finder Scan
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <h4 className="fw-bold mb-2">Zero PII Exposed</h4>
                <p className="text-muted small">
                  Finders never see your phone number, email address, or dorm room. Communication is masked through anonymous relay.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <h4 className="fw-bold mb-2">Leaflet GPS Pin-Drop</h4>
                <p className="text-muted small">
                  Finders can optionally drop a pin on OpenStreetMap to show the safe location or desk where your gear was turned in.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 text-center">
                <h4 className="fw-bold mb-2">Printable Vector Tags</h4>
                <p className="text-muted small">
                  Print ready-to-peel waterproof vinyl stickers or download vector SVGs for laser etching onto research assets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
