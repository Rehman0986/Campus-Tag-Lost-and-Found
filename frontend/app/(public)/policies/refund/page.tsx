import PublicLayout from '@/components/PublicLayout'

export default function RefundPage() {
  return (
    <PublicLayout>
      <section className="py-5">
        <div className="container">
          <h1 className="mb-4 fw-bold">Refund & Cancellation Policy</h1>
          <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>
          <div className="card shadow-sm border-0 p-4 bg-white">
            <h5>Cancellation</h5>
            <p className="text-muted">You may cancel your subscription at any time. Access continues until the end of the billing period.</p>
            <h5>Refunds</h5>
            <p className="text-muted">Refunds are issued on a case-by-case basis. Contact support for assistance.</p>
            <h5>Expired Subscriptions</h5>
            <p className="text-muted">Public QR finder pages remain active even after subscription expires.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
