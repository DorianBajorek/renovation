# Supabase Setup Guide

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be ready

### 2. Get Your Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy your **Project URL** and **anon public key**

### 3. Set Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Set Up Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL to create tables and sample data

### 5. Update Service Layer

Replace the API calls in your service files with Supabase calls:

```typescript
// Instead of fetch('/api/rooms')
import { getRooms } from "@/lib/supabase-service";
```

## 📁 File Structure

```
src/
├── lib/
│   ├── supabase.ts              # Supabase client
│   └── supabase-service.ts      # Database operations
├── types/
│   └── database.ts              # Database types
└── app/
    └── types/                   # Application types
```

## 🔧 Features

- ✅ **Real-time database** with PostgreSQL
- ✅ **Type-safe** operations with TypeScript
- ✅ **Authentication** ready (can be added later)
- ✅ **Row Level Security** (RLS) support
- ✅ **Automatic timestamps** with triggers

## 🎯 Next Steps

1. **Test the connection** by running your app
2. **Add authentication** if needed
3. **Set up Row Level Security** for production
4. **Add real-time subscriptions** for live updates

## 🐛 Troubleshooting

- **Environment variables not loading?** Restart your dev server
- **Database connection errors?** Check your credentials
- **Type errors?** Make sure database types match your schema
