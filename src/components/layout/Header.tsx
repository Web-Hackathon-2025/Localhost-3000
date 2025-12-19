'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Fetch current user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {
        // Not logged in
      })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Find Services' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full glass backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="font-heading text-2xl font-bold text-primary-400 group-hover:text-primary-300 transition-colors">Karigar</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-2 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-xl ${
                  pathname === link.href
                    ? 'text-primary-400 bg-gray-800/30'
                    : 'text-gray-400 hover:text-primary-400 hover:bg-gray-800/20'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden items-center space-x-3 md:flex">
            {user ? (
              <>
                <Link
                  href={
                    user.role === 'admin'
                      ? '/admin/dashboard'
                      : user.role === 'provider'
                      ? '/provider/dashboard'
                      : '/customer/dashboard'
                  }
                  className="text-sm font-medium text-gray-300 hover:text-primary-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
                >
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-gray-300 hover:text-primary-400 hover:bg-gray-800/50">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary-600/90 hover:bg-primary-600 text-white">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-800/50 transition-colors text-gray-300 hover:text-primary-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t border-gray-800 py-4 md:hidden bg-gray-900/95 backdrop-blur-xl">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                    pathname === link.href
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-gray-400 hover:text-primary-400 hover:bg-gray-800/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href={
                      user.role === 'admin'
                        ? '/admin/dashboard'
                        : user.role === 'provider'
                        ? '/provider/dashboard'
                        : '/customer/dashboard'
                    }
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-800/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="text-gray-300 hover:text-primary-400 hover:bg-gray-800/50">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Log In
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="bg-primary-600/90 hover:bg-primary-600 text-white">
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

