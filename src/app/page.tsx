import { UserList } from '../components/user-list';
import { PostList } from '../components/post-list';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Full Stack Next.js App
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built with Next.js 15, TypeScript, tRPC, TanStack Query, PostgreSQL, and Drizzle ORM
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <UserList />
          </div>
          <div>
            <PostList />
          </div>
        </div>

        <footer className="mt-16 text-center text-gray-500">
          <p>Full Stack Demo - Next.js + tRPC + TanStack Query + PostgreSQL + Drizzle</p>
        </footer>
      </div>
    </div>
  );
}
