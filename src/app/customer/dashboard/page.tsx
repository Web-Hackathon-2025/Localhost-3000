import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function CustomerDashboard() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-3xl font-bold mb-6">Customer Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Your dashboard is being set up. Check back soon!</p>
        </CardContent>
      </Card>
    </div>
  )
}

