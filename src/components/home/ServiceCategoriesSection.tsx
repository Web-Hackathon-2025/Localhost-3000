'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
}

export function ServiceCategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories.slice(0, 12) || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="animate-pulse bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-gray-800 rounded-full mx-auto mb-2" />
                  <div className="h-4 bg-gray-800 rounded w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 sm:py-32 relative">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            Browse by <span className="text-primary-400">Category</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Find the service you need from our wide range of categories
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/search?category=${category.id}`}>
              <Card className="bg-gray-900/40 hover:bg-gray-900/50 transition-colors cursor-pointer text-center h-full group rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">
                    {category.icon || '🔧'}
                  </div>
                  <h3 className="font-semibold text-sm text-gray-200 group-hover:text-primary-400 transition-colors">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/search">
            <Button variant="outline" className="text-gray-300 hover:bg-gray-800/30 rounded-xl">
              View All Categories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

