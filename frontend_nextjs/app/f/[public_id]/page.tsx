'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FinderPage({ params }: { params: { public_id: string } }) {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-vh-100 bg-dark text-light py-5">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary fs-6">CT</span>
            <span className="fw-bold text-white">Campus Tag Anonymous Relay</span>
          </div>
          <span className="badge bg-success-subtle text-success border border-success">
            Zero PII Exposed
          </span>
        </div>

        <div className="card bg-secondary text-white border-0 shadow-lg overflow-hidden mb-4">
          <div className="card-body p-4">
            <span className="badge bg-warning text-dark mb-2">URGENT: REPORTED LOST</span>
            <h3 className="card-title fw-bold">Protected Campus Item</h3>
            <p className="card-text font-monospace text-info">Public ID: {params.public_id}</p>
            <p className="small text-light">
              The owner is actively searching for this item. Please notify them below or leave at the nearest campus desk!
            </p>
          </div>
        </div>

        <div className="card bg-secondary text-white border-0 shadow-lg p-4">
          {submitted ? (
            <div className="text-center py-4">
              <h4 className="fw-bold text-success mb-2">Report Dispatched!</h4>
              <p className="small text-light">
                The owner has been notified via real-time relay. Thank you for keeping campus gear safe!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h5 className="fw-bold mb-3">Notify Owner Anonymously</h5>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Where did you find or leave this item? *</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Left with reception at Engineering Hall 2nd Floor desk..."
                  className="form-control bg-dark text-light border-secondary"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full py-2 fw-bold">
                Submit Recovery Notice
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
