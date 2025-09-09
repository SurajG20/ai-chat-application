# Full Stack Next.js Application

A modern full-stack application built with the latest technologies:

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **tRPC** - End-to-end typesafe APIs
- **TanStack Query** - Powerful data synchronization
- **PostgreSQL** - Robust relational database
- **Drizzle ORM** - Type-safe database toolkit
- **Tailwind CSS** - Utility-first CSS framework

## Features

- ✅ Full-stack TypeScript with end-to-end type safety
- ✅ Real-time data fetching with TanStack Query
- ✅ Database operations with Drizzle ORM
- ✅ User and Post management with CRUD operations
- ✅ Modern UI with Tailwind CSS
- ✅ Development tools (React Query DevTools, Drizzle Studio)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. Clone the repository and install dependencies:
```bash
pnpm install
```

2. Set up your database:
   - Create a PostgreSQL database
   - Copy `.env.example` to `.env.local` and update the `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
   ```

3. Generate and run database migrations:
```bash
pnpm db:generate
pnpm db:push
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Management

- **Generate migrations**: `pnpm db:generate`
- **Push schema changes**: `pnpm db:push`
- **Run migrations**: `pnpm db:migrate`
- **Open Drizzle Studio**: `pnpm db:studio`

### Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/trpc/       # tRPC API routes
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── user-list.tsx   # User management component
│   └── post-list.tsx   # Post management component
├── db/                 # Database configuration
│   ├── index.ts        # Database connection
│   └── schema.ts       # Database schema
├── providers/          # React providers
│   └── trpc-provider.tsx # tRPC + TanStack Query provider
├── server/             # tRPC server
│   ├── index.ts        # Main router
│   ├── trpc.ts         # tRPC configuration
│   └── routers/        # API route handlers
└── utils/              # Utilities
    └── trpc.ts         # tRPC client configuration
```

## API Endpoints

The application provides the following tRPC procedures:

### Users
- `users.getAll` - Get all users
- `users.getById` - Get user by ID
- `users.create` - Create new user
- `users.update` - Update user
- `users.delete` - Delete user
- `users.getPosts` - Get posts by user

### Posts
- `posts.getAll` - Get all posts
- `posts.getById` - Get post by ID
- `posts.create` - Create new post
- `posts.update` - Update post
- `posts.delete` - Delete post

## Development

- The app uses tRPC for type-safe API communication
- TanStack Query handles caching and synchronization
- Drizzle ORM provides type-safe database operations
- React Query DevTools are available in development
- Drizzle Studio provides a database GUI

## Deployment

1. Build the application:
```bash
pnpm build
```

2. Start the production server:
```bash
pnpm start
```

Make sure to set up your production database and update the `DATABASE_URL` environment variable.

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety