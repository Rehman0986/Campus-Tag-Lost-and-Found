'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'qrcodes' | 'lost' | 'reports'>('overview');

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <nav className="bg-dark text-white p-3 d-flex flex-column" style={{ width: '260px' }}>
        <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom border-secondary">
          <span className="badge bg-primary fs-6">CT</span>
          <div>
            <div className="fw-bold fs-6">Campus Tag</div>
            <div className="text-secondary small">Stanford Bio-Robotics</div>
          </div>
        </div>

        <ul className="nav nav-pills flex-column mb-auto gap-1">
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('overview')}
              className={`nav-link text-white w-100 text-start ${activeTab === 'overview' ? 'active bg-primary' : ''}`}
            >
              Overview
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('items')}
              className={`nav-link text-white w-100 text-start ${activeTab === 'items' ? 'active bg-primary' : ''}`}
            >
              My Protected Items
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('qrcodes')}
              className={`nav-link text-white w-100 text-start ${activeTab === 'qrcodes' ? 'active bg-primary' : ''}`}
            >
              QR Codes & Stickers
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('lost')}
              className={`nav-link text-warning w-100 text-start ${activeTab === 'lost' ? 'active bg-warning text-dark' : ''}`}
            >
              Lost Mode Emergency
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('reports')}
              className={`nav-link text-white w-100 text-start ${activeTab === 'reports' ? 'active bg-primary' : ''}`}
            >
              Finder Reports
            </button>
          </li>
        </ul>

        <hr className="border-secondary" />
        <Link href="/" className="btn btn-outline-light btn-sm w-100">
          ← Back to Homepage
        </Link>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
          <h2 className="h4 fw-bold mb-0 text-dark">
            {activeTab === 'overview' && 'Campus Workspace Overview'}
            {activeTab === 'items' && 'My Protected Items'}
            {activeTab === 'qrcodes' && 'QR Codes & Sticker Sheets'}
            {activeTab === 'lost' && 'Emergency Lost Mode Broadcast'}
            {activeTab === 'reports' && 'Incoming Finder Reports'}
          </h2>
          <div className="d-flex gap-2">
            <Link href="/f/cpt-8f92-a1b4" className="btn btn-outline-primary btn-sm fw-semibold">
              Preview Public Finder Scan
            </Link>
            <button className="btn btn-primary btn-sm fw-semibold">
              + Register New Item
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-3">
                <span className="text-muted small fw-bold text-uppercase">Protected Items</span>
                <span className="fs-3 fw-bold text-dark">4</span>
                <span className="text-muted small">4 / 25 tags used</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-3">
                <span className="text-muted small fw-bold text-uppercase">Lost Mode Active</span>
                <span className="fs-3 fw-bold text-warning">1</span>
                <span className="text-warning small">Urgent alert broadcasting</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-3">
                <span className="text-muted small fw-bold text-uppercase">Finder Reports</span>
                <span className="fs-3 fw-bold text-dark">1</span>
                <span className="text-muted small">GPS pin attached</span>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm p-3">
                <span className="text-muted small fw-bold text-uppercase">Recovered</span>
                <span className="fs-3 fw-bold text-success">1</span>
                <span className="text-success small">100% privacy preserved</span>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3">
            <h5 className="card-title fw-bold mb-0 fs-6">Registered Campus Equipment</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Public Tag ID</th>
                  <th>Status</th>
                  <th>Scans</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                <tr>
                  <td className="fw-bold">Apple MacBook Pro 16"</td>
                  <td>Electronics & Laptops</td>
                  <td><code>cpt-8f92-a1b4</code></td>
                  <td><span className="badge bg-warning text-dark">LOST MODE ACTIVE</span></td>
                  <td>3</td>
                  <td className="text-end">
                    <Link href="/f/cpt-8f92-a1b4" className="btn btn-sm btn-outline-primary">
                      Scan Page
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Leica Handheld Laser Rangefinder</td>
                  <td>Lab & Research Equipment</td>
                  <td><code>cpt-3e41-99c8</code></td>
                  <td><span className="badge bg-success">Protected</span></td>
                  <td>1</td>
                  <td className="text-end">
                    <Link href="/f/cpt-3e41-99c8" className="btn btn-sm btn-outline-primary">
                      Scan Page
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
