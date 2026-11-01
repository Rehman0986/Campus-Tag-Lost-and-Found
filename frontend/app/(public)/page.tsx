import Link from 'next/link'
import PublicLayout from '@/components/PublicLayout'

export default function HomePage() {
  return (
    <PublicLayout>
      <section className="py-5 bg-primary text-white text-center">
        <div className="container">
          <h1 className="display-4 fw-bold mb-4">Campus Tag</h1>
          <p className="lead mb-4">Scan It to Find It — The smart lost and found platform for universities.</p>
          <div className="d-flex justify-content-center gap-3">
            <Link href="/auth/register" className="btn btn-light btn-lg px-5">Get Started</Link>
            <Link href="/about" className="btn btn-outline-light btn-lg">How It Works</Link>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">How Campus Tag Works</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <div className="fs-1 text-primary mb-3">🏷️</div>
                  <h5 className="card-title">Tag Your Item</h5>
                  <p className="card-text text-muted">Attach a unique QR code to your belongings.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <div className="fs-1 text-primary mb-3">📱</div>
                  <h5 className="card-title">Finder Scans</h5>
                  <p className="card-text text-muted">Anyone can scan the QR to report a found item.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body text-center">
                  <div className="fs-1 text-primary mb-3">✅</div>
                  <h5 className="card-title">Get Reunited</h5>
                  <p className="card-text text-muted">Receive a secure message with the finder's details.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">Features</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">QR Code System</h5>
                  <p className="card-text text-muted">Unique, unguessable QR codes for every item.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">Privacy-First</h5>
                  <p className="card-text text-muted">Finders never see owner private data.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">Maps</h5>
                  <p className="card-text text-muted">Last reported location with Leaflet maps.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
