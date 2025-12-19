'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAuth } from '@/hooks/useAuth'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Service {
  id: string
  name: string
  description?: string | null
  category: {
    id: string
    name: string
  }
  priceType: string
  priceMin?: number | null
  priceMax?: number | null
  durationMinutes?: number | null
  isActive: boolean
  _count: {
    bookings: number
  }
}

export default function ProviderServicesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    priceType: 'fixed' as 'fixed' | 'range' | 'quote',
    priceMin: '',
    priceMax: '',
    durationMinutes: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/provider/services')
    } else if (user && user.role !== 'provider') {
      router.push('/unauthorized')
    } else if (user) {
      fetchServices()
      fetchCategories()
    }
  }, [user, authLoading, router])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/providers/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        categoryId: service.category.id,
        name: service.name,
        description: service.description || '',
        priceType: service.priceType as 'fixed' | 'range' | 'quote',
        priceMin: service.priceMin?.toString() || '',
        priceMax: service.priceMax?.toString() || '',
        durationMinutes: service.durationMinutes?.toString() || '',
      })
    } else {
      setEditingService(null)
      setFormData({
        categoryId: '',
        name: '',
        description: '',
        priceType: 'fixed',
        priceMin: '',
        priceMax: '',
        durationMinutes: '',
      })
    }
    setShowModal(true)
    setError('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingService(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload: any = {
        categoryId: formData.categoryId,
        name: formData.name,
        description: formData.description || null,
        priceType: formData.priceType,
        durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null,
      }

      if (formData.priceType === 'fixed') {
        payload.priceMin = formData.priceMin ? parseFloat(formData.priceMin) : null
        payload.priceMax = null
      } else if (formData.priceType === 'range') {
        payload.priceMin = formData.priceMin ? parseFloat(formData.priceMin) : null
        payload.priceMax = formData.priceMax ? parseFloat(formData.priceMax) : null
      } else {
        payload.priceMin = null
        payload.priceMax = null
      }

      const url = editingService
        ? `/api/providers/services/${editingService.id}`
        : '/api/providers/services'
      const method = editingService ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        handleCloseModal()
        fetchServices()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save service')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/providers/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading />
      </div>
    )
  }

  if (!user) {
    return <ErrorState title="Not authenticated" message="Please log in to manage your services." />
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">My Services</h1>
          <p className="text-gray-600">Manage the services you offer to customers</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">You haven't added any services yet.</p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-1">{service.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="outline">{service.category.name}</Badge>
                    </CardDescription>
                  </div>
                  {!service.isActive && <Badge variant="warning">Inactive</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                {service.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                )}
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium">Pricing: </span>
                    {service.priceType === 'fixed' && service.priceMin && (
                      <span>{formatCurrency(Number(service.priceMin))}</span>
                    )}
                    {service.priceType === 'range' && (
                      <span>
                        {formatCurrency(Number(service.priceMin || 0))} -{' '}
                        {formatCurrency(Number(service.priceMax || 0))}
                      </span>
                    )}
                    {service.priceType === 'quote' && <span>Call for quote</span>}
                  </div>
                  {service.durationMinutes && (
                    <div className="text-sm text-gray-600">
                      Duration: ~{service.durationMinutes} minutes
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    Bookings: {service._count.bookings}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenModal(service)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Service Modal */}
      <Modal open={showModal} onOpenChange={setShowModal}>
        <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>{editingService ? 'Edit Service' : 'Add New Service'}</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Service Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type *</label>
              <select
                value={formData.priceType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priceType: e.target.value as 'fixed' | 'range' | 'quote',
                  })
                }
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                required
              >
                <option value="fixed">Fixed Price</option>
                <option value="range">Price Range</option>
                <option value="quote">Call for Quote</option>
              </select>
            </div>

            {formData.priceType === 'fixed' && (
              <Input
                type="number"
                label="Price *"
                value={formData.priceMin}
                onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            )}

            {formData.priceType === 'range' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="number"
                  label="Min Price *"
                  value={formData.priceMin}
                  onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
                <Input
                  type="number"
                  label="Max Price *"
                  value={formData.priceMax}
                  onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <Input
              type="number"
              label="Estimated Duration (minutes)"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              min="1"
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                {editingService ? 'Update Service' : 'Add Service'}
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  )
}

