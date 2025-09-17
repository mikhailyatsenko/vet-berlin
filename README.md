# Vet Catalog

A Next.js application for discovering and searching veterinarians in Berlin. Built with modern React patterns and MongoDB integration.

## Features

- 🔍 **Search & Filter**: Find veterinarians by name, category, neighborhood, and availability
- 📍 **Location-based**: Browse by neighborhood with dedicated pages
- ⭐ **Reviews**: Google Maps integration with ratings and reviews
- 📱 **Responsive**: Mobile-first design with Tailwind CSS
- 🚀 **Performance**: Server-side rendering and optimized loading states

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI + Custom components
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   Add your MongoDB connection string and database name.

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── ui/             # Base UI components
└── lib/                # Utilities and services
    ├── mongodb.ts      # Database connection
    ├── veterinarians.ts # Data service
    └── types.ts        # TypeScript types
```
