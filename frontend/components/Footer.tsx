import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <h5 className="text-primary fw-bold">Campus Tag</h5>
            <p className="text-muted small">Scan It to Find It — The smart lost and found platform for universities.</p>
          </div>
          <div className="col-lg-4 mb-4">
            <h6 className="text-white mb-3">Quick Links</h6>
            <ul className="list-unstyled text-muted small">
              <li><Link href="/about">How It Works</Link></li>
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="col-lg-4 mb-4">
            <h6 className="text-white mb-3">Policies</h6>
            <ul className="list-unstyled text-muted small">
              <li><Link href="/policies/privacy">Privacy Policy</Link></li>
              <li><Link href="/policies/terms">Terms of Service</Link></li>
              <li><Link href="/policies/refund">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <hr className="my-4 border-secondary" />
        <div className="text-center text-muted small">
          &copy; {new Date().getFullYear()} Campus Tag. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
