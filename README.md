# Career Counseling Chat Application

A modern full-stack career counseling chat application built with the latest technologies:

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **tRPC** - End-to-end typesafe APIs
- **TanStack Query** - Powerful data synchronization
- **PostgreSQL** - Robust relational database
- **Drizzle ORM** - Type-safe database toolkit
- **Tailwind CSS v4** - Utility-first CSS framework with CSS-based configuration
- **NextAuth.js** - Authentication system
- **OpenAI API** - AI-powered career counseling

## Features

### Core Features ✅
- ✅ AI-powered career counseling chat interface
- ✅ Chat session management with history
- ✅ Message persistence and threading
- ✅ Responsive design for mobile and desktop
- ✅ User authentication with NextAuth.js (email/password)
- ✅ User registration and login system
- ✅ Secure password hashing with bcrypt
- ✅ Modern shadcn/ui authentication interface
- ✅ Real-time typing indicators
- ✅ Dark/light theme toggle

### Advanced Features ✅
- ✅ Chat session creation and deletion
- ✅ Message history with timestamps
- ✅ Professional career counseling AI responses
- ✅ Mobile-responsive sidebar with overlay
- ✅ Loading states and error handling
- ✅ Type-safe API with tRPC
- ✅ Database operations with Drizzle ORM

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

2. Set up your environment variables:
   - Copy `.env.example` to `.env.local` and update the following variables:
   ```
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
   
   # OpenAI API Configuration
   OPENAI_API_KEY="your_openai_api_key_here"
   
   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_nextauth_secret_here"
   
   # Note: Google OAuth has been removed for simplicity
   ```

   **Important**: Make sure to:
   - Set up a PostgreSQL database and update the `DATABASE_URL`
   - Get an AI API key (see options below)
   - Generate a random secret for `NEXTAUTH_SECRET` (you can use `openssl rand -base64 32`)

   **AI API Options:**
   - **Groq** (Recommended): Get free API key from [Groq Console](https://console.groq.com/) (fast, generous free tier)
   - **OpenAI**: Get API key from [OpenAI](https://platform.openai.com/api-keys) (paid)
   - **Together AI**: Get free API key from [Together AI](https://together.ai/) (free tier: $5/month)
   - **Other options**: Anthropic, etc. (modify the code to add support)

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

## Usage

1. **Authentication**: 
   - **Landing Page**: Visit `/auth` to choose between sign in or sign up
   - **Sign Up**: Create a new account with email and password at `/auth/signup`
   - **Sign In**: Use your email and password to authenticate at `/auth/signin`
2. **Start Chatting**: Create a new chat session and start asking career-related questions
3. **View History**: Access your previous chat sessions from the sidebar
4. **Theme Toggle**: Switch between light and dark themes using the toggle button
5. **Mobile Support**: The interface is fully responsive and works on mobile devices

## Groq Setup (Recommended)

Groq is the fastest and most generous free option for AI API access:

1. **Sign up**: Go to [console.groq.com](https://console.groq.com/)
2. **Get API key**: Create a new API key in the console
3. **Add to environment**: Add `GROQ_API_KEY="your_key_here"` to your `.env.local`
4. **Remove other keys**: Comment out or remove `OPENAI_API_KEY` and `TOGETHER_API_KEY`

The app will automatically use Groq's `llama-3.1-70b-versatile` model, which provides:
- ⚡ **Extremely fast responses** (often under 1 second)
- 🆓 **Generous free tier** (no credit card required)
- 🧠 **High-quality responses** for career counseling

## Authentication System

The application uses NextAuth.js with a custom email/password authentication system:

### Features
- **Secure Registration**: Users can create accounts with email and password
- **Password Hashing**: Passwords are securely hashed using bcrypt with salt rounds of 12
- **Session Management**: JWT-based sessions with proper token handling
- **Database Integration**: User data is stored in PostgreSQL using Drizzle ORM
- **Form Validation**: Client and server-side validation for all inputs

### API Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication endpoints

### Database Schema
The `users` table includes:
- `id` - Primary key (serial)
- `email` - Unique email address
- `password` - Hashed password
- `name` - User's full name
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### UI Components
The authentication system uses modern shadcn/ui components:
- **Card Components**: Clean, modern card layouts for forms
- **Form Components**: Accessible form inputs with proper labels
- **Button Components**: Consistent button styling with loading states
- **Input Components**: Styled inputs with icons and validation
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode**: Full dark mode support with proper contrast
- **Gradient Backgrounds**: Beautiful gradient backgrounds for visual appeal

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
│   ├── chat-interface.tsx # Main chat interface
│   ├── auth-button.tsx # Authentication button
│   └── theme-toggle.tsx # Theme toggle component
├── db/                 # Database configuration
│   ├── index.ts        # Database connection
│   └── schema.ts       # Database schema
├── providers/          # React providers
│   └── trpc-provider.tsx # tRPC + TanStack Query provider
├── server/             # tRPC server
│   ├── index.ts        # Main router
│   ├── trpc.ts         # tRPC configuration
│   └── routers/        # API route handlers
│       ├── users.ts    # User management routes
│       └── chat.ts     # Chat functionality routes
└── utils/              # Utilities
    └── trpc.ts         # tRPC client configuration
```

## API Endpoints

The application provides the following tRPC procedures:

### Chat
- `chat.getSessions` - Get all chat sessions for a user
- `chat.getMessages` - Get messages for a specific chat session
- `chat.createSession` - Create a new chat session
- `chat.sendMessage` - Send a message and get AI response
- `chat.updateSessionTitle` - Update session title
- `chat.deleteSession` - Delete a chat session

### Users
- `users.getAll` - Get all users
- `users.getById` - Get user by ID
- `users.create` - Create new user
- `users.update` - Update user
- `users.delete` - Delete user

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