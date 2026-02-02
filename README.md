# Dental Quotes Web App

A production-grade, modular web application for generating and storing dental service quotes. Built with Vite, React, TypeScript, and Supabase.

## 🏗️ Architecture

This project follows a **feature-based architecture** with strict separation of concerns:

```
src/
├── app/              # App-level configuration
├── features/         # Feature modules (auth, price-items, quotes)
├── shared/           # Shared components and utilities
├── lib/              # Core libraries (Supabase client)
└── styles/           # Global styles
```

Each feature module contains:
- `types.ts` - TypeScript interfaces
- `services/` - Business logic and API calls
- `hooks/` - React hooks for state management
- `components/` - UI components

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up Supabase database:**
   
   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Create price_items table
   CREATE TABLE price_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     price NUMERIC NOT NULL,
     group_type TEXT NOT NULL,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
   );

   -- Create quotes table
   CREATE TABLE quotes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     patient_name TEXT NOT NULL,
     notes TEXT,
     total NUMERIC NOT NULL,
     created_at TIMESTAMPTZ DEFAULT now(),
     created_by UUID REFERENCES auth.users(id)
   );

   -- Create quote_items table
   CREATE TABLE quote_items (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
     price_item_id UUID REFERENCES price_items(id),
     price_snapshot NUMERIC NOT NULL,
     quantity INTEGER DEFAULT 1,
     subtotal NUMERIC NOT NULL
   );

   -- Enable Row Level Security
   ALTER TABLE price_items ENABLE ROW LEVEL SECURITY;
   ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

   -- RLS Policies for price_items (read for all authenticated users)
   CREATE POLICY "Allow authenticated users to read price items"
     ON price_items FOR SELECT
     TO authenticated
     USING (true);

   CREATE POLICY "Allow authenticated users to insert price items"
     ON price_items FOR INSERT
     TO authenticated
     WITH CHECK (true);

   CREATE POLICY "Allow authenticated users to update price items"
     ON price_items FOR UPDATE
     TO authenticated
     USING (true);

   -- RLS Policies for quotes (users can only see their own quotes)
   CREATE POLICY "Users can read their own quotes"
     ON quotes FOR SELECT
     TO authenticated
     USING (auth.uid() = created_by);

   CREATE POLICY "Users can create their own quotes"
     ON quotes FOR INSERT
     TO authenticated
     WITH CHECK (auth.uid() = created_by);

   CREATE POLICY "Users can delete their own quotes"
     ON quotes FOR DELETE
     TO authenticated
     USING (auth.uid() = created_by);

   -- RLS Policies for quote_items
   CREATE POLICY "Users can read quote items for their quotes"
     ON quote_items FOR SELECT
     TO authenticated
     USING (
       EXISTS (
         SELECT 1 FROM quotes
         WHERE quotes.id = quote_items.quote_id
         AND quotes.created_by = auth.uid()
       )
     );

   CREATE POLICY "Users can insert quote items for their quotes"
     ON quote_items FOR INSERT
     TO authenticated
     WITH CHECK (
       EXISTS (
         SELECT 1 FROM quotes
         WHERE quotes.id = quote_items.quote_id
         AND quotes.created_by = auth.uid()
       )
     );
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Create a user in Supabase:**
   - Go to your Supabase dashboard → Authentication → Users
   - Click "Add user" and create a test account
   - Use these credentials to log in to the app

## 📱 Features

- **Authentication** - Secure login with Supabase Auth
- **Price Items Catalog** - Manage dental service prices grouped by type
- **Quote Builder** - Create quotes by selecting items from the catalog
- **Quote History** - View all generated quotes
- **Mobile-First Design** - Responsive layout optimized for mobile devices

## 🛠️ Tech Stack

- **Frontend:** Vite + React + TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Routing:** React Router v6

## 📁 Project Structure

- **No business logic in UI components** - All logic is in services and hooks
- **Feature-first organization** - Each feature is self-contained
- **Reusable components** - Shared UI components in `src/shared/components`
- **Type-safe** - Strict TypeScript configuration

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own quotes
- Environment variables for sensitive credentials

## 🚢 Deployment

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 📝 License

MIT
