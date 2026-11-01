import PublicLayout from '@/components/PublicLayout'

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="py-5">
        <div className="container">
          <h1 className="mb-4 fw-bold">How It Works</h1>
          <p className="lead">Campus Tag helps students and staff reunite with lost items using QR codes.</p>
          <div className="row g-4 mt-4">
            <div className="col-md-6">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                  <h5 className="card-title">1. Register & Add Items</h5>
                  <p className="card-text">Create an account, add your belongings with photos and descriptions.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                  <h5 className="card-title">2. Print QR Labels</h5>
                  <p className="card-text">Download and print QR codes to attach to your items.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                  <h5 className="card-title">3. Finder Scans QR</h5>
                  <p className="card-text">A finder scans the QR and submits a message with optional location.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body">
                  <h5 className="card-title">4. Get Notified</h5>
                  <p className="card-text">You receive a secure notification to arrange recovery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
