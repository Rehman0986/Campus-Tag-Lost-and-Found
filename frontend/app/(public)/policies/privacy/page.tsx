import PublicLayout from '@/components/PublicLayout'

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <section className="py-5">
        <div className="container">
          <h1 className="mb-4 fw-bold">Privacy Policy</h1>
          <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
          <div className="card shadow-sm border-0 p-4 bg-white">
            <p className="text-muted">Campus Tag is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.</p>
            <h5>Information We Collect</h5>
            <p className="text-muted">We collect account information (email, name) and item data you voluntarily provide.</p>
            <h5>Finder Privacy</h5>
            <p className="text-muted">Finders never see owner names, emails, or phone numbers. All communication is mediated through our platform.</p>
            <h5>Data Security</h5>
            <p className="text-muted">All data is stored securely with encryption and access controls.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
