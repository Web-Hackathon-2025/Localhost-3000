# Karigar MVP

A service marketplace platform connecting customers with local service providers.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Supabase account)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd karigar-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your database URL and JWT secret:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/karigar"
   JWT_SECRET="your-super-secret-jwt-key"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or create a migration
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
karigar-mvp/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   └── page.tsx          # Homepage
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utility functions
│   │   ├── auth/             # Authentication utilities
│   │   └── db.ts             # Database client
│   ├── middleware.ts         # Next.js middleware
│   └── types/                # TypeScript types
└── public/                   # Static assets
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

## 🗄️ Database

This project uses Prisma as the ORM. The database schema includes:

- **Users** - User accounts with roles (customer, provider, admin)
- **Profiles** - User profile information
- **ServiceCategories** - Service categories and subcategories
- **ServiceProviders** - Provider-specific information
- **Services** - Services offered by providers
- **Bookings** - Service booking requests and status
- **Reviews** - Customer reviews and ratings
- **AvailabilitySlots** - Provider availability schedule
- **BlockedDates** - Provider unavailable dates

## 🔐 Authentication

Authentication is handled via JWT tokens stored in HTTP-only cookies. The auth system includes:

- User registration (signup)
- User login
- Password hashing (bcrypt)
- Protected routes via middleware
- Role-based access control (RBAC)

## 🎨 UI Components

The project uses a custom component library built with:

- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Class Variance Authority** - Component variants

Available components:
- Button, Input, Card, Modal, Badge, Avatar
- Loading states, Error states

## 📝 Development Phases

This project follows the roadmap outlined in `KARIGAR_MVP_ROADMAP.md`:

- ✅ **Phase 0**: Foundation & Setup (Complete)
- ⏳ **Phase 1**: Core User Management & Profiles
- ⏳ **Phase 2**: Service Discovery & Provider Profiles
- ⏳ **Phase 3**: Booking System & Workflow
- ⏳ **Phase 4**: Reviews, Ratings & Admin Tools

## 📚 Documentation

- [Development Roadmap](./KARIGAR_MVP_ROADMAP.md)
- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
- [Task Breakdown](./TASK_BREAKDOWN.md)
- [Quick Start Guide](./QUICK_START_GUIDE.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is private and proprietary.

---

**Built with Next.js, TypeScript, Prisma, and Tailwind CSS**
