# Karigar MVP - Technical Architecture

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  Next.js 13+ (App Router) + React + TypeScript + Tailwind   │
│  - Server Components (SSR)                                  │
│  - Client Components (Interactivity)                        │
│  - API Routes (Serverless Functions)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST API
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      Backend Layer                          │
│  Option A: Next.js API Routes (Serverless)                 │
│  Option B: Express.js (Traditional)                        │
│  Option C: Supabase (BaaS - Recommended for MVP)           │
│  - Authentication & Authorization                           │
│  - Business Logic                                           │
│  - Data Validation                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ SQL Queries / ORM
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Database Layer                           │
│  PostgreSQL (via Supabase or self-hosted)                  │
│  - Relational data (users, bookings, reviews)               │
│  - Full-text search capabilities                            │
│  - Geospatial queries (for location-based search)          │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  External Services                           │
│  - File Storage (Supabase Storage / Cloudinary)             │
│  - Email Service (Resend / SendGrid)                        │
│  - Payment Gateway (Stripe / Local provider) - Phase 5      │
│  - Maps API (Google Maps / Mapbox) - Optional              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
karigar-mvp/
├── .env.local                 # Environment variables
├── .env.example               # Example env file
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
│
├── public/                    # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── (auth)/            # Auth routes group
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── layout.tsx
│   │   ├── (customer)/        # Customer routes
│   │   │   ├── dashboard/
│   │   │   ├── bookings/
│   │   │   ├── profile/
│   │   │   └── layout.tsx
│   │   ├── (provider)/        # Provider routes
│   │   │   ├── dashboard/
│   │   │   ├── services/
│   │   │   ├── bookings/
│   │   │   ├── profile/
│   │   │   └── layout.tsx
│   │   ├── (admin)/           # Admin routes
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── providers/
│   │   │   ├── bookings/
│   │   │   └── layout.tsx
│   │   ├── providers/         # Public provider pages
│   │   │   └── [id]/
│   │   ├── search/            # Search results
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── bookings/
│   │   │   ├── providers/
│   │   │   ├── reviews/
│   │   │   └── admin/
│   │   └── globals.css
│   │
│   ├── components/            # Reusable components
│   │   ├── ui/                # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── booking/           # Booking-specific
│   │   │   ├── BookingCard.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── provider/          # Provider-specific
│   │   │   ├── ProviderCard.tsx
│   │   │   ├── ProviderProfile.tsx
│   │   │   └── ServiceList.tsx
│   │   └── review/            # Review components
│   │       ├── ReviewCard.tsx
│   │       └── RatingStars.tsx
│   │
│   ├── lib/                   # Utilities & helpers
│   │   ├── db/                # Database client
│   │   │   └── client.ts
│   │   ├── auth/              # Auth utilities
│   │   │   └── session.ts
│   │   ├── utils/             # General utilities
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── distance.ts    # Distance calculations
│   │   └── constants/         # Constants
│   │       └── booking-status.ts
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useBookings.ts
│   │   ├── useProviders.ts
│   │   └── useLocation.ts
│   │
│   ├── types/                 # TypeScript types
│   │   ├── user.ts
│   │   ├── booking.ts
│   │   ├── provider.ts
│   │   └── review.ts
│   │
│   └── middleware.ts          # Next.js middleware (auth, RBAC)
│
├── prisma/                    # If using Prisma ORM
│   ├── schema.prisma
│   └── migrations/
│
└── tests/                     # Test files
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 🗄️ Database Schema Design

### Core Tables

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### `profiles`
```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile_picture_url TEXT,
  bio TEXT,
  city VARCHAR(100),
  area VARCHAR(100),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_location ON profiles USING GIST(
  ll_to_earth(latitude, longitude)
); -- For geospatial queries
```

#### `service_categories`
```sql
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),
  parent_id UUID REFERENCES service_categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_parent ON service_categories(parent_id);
```

#### `service_providers`
```sql
CREATE TABLE service_providers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  verification_status VARCHAR(20) DEFAULT 'pending' 
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  is_active BOOLEAN DEFAULT TRUE,
  service_radius_km INTEGER DEFAULT 10,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_providers_verified ON service_providers(verification_status, is_active);
```

#### `services`
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(user_id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('fixed', 'range', 'quote')),
  price_min DECIMAL(10, 2),
  price_max DECIMAL(10, 2),
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category_id);
```

#### `bookings`
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  provider_id UUID NOT NULL REFERENCES service_providers(user_id),
  service_id UUID NOT NULL REFERENCES services(id),
  status VARCHAR(20) NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected')),
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  confirmed_date DATE,
  confirmed_time TIME,
  special_instructions TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(requested_date, requested_time);
```

#### `reviews`
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);
```

#### `availability_slots`
```sql
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(user_id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_availability_provider ON availability_slots(provider_id, day_of_week);
```

#### `blocked_dates` (for provider unavailability)
```sql
CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(user_id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider_id, blocked_date)
);

CREATE INDEX idx_blocked_dates_provider ON blocked_dates(provider_id, blocked_date);
```

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User signs up → Create account → Email verification (optional)
2. User logs in → Validate credentials → Generate JWT token
3. Token stored in HTTP-only cookie or localStorage
4. Middleware validates token on protected routes

### Role-Based Access Control (RBAC)

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const user = verifyToken(token);
  
  if (!user && isProtectedRoute(request.path)) {
    return redirect('/login');
  }
  
  if (user && !hasAccess(user.role, request.path)) {
    return redirect('/unauthorized');
  }
}

function hasAccess(role: string, path: string): boolean {
  const roleRoutes = {
    customer: ['/customer', '/search', '/providers'],
    provider: ['/provider', '/search', '/providers'],
    admin: ['/admin']
  };
  
  return roleRoutes[role]?.some(route => path.startsWith(route)) ?? false;
}
```

---

## 🔍 Location-Based Search Implementation

### Distance Calculation (Haversine Formula)

```typescript
// lib/utils/distance.ts
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

### Database Query (PostGIS - if available)

```sql
-- Using PostGIS extension
SELECT 
  id,
  name,
  ST_Distance(
    ll_to_earth(latitude, longitude),
    ll_to_earth(?, ?)
  ) AS distance_km
FROM profiles
WHERE ST_DWithin(
  ll_to_earth(latitude, longitude),
  ll_to_earth(?, ?),
  ? * 1000  -- radius in meters
)
ORDER BY distance_km
LIMIT 20;
```

---

## 📡 API Design

### RESTful Endpoints

#### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

#### Users & Profiles
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user
- `GET /api/users/:id/profile` - Get user profile
- `PUT /api/users/:id/profile` - Update profile

#### Providers
- `GET /api/providers` - List providers (with filters)
- `GET /api/providers/:id` - Get provider details
- `GET /api/providers/:id/services` - Get provider services
- `POST /api/providers/services` - Create service (provider only)
- `PUT /api/providers/services/:id` - Update service
- `DELETE /api/providers/services/:id` - Delete service

#### Bookings
- `POST /api/bookings` - Create booking request
- `GET /api/bookings` - List bookings (filtered by user role)
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/reschedule` - Request reschedule

#### Reviews
- `POST /api/reviews` - Create review
- `GET /api/providers/:id/reviews` - Get provider reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

#### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/providers` - List all providers
- `PUT /api/admin/providers/:id/verify` - Verify provider
- `GET /api/admin/bookings` - List all bookings
- `GET /api/admin/analytics` - Get analytics data

---

## 🎨 Frontend Architecture

### State Management
- **Server State:** React Query / SWR for API data
- **Client State:** React Context / Zustand for UI state
- **Form State:** React Hook Form

### Component Patterns
- **Server Components:** For static/dynamic content (Next.js 13+)
- **Client Components:** For interactivity (forms, modals, etc.)
- **Compound Components:** For complex UI (e.g., BookingCard with actions)

### Styling Strategy
- **Tailwind CSS:** Utility-first styling
- **Component Variants:** Using `cva` (class-variance-authority) or Tailwind's variant system
- **Responsive Design:** Mobile-first approach

---

## 🔒 Security Considerations

### Authentication Security
- Password hashing: bcrypt (10+ rounds)
- JWT tokens with expiration
- HTTP-only cookies for token storage
- CSRF protection

### Data Validation
- Input validation on both client and server
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitize user inputs)
- Rate limiting on API endpoints

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions (users can only access their own data)
- Admin-only endpoints protected

### Data Privacy
- PII encryption at rest (optional but recommended)
- GDPR compliance considerations
- Secure file uploads (validate file types, scan for malware)

---

## 📊 Performance Optimization

### Frontend
- Image optimization (Next.js Image component)
- Code splitting (dynamic imports)
- Lazy loading for below-fold content
- Service worker for offline support (optional)

### Backend
- Database query optimization (indexes, query analysis)
- API response caching (Redis - optional)
- Pagination for large datasets
- Database connection pooling

### Database
- Proper indexing on frequently queried columns
- Query optimization (avoid N+1 queries)
- Database connection pooling
- Read replicas for scaling (future)

---

## 🚀 Deployment Strategy

### Development
- Local development with hot reload
- Docker for consistent environments (optional)

### Staging
- Deploy to staging environment
- Test with production-like data
- Performance testing

### Production
- **Frontend:** Vercel (automatic deployments from Git)
- **Backend API:** Vercel Serverless Functions or Railway
- **Database:** Supabase (managed) or Railway PostgreSQL
- **File Storage:** Supabase Storage or Cloudinary
- **CDN:** Vercel Edge Network (automatic)

### Environment Variables
```env
# Database
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Authentication
JWT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# File Storage
SUPABASE_STORAGE_BUCKET=
CLOUDINARY_URL=

# Email (optional)
SMTP_HOST=
SMTP_USER=
SMTP_PASS=

# Payment (Phase 5)
STRIPE_SECRET_KEY=
```

---

## 📈 Monitoring & Logging

### Error Tracking
- Sentry for error monitoring
- Log errors to console/file in development
- Structured logging in production

### Analytics
- Google Analytics or Plausible (privacy-friendly)
- Custom event tracking for key actions
- User behavior analytics

### Performance Monitoring
- Vercel Analytics (automatic)
- Database query performance monitoring
- API response time tracking

---

## 🔄 Future Scalability Considerations

### Horizontal Scaling
- Stateless API design (no server-side sessions)
- Database read replicas
- CDN for static assets
- Load balancing (if self-hosting)

### Microservices (Future)
- Split into services: Auth, Bookings, Reviews, Payments
- API Gateway pattern
- Service-to-service communication

### Caching Strategy
- Redis for session storage
- Cache frequently accessed data (categories, popular providers)
- Cache invalidation strategy

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]

