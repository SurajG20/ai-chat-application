# CareerPath AI - Career Counseling Chat Application

A modern AI-powered career counseling chat application built with Next.js, tRPC, and OpenAI.

## Features

- 🤖 AI-powered career counseling with streaming responses
- 💬 Real-time chat interface with session management
- 🔐 Secure authentication (email/password)
- 🎨 Dark/light theme support
- 📱 Responsive design for mobile and desktop
- 💾 Chat history persistence
- 🚪 Logout confirmation modal

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: tRPC, NextAuth.js, Drizzle ORM
- **Database**: PostgreSQL
- **AI**: OpenAI API or Groq API

## Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended)

### 2. Installation

```bash
# Clone and install dependencies
git clone <your-repo-url>
cd assignment
pnpm install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"

# AI API (choose one)
OPENAI_API_KEY="your_openai_key"
# OR
GROQ_API_KEY="your_groq_key"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_random_secret_here"
```

**Getting API Keys:**
- **Groq** (Recommended): Free at [console.groq.com](https://console.groq.com/)
- **OpenAI**: Paid at [platform.openai.com](https://platform.openai.com/)

### 4. Database Setup

```bash
# Generate and push database schema
pnpm db:generate
pnpm db:push
```

### 5. Start Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign Up**: Create an account at `/auth/signup`
2. **Sign In**: Login at `/auth/signin` 
3. **Chat**: Start a new chat session and ask career questions
4. **History**: View previous conversations in the sidebar
5. **Theme**: Toggle between light/dark modes
6. **Logout**: Confirm logout with the modal dialog

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate database migrations
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio (database GUI)
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── chat/              # Chat page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Auth components
│   ├── chat-interface.tsx # Main chat UI
│   ├── auth-button.tsx   # Auth button with logout
│   └── logout-confirmation.tsx # Logout modal
├── db/                   # Database setup
├── server/               # tRPC server
└── utils/               # Utilities
```

## Database Schema

- **users**: User accounts with authentication
- **chat_sessions**: Chat conversation sessions
- **messages**: Individual chat messages

## Deployment

1. Set up production database
2. Configure environment variables
3. Build and deploy:

```bash
pnpm build
pnpm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

## License

MIT License - feel free to use this project for learning and development.