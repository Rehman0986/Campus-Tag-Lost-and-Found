'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<'kpis' | 'users' | 'plans' | 'audit'>('kpis');

  return (
    <div className="d-flex min-vh-100 bg-dark text-light">
      {/* Super Admin Dark Sidebar */}
      <nav className="bg-black text-white p-3 d-flex flex-column border-end border-secondary" style={{ width: '260px' }}>
        <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom border-secondary">
          <span className="badge bg-danger fs-6">ADMIN</span>
          <div>
            <div className="fw-bold fs-6 text-white">Super Admin</div>
            <div className="text-secondary small">Campus Tag Platform</div>
          </div>
        </div>

        <ul className="nav nav-pills flex-column mb-auto gap-1">
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('kpis')}
              className={`nav-link text-white w-100 text-start ${activeTab === 'kpis' ? 'active bg-danger' : ''}`}
            >
              Executive Metrics
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('users')}
              className={`nav-link text-white w-100 text-start ${activeTab === 'users' ? 'active bg-danger' : ''}`}
            >
              User & Tenant Control
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('plans')}
              className={`nav-link text-white w-100 text-start ${activeTab === 'plans' ? 'active bg-danger' : ''}`}
            >
              Subscription Plan Studio
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('audit')}
              className={`nav-link text-white w-100 text-start ${activeTab === 'audit' ? 'active bg-danger' : ''}`}
            >
              Audit Logs
            </button>
          </li>
        </ul>

        <hr className="border-secondary" />
        <Link href="/" className="btn btn-outline-secondary btn-sm w-100 text-white">
          ← Exit to Public Site
        </Link>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow-1 p-4 overflow-auto">
        <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom border-secondary">
          <div>
            <span className="badge bg-danger-subtle text-danger border border-danger mb-1 text-uppercase">
              Super Admin Mode
            </span>
            <h2 className="h4 fw-bold mb-0 text-white">Platform Owner Operations</h2>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light btn-sm">Export Items CSV</button>
            <button className="btn btn-outline-light btn-sm">Export Reports CSV</button>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card bg-secondary text-white border-0 shadow-sm p-3">
              <span className="text-light small fw-bold text-uppercase">Total Users</span>
              <span className="fs-3 fw-bold text-white">3</span>
              <span className="text-light small">2 Campus Institutions</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-secondary text-white border-0 shadow-sm p-3">
              <span className="text-light small fw-bold text-uppercase">Global QR Tags</span>
              <span className="fs-3 fw-bold text-info">4</span>
              <span className="text-light small">6 total scans</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-secondary text-white border-0 shadow-sm p-3">
              <span className="text-light small fw-bold text-uppercase">Monthly ARR</span>
              <span className="fs-3 fw-bold text-success">$98.99</span>
              <span className="text-light small">2 active subscriptions</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-secondary text-white border-0 shadow-sm p-3">
              <span className="text-light small fw-bold text-uppercase">Lost Items</span>
              <span className="fs-3 fw-bold text-warning">1</span>
              <span className="text-light small">1 safely recovered</span>
            </div>
          </div>
        </div>

        {/* Tenant Table */}
        <div className="card bg-secondary text-white border-0 shadow-sm">
          <div className="card-header bg-black py-3">
            <h5 className="card-title fw-bold mb-0 fs-6 text-white">Campus Tenant Workspaces</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead className="small text-uppercase">
                <tr>
                  <th>Organization</th>
                  <th>Campus</th>
                  <th>Contact Email</th>
                  <th>Plan & Quota</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="small">
                <tr>
                  <td className="fw-bold">Bio-Robotics Research Group</td>
                  <td>Stanford University</td>
                  <td>biorobotics-ops@stanford.edu</td>
                  <td>Scholar Pro (4 / 25 tags)</td>
                  <td><span className="badge bg-success">Verified</span></td>
                </tr>
                <tr>
                  <td className="fw-bold">Media Lab Tangible Media</td>
                  <td>MIT</td>
                  <td>tangible-lostfound@mit.edu</td>
                  <td>Department Fleet (0 / 250 tags)</td>
                  <td><span className="badge bg-success">Verified</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
