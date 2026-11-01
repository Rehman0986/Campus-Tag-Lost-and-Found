"use client"

export default function HelpPage() {
  const faqs = [
    {
      q: 'How do I add an item?',
      a: 'Go to My Items and click "Add Item". Fill in the item details, optionally set a location, and create the item. A unique QR code will be generated automatically.',
    },
    {
      q: 'What is Lost Mode?',
      a: 'Lost Mode marks your item as actively lost. When someone scans the QR code, they can send you a message with the location where they found it.',
    },
    {
      q: 'How do QR codes work?',
      a: 'Each item gets a unique QR code that links to a public finder page. Finders can scan it to contact you anonymously without seeing your private details.',
    },
    {
      q: 'Can I download QR codes?',
      a: 'Yes. Go to QR Codes and click "Download QR" on any item to save the QR code as an SVG file for printing.',
    },
    {
      q: 'What happens if my subscription expires?',
      a: 'Public QR finder pages continue working even after subscription expires. You can still receive finder reports, but some dashboard features may be limited.',
    },
    {
      q: 'How do I contact support?',
      a: 'Use the Contact page on the public website or email support@campustag.local for assistance.',
    },
  ]

  return (
    <div>
      <h1 className="mb-4 fw-bold">Help & Support</h1>
      <p className="text-muted mb-5">Frequently asked questions about Campus Tag.</p>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {faqs.map((faq, i) => (
            <div key={i} className="mb-4 border-bottom pb-4 last:mb-0 last:border-0 last:pb-0">
              <h6 className="fw-bold mb-2">{faq.q}</h6>
              <p className="text-muted mb-0">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 card shadow-sm border-0">
        <div className="card-body text-center py-5">
          <h5 className="mb-3">Still need help?</h5>
          <p className="text-muted mb-4">Contact our support team for assistance.</p>
          <a href="mailto:support@campustag.local" className="btn btn-primary">
            support@campustag.local
          </a>
        </div>
      </div>
    </div>
  )
}
