import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Find Trusted Karigars Near You
            </h1>
            <p className="mt-6 text-lg leading-8 text-primary-100 sm:text-xl">
              Connect with verified local service providers for plumbing, electrical, cleaning, and
              more. Book services with confidence.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                <Link href="/search">Find Services</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/signup">Become a Provider</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose Karigar?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We make it easy to find and book trusted local service providers
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-7xl">
            <Card>
              <CardHeader>
                <CardTitle>Verified Providers</CardTitle>
                <CardDescription>
                  All service providers are verified and background-checked for your peace of mind
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Easy Booking</CardTitle>
                <CardDescription>
                  Book services in just a few clicks. See availability and schedule at your convenience
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Transparent Pricing</CardTitle>
                <CardDescription>
                  Clear pricing upfront. No hidden fees or surprises when the job is done
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Real Reviews</CardTitle>
                <CardDescription>
                  Read authentic reviews from customers who have used the services
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Local & Nearby</CardTitle>
                <CardDescription>
                  Find providers in your area. Fast response times and local expertise
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>24/7 Support</CardTitle>
                <CardDescription>
                  Our support team is here to help you whenever you need assistance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Join thousands of satisfied customers and service providers
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">Sign Up Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

