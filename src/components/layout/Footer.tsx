import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-800/50 bg-gray-900/40 backdrop-blur-md">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-heading text-lg font-semibold text-primary-400">Karigar</h3>
            <p className="mt-2 text-sm text-gray-400">
              Connecting customers with trusted local service providers.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-200">For Customers</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/search" className="hover:text-primary-400 transition-colors">
                  Find Services
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-primary-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary-400 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-200">For Providers</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/signup?role=provider" className="hover:text-primary-400 transition-colors">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link href="/provider/benefits" className="hover:text-primary-400 transition-colors">
                  Benefits
                </Link>
              </li>
              <li>
                <Link href="/provider/faq" className="hover:text-primary-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-200">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Karigar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

