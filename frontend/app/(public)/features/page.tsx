import PublicLayout from '@/components/PublicLayout'

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <section className="py-5">
        <div className="container">
          <h1 className="mb-4 fw-bold">Features</h1>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">Item CRUD</h5>
                  <p className="card-text text-muted">Full create, read, update, delete for your items with photo upload.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">Lost Mode</h5>
                  <p className="card-text text-muted">Toggle lost mode on any item to alert the community.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">QR Download</h5>
                  <p className="card-text text-muted">Download QR codes as PNG or SVG for printing.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">Subscription</h5>
                  <p className="card-text text-muted">Flexible plans: 7-Day, Monthly, Yearly.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">Finder Reports</h5>
                  <p className="card-text text-muted">Secure messages from finders with optional location evidence.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title">Maps</h5>
                  <p className="card-text text-muted">Leaflet + OpenStreetMap location tracking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
