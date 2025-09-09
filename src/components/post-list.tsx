'use client';

import { trpc } from '../utils/trpc';
import { useState } from 'react';

export function PostList() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorId, setAuthorId] = useState<number | ''>('');

  const { data: posts, refetch } = trpc.posts.getAll.useQuery();
  const { data: users } = trpc.users.getAll.useQuery();
  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      refetch();
      setTitle('');
      setContent('');
      setAuthorId('');
    },
  });

  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && authorId) {
      createPost.mutate({ 
        title, 
        content: content || undefined, 
        authorId: Number(authorId) 
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate({ id });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Posts</h2>
      
      {/* Create Post Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Add New Post</h3>
        <div className="space-y-4 mb-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="author" className="block text-sm font-medium mb-1">
              Author
            </label>
            <select
              id="author"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an author</option>
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={createPost.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {createPost.isPending ? 'Adding...' : 'Add Post'}
        </button>
      </form>

      {/* Posts List */}
      <div className="space-y-4">
        {posts?.map((post) => {
          const author = users?.find(user => user.id === post.authorId);
          return (
            <div key={post.id} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  {post.content && (
                    <p className="text-gray-700 mb-2">{post.content}</p>
                  )}
                  <div className="text-sm text-gray-500">
                    <p>By: {author?.name || 'Unknown'}</p>
                    <p>Created: {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deletePost.isPending}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm ml-4"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {posts?.length === 0 && (
        <p className="text-gray-500 text-center py-8">No posts found. Add one above!</p>
      )}
    </div>
  );
}
