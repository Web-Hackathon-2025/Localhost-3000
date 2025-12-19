# Karigar MVP - Setup Instructions

## Quick Start Guide

Follow these steps to get the Karigar MVP up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **PostgreSQL** database (or a Supabase account)

You can verify your installations:
```bash
node --version  # Should be v18.0.0 or higher
npm --version
psql --version  # If using local PostgreSQL
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- Prisma ORM
- Tailwind CSS
- Radix UI components
- Authentication libraries
- And more...

### 2. Set Up Database

#### Option A: Using Supabase (Recommended for MVP)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Project Settings → Database
4. Copy the "Connection string" (URI format)
5. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:
   ```bash
   createdb karigar
   ```
3. Your connection string will be: `postgresql://localhost:5432/karigar`

### 3. Configure Environment Variables

1. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your configuration:

   ```env
   # Database Connection
   DATABASE_URL="postgresql://user:password@localhost:5432/karigar"
   # OR for Supabase:
   # DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

   # Authentication Secrets
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NEXTAUTH_SECRET="your-nextauth-secret-change-this"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   **Important:** 
   - Generate strong random strings for `JWT_SECRET` and `NEXTAUTH_SECRET`
   - You can use: `openssl rand -base64 32` to generate secrets
   - Never commit `.env.local` to version control

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push

# OR create a migration (recommended for production)
npm run db:migrate
```

This will create all the database tables defined in `prisma/schema.prisma`.

### 5. Start Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

### 6. Verify Installation

1. Open your browser and go to `http://localhost:3000`
2. You should see the Karigar homepage
3. Click "Sign Up" to create a test account
4. Try logging in with your credentials

## Common Issues & Solutions

### Issue: Database Connection Error

**Error:** `Can't reach database server`

**Solutions:**
- Verify your `DATABASE_URL` is correct
- Check if PostgreSQL is running: `pg_isready`
- For Supabase: Verify your project is active and password is correct
- Check firewall settings if using remote database

### Issue: Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npm run db:generate
```

### Issue: Port 3000 Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
- Kill the process using port 3000, or
- Change the port in `package.json`:
  ```json
  "dev": "next dev -p 3001"
  ```

### Issue: Module Not Found

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run db:generate
```

### Issue: TypeScript Errors

**Error:** Various TypeScript compilation errors

**Solution:**
- Make sure all dependencies are installed: `npm install`
- Regenerate Prisma Client: `npm run db:generate`
- Restart your TypeScript server in your IDE

## Development Workflow

### Daily Development

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Make your changes** in the `src/` directory

3. **Test your changes** in the browser

4. **Format code:**
   ```bash
   npm run format
   ```

5. **Check for linting errors:**
   ```bash
   npm run lint
   ```

### Database Changes

When you modify `prisma/schema.prisma`:

1. **Create a migration:**
   ```bash
   npm run db:migrate
   ```
   This will prompt you to name the migration.

2. **Or push changes directly (development only):**
   ```bash
   npm run db:push
   ```

3. **Regenerate Prisma Client:**
   ```bash
   npm run db:generate
   ```

### Viewing Database

Use Prisma Studio to view and edit your database:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555` where you can browse and edit your data.

## Project Structure Overview

```
karigar-mvp/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/                # Next.js pages and API routes
│   ├── components/         # React components
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript types
├── public/                 # Static files
└── package.json           # Dependencies
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create database migration |
| `npm run db:studio` | Open Prisma Studio |

## Next Steps

After setup is complete:

1. ✅ Verify the homepage loads
2. ✅ Create a test account (customer)
3. ✅ Create a test account (provider)
4. ✅ Test login/logout functionality
5. ✅ Review the codebase structure
6. ✅ Read the [Development Roadmap](./KARIGAR_MVP_ROADMAP.md)

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Review the [Common Issues](#common-issues--solutions) section
3. Check the [README.md](./README.md) for more information
4. Review the [Technical Architecture](./TECHNICAL_ARCHITECTURE.md) document

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for JWT token signing |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth.js |
| `NEXTAUTH_URL` | Yes | Base URL of your application |

## Security Notes

⚠️ **Important Security Reminders:**

- Never commit `.env.local` to version control
- Use strong, random secrets for production
- Keep your database credentials secure
- Regularly update dependencies for security patches
- Use HTTPS in production

---

**Setup Status:** Ready for Development ✅  
**Last Updated:** [Current Date]

