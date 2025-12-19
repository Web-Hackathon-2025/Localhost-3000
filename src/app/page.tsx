import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { ServiceCategoriesSection } from '@/components/home/ServiceCategoriesSection'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative container mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/40 mb-8">
              <span className="text-gray-300 text-sm font-medium">Trusted by 10,000+ customers</span>
            </div>
            <h1 className="font-heading text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              <span className="block text-gray-100">Find Trusted</span>
              <span className="block text-primary-400 mt-2">Karigars Near You</span>
            </h1>
            <p className="mt-8 text-lg leading-8 text-gray-400 sm:text-xl max-w-2xl mx-auto">
              Connect with verified local service providers for plumbing, electrical, cleaning, and
              more. Book services with confidence and get the job done right.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary-600/90 hover:bg-primary-600 text-white px-8 py-6 text-lg rounded-xl">
                <Link href="/search">Find Services</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-gray-300 hover:bg-gray-800/30 px-8 py-6 text-lg rounded-xl">
                <Link href="/signup">Become a Provider</Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400">10K+</div>
                <div className="text-sm text-gray-500 mt-1">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400">5K+</div>
                <div className="text-sm text-gray-500 mt-1">Verified Providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400">50K+</div>
                <div className="text-sm text-gray-500 mt-1">Jobs Completed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <ServiceCategoriesSection />

      {/* Features Section */}
      <section className="py-24 sm:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-primary-400">Why Choose</span> Karigar?
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              We make it easy to find and book trusted local service providers
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-7xl">
            <Card className="bg-gray-900/40 hover:bg-gray-900/50 transition-colors group rounded-2xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center mb-4 group-hover:bg-gray-800/70 transition-colors">
                  <span className="text-xl">✓</span>
                </div>
                <CardTitle className="text-gray-100">Verified Providers</CardTitle>
                <CardDescription className="text-gray-400">
                  All service providers are verified and background-checked for your peace of mind
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gray-900/40 hover:bg-gray-900/50 transition-colors group rounded-2xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center mb-4 group-hover:bg-gray-800/70 transition-colors">
                  <span className="text-xl">📅</span>
                </div>
                <CardTitle className="text-gray-100">Easy Booking</CardTitle>
                <CardDescription className="text-gray-400">
                  Book services in just a few clicks. See availability and schedule at your convenience
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gray-900/40 hover:bg-gray-900/50 transition-colors group rounded-2xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center mb-4 group-hover:bg-gray-800/70 transition-colors">
                  <span className="text-xl">💰</span>
                </div>
                <CardTitle className="text-gray-100">Transparent Pricing</CardTitle>
                <CardDescription className="text-gray-400">
                  Clear pricing upfront. No hidden fees or surprises when the job is done
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gray-900/40 hover:bg-gray-900/50 transition-colors group rounded-2xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center mb-4 group-hover:bg-gray-800/70 transition-colors">
                  <span className="text-xl">⭐</span>
                </div>
                <CardTitle className="text-gray-100">Real Reviews</CardTitle>
                <CardDescription className="text-gray-400">
                  Read authentic reviews from customers who have used the services
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gray-900/40 hover:bg-gray-900/50 transition-colors group rounded-2xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center mb-4 group-hover:bg-gray-800/70 transition-colors">
                  <span className="text-xl">📍</span>
                </div>
                <CardTitle className="text-gray-100">Local & Nearby</CardTitle>
                <CardDescription className="text-gray-400">
                  Find providers in your area. Fast response times and local expertise
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-gray-900/40 hover:bg-gray-900/50 transition-colors group rounded-2xl">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center mb-4 group-hover:bg-gray-800/70 transition-colors">
                  <span className="text-xl">💬</span>
                </div>
                <CardTitle className="text-gray-100">24/7 Support</CardTitle>
                <CardDescription className="text-gray-400">
                  Our support team is here to help you whenever you need assistance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-gray-800/50">
        <div className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              Ready to <span className="text-primary-400">get started</span>?
            </h2>
            <p className="mt-6 text-lg text-gray-400">
              Join thousands of satisfied customers and service providers. Start your journey today.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-primary-600/90 hover:bg-primary-600 text-white px-8 py-6 text-lg rounded-xl">
                <Link href="/signup">Sign Up Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-gray-300 hover:bg-gray-800/30 px-8 py-6 text-lg rounded-xl">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

