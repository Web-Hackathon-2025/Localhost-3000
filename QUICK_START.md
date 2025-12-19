# 🚀 Quick Start - Run Karigar MVP

Follow these steps to get the project running in 5 minutes!

## Prerequisites Check

Make sure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm installed (`npm --version`)
- ✅ A PostgreSQL database (or Supabase account)

---

## Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages (Next.js, Prisma, Tailwind, etc.)

---

## Step 2: Set Up Database

### Option A: Using Supabase (Easiest - Recommended)

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click "New Project"
3. Fill in project details and wait for it to create
4. Go to **Settings** → **Database**
5. Find "Connection string" and copy the **URI** format
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
6. Replace `[YOUR-PASSWORD]` with your actual database password

### Option B: Using Local PostgreSQL

1. Make sure PostgreSQL is installed and running
2. Create a database:
   ```bash
   createdb karigar
   ```
3. Your connection string: `postgresql://localhost:5432/karigar`

---

## Step 3: Create Environment File

1. Create a file named `.env.local` in the root directory

2. Add these variables (replace with your actual values):

```env
# Database (use your Supabase or local connection string)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Generate random secrets (you can use: openssl rand -base64 32)
JWT_SECRET="your-random-secret-key-here"
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Quick secret generation (Windows PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## Step 4: Initialize Database

Run these commands to create all database tables:

```bash
# Generate Prisma Client
npm run db:generate

# Create tables in database
npm run db:push
```

You should see: `✔ Generated Prisma Client` and `✔ Database synchronized`

---

## Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  ✓ Ready in 2.3s
```

---

## Step 6: Open in Browser

Open [http://localhost:3000](http://localhost:3000) in your browser

You should see the Karigar homepage! 🎉

---

## Test the Application

1. **Click "Sign Up"** to create an account
   - Try creating both a "Customer" and "Provider" account
   
2. **Log in** with your credentials

3. **Check your dashboard** (you'll be redirected based on your role)

---

## 🎯 Common Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:studio` | Open database viewer (http://localhost:5555) |
| `npm run lint` | Check for code errors |
| `npm run format` | Format code automatically |

---

## ❌ Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run db:generate
```

### Database connection error
- Double-check your `DATABASE_URL` in `.env.local`
- Make sure your database is running
- For Supabase: Verify your project is active

### Port 3000 already in use
- Close other applications using port 3000, or
- Change port: `npm run dev -- -p 3001`

### Prisma Client not found
```bash
npm run db:generate
```

---

## ✅ Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created with correct values
- [ ] Database tables created (`npm run db:push`)
- [ ] Development server running (`npm run dev`)
- [ ] Homepage loads at http://localhost:3000
- [ ] Can create an account
- [ ] Can log in successfully

---

## 📚 Next Steps

Once everything is running:

1. Explore the codebase in `src/` directory
2. Check out the database with `npm run db:studio`
3. Read the [Development Roadmap](./KARIGAR_MVP_ROADMAP.md)
4. Start building Phase 1 features!

---

**Need help?** Check [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed troubleshooting.

