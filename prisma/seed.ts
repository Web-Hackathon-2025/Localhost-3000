import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create service categories
  const categories = [
    { name: 'Plumbing', slug: 'plumbing', icon: '🔧' },
    { name: 'Electrical', slug: 'electrical', icon: '⚡' },
    { name: 'Cleaning', slug: 'cleaning', icon: '🧹' },
    { name: 'Tutoring', slug: 'tutoring', icon: '📚' },
    { name: 'Car Mechanic', slug: 'car-mechanic', icon: '🚗' },
    { name: 'Carpentry', slug: 'carpentry', icon: '🪚' },
    { name: 'Painting', slug: 'painting', icon: '🎨' },
    { name: 'Gardening', slug: 'gardening', icon: '🌱' },
    { name: 'Appliance Repair', slug: 'appliance-repair', icon: '🔌' },
    { name: 'Moving & Packing', slug: 'moving-packing', icon: '📦' },
    { name: 'Beauty & Salon', slug: 'beauty-salon', icon: '💇' },
    { name: 'Photography', slug: 'photography', icon: '📷' },
    { name: 'Catering', slug: 'catering', icon: '🍽️' },
    { name: 'Fitness Training', slug: 'fitness-training', icon: '💪' },
    { name: 'Pet Care', slug: 'pet-care', icon: '🐕' },
  ]

  for (const category of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        displayOrder: categories.indexOf(category),
      },
    })
  }

  console.log('✅ Service categories created')
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

