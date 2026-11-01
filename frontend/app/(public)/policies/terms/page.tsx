import PublicLayout from '@/components/PublicLayout'

export default function TermsPage() {
  return (
    <PublicLayout>
      <section className="py-5">
        <div className="container">
          <h1 className="mb-4 fw-bold">Terms of Service</h1>
          <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
          <div className="card shadow-sm border-0 p-4 bg-white">
            <p className="text-muted">By using Campus Tag, you agree to these terms of service.</p>
            <h5>Acceptable Use</h5>
            <p className="text-muted">You may not submit false reports or abuse the platform.</p>
            <h5>Subscription</h5>
            <p className="text-muted">Subscriptions are billed according to your selected plan. You may cancel anytime.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
