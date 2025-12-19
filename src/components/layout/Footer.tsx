import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-heading text-lg font-semibold text-gray-900">Karigar</h3>
            <p className="mt-2 text-sm text-gray-600">
              Connecting customers with trusted local service providers.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">For Customers</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/search" className="hover:text-primary-600">
                  Find Services
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-primary-600">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary-600">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">For Providers</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/signup?role=provider" className="hover:text-primary-600">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link href="/provider/benefits" className="hover:text-primary-600">
                  Benefits
                </Link>
              </li>
              <li>
                <Link href="/provider/faq" className="hover:text-primary-600">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-primary-600">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Karigar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

