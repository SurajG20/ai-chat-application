# CareerPath AI — Project Analysis

## Overview

**CareerPath AI** is a full-stack AI-powered career counseling chat application built with Next.js 15. It features user authentication via NextAuth.js, PostgreSQL via Drizzle ORM, AI-powered responses via NVIDIA's NIM API (OpenAI-compatible), and real-time streaming AI responses via tRPC subscriptions.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 15.5.2 (Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 + tw-animate-css |
| **UI Library** | shadcn/ui (New York style) + Radix UI primitives |
| **Icons** | Lucide React |
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM v0.44 + Drizzle Kit v0.31 |
| **Auth** | NextAuth.js v4.24 + CredentialsProvider + JWT |
| **API Layer** | tRPC v11 (server, client, react-query) |
| **State Management** | TanStack React Query v5 (server) + React useState/useRef (client) |
| **AI Provider** | OpenAI SDK (compatible layer for NVIDIA NIM API) |
| **Markdown** | react-markdown v10 + rehype-highlight + remark-gfm |
| **Validation** | Zod v4 |
| **Package Manager** | npm |

---

## Database Schema

3 tables with cascade deletes:

```
users (id, name, email, password, created_at, updated_at)
  ↓ 1:N
chat_sessions (id, user_id FK, title, created_at, updated_at)
  ↓ 1:N
messages (id, session_id FK, content, role ['user'|'assistant'], created_at)
```

---

## Completed Features

### Authentication
- User registration with hashed passwords (bcryptjs, 12 rounds)
- Sign-in/sign-out with NextAuth.js (credentials provider, JWT strategy)
- Protected chat route (client-side redirect)
- Logout confirmation dialog

### Chat
- Create, list, switch, delete chat sessions
- Auto-generated titles from first user message (AI-powered)
- Send messages, receive AI responses
- Real-time streaming of AI responses via tRPC subscriptions
- Character-level smooth text animation (requestAnimationFrame buffering)
- Markdown rendering with syntax-highlighted code blocks
- Copy button on code blocks and assistant messages
- Message history per session

### AI Integration
- NVIDIA NIM API (OpenAI-compatible SDK)
- 3 verified live models (default: moonshotai/kimi-k3)
- Career counselor system prompt
- Configurable model via `NVIDIA_MODEL` env var

### UI/UX
- Landing page with hero, services, features, testimonials, stats
- Dark/light theme toggle (manual, persists to localStorage)
- 6 accent color presets (theme customizer)
- Resource library modal (8 curated career resources with filtering)
- 6 career-related quick prompts
- Collapsible sidebar with session history
- Mobile-responsive layout
- Keyboard shortcuts (Enter=send, Escape=stop, Cmd/Ctrl+N=new chat)
- Auto-scroll with scroll-to-bottom button
- Typing indicator (pulsing dots)
- Toast notification system (custom)

### Developer
- Drizzle ORM with PostgreSQL
- Database migrations via drizzle-kit
- Full TypeScript types throughout
- tRPC with HTTP batch + HTTP subscription links

---

## Application Architecture & Data Flow

### Auth Flow
```
Sign Up → POST /api/auth/register → hash password → insert user → auto signIn → redirect /chat
Sign In → signIn('credentials') → NextAuth authorize() → verify password → JWT → redirect /chat
```

### Chat Flow (Streaming)
```
User types → useChat.handleSendMessage()
  → createSessionWithMessage (if new) → AI generates title → DB insert
  → tRPC subscription (sendMessageStream)
    → Save user message to DB
    → Fetch conversation history
    → OpenAI streaming API (for-await chunks)
    → Buffer chunks (size 5) → emit via observable
    → On complete: save full AI response to DB, emit 'complete'
  → Client: rAF-based character rendering (3 chars/frame)
  → Cleanup + refetch messages
```

### Component Tree
```
RootLayout
  SessionProvider → TRPCProvider
    Landing Page (/) or Auth Pages or Chat Interface (/chat)
      ChatInterface
        ChatHeader (title, resource library, theme, sidebar toggle)
        ChatSidebar (session list, user profile, logout)
        ChatMessageList
          MessageBubble (user/assistant)
          StreamingMessage (animated)
          TypingIndicator (dots)
        ChatInput (text + send/stop)
        WelcomeScreen (quick prompts)
```

---

## Completed Improvements

### Architecture & Code Cleanup
- [x] **StreamingProcessor duplication**: Removed dead `StreamingProcessor` class from `message-formatter.ts` — only the `use-chat.ts` version is used.
- [x] **Dead code removal**: Removed unused `ChatState`, `ThemeState`, `SidebarState` types from `types/chat.ts`. Removed dead `useEffect` in `use-chat.ts`. Removed unused `shouldStreamPerSession` state.
- [x] **Unused `_onToggleSidebar` prop**: Removed from `ChatSidebar` props interface and call sites.
- [x] **Toast info icon fix**: Changed from `Copy` (wrong icon) to `Info` in `toast.tsx`.

### UI/UX & Design
- [x] **ChatInput textarea**: Replaced `<input type="text">` with auto-resizing `<textarea>` — now supports multi-line messages and Shift+Enter for new lines.
- [x] **SessionItem delete button**: Fixed missing `group` class so the delete button's `opacity-0 group-hover:opacity-100` works.
- [x] **Auth client-side navigation**: Replaced `window.location.href` with `router.push()` using Next.js `useRouter` — avoids full page reloads.
- [x] **Accent color CSS variables**: Added `--color-success` and `--color-success-foreground` to `@theme inline` for proper Tailwind v4 theme integration.
- [x] **Reduced motion support**: Added `@media (prefers-reduced-motion: reduce)` block to respect user accessibility preferences.
- [x] **Keyboard navigation for quick prompts**: Added `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers for `Enter`/`Space`.
- [x] **Removed duplicate CSS animations**: Removed unused `fadeIn`, `blink`, and `messageSlideIn` keyframes (identical to used ones).

## Remaining Areas for Improvement

### Security (High Priority)
- [ ] **tRPC auth middleware**: All procedures use `publicProcedure`. Add context-based auth to prevent user A from accessing user B's sessions.
- [ ] **Server-side route protection**: No `middleware.ts` — `/chat` is protected only client-side via `useSession`.
- [ ] **Rate limiting**: No protection against AI API abuse.

### Architecture & Code Quality
- [ ] **Conversation history truncation**: Entire history is sent to AI every time — will exceed token limits in long chats.
- [ ] **Hardcoded 5 subscription slots**: `useChat` allocates 5 fixed tRPC subscriptions for streaming. Limit concurrent streams and has index-based slot management.
- [ ] **`confirm()` dialog**: `use-chat-sessions.ts` uses native `confirm()` instead of the React `AlertDialog` pattern used elsewhere.
- [ ] **Map state cloning**: Per-session streaming state uses `new Map(prev)` on every update — suboptimal for frequent streaming updates.
- [ ] **No error boundary**: Chat interface lacks a React error boundary.
- [ ] **Empty tRPC context**: Context is `Record<string, never>` — no DB or session injection.

### Features
- [ ] **OAuth providers** (Google, GitHub)
- [ ] **Email verification**
- [ ] **Password reset flow**
- [ ] **Prompt template variables**: Quick prompts contain `[current field]` placeholders but UI doesn't replace them.
- [ ] **Tests**: No unit, integration, or e2e tests.

### Dev Experience
- [ ] **Lint/typecheck scripts**: `npm run lint` works, but no dedicated `typecheck` script in package.json.

---

## Project Structure

```
├── .env.example
├── components.json          # shadcn/ui config
├── drizzle.config.ts        # Drizzle Kit config
├── AGENTS.md                # This file
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout (fonts, SessionProvider, TRPCProvider)
│   │   ├── globals.css      # Tailwind v4 + design system + animations
│   │   ├── page.tsx         # Landing/marketing page
│   │   ├── chat/page.tsx    # Protected chat page
│   │   ├── auth/            # Auth pages (landing, signin, signup)
│   │   └── api/             # NextAuth handler, register API, tRPC handler
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives (15 files)
│   │   ├── chat/            # Chat sub-components (7 files)
│   │   └── ...              # Business components (auth-form, theme, etc.)
│   ├── db/                  # Schema + Drizzle client
│   ├── hooks/               # Custom hooks (useChat, useScrollManager, etc.)
│   ├── lib/                 # AI service, auth utils, message formatter, cn()
│   ├── providers/           # SessionProvider, TRPCProvider
│   ├── server/              # tRPC init + routers (chat)
│   ├── types/               # TypeScript types
│   └── utils/               # tRPC client utility
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NVIDIA_API_KEY` | NVIDIA NIM API key |
| `NVIDIA_MODEL` | Model name (default: moonshotai/kimi-k3) |
| `NEXTAUTH_URL` | NextAuth URL (default: http://localhost:3000) |
| `NEXTAUTH_SECRET` | NextAuth JWT secret |

---

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `SurajG20/ai-chat-application`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
