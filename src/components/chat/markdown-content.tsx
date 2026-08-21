'use client';

import { memo, useCallback } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy } from 'lucide-react';
import { copyToClipboard } from '../../lib/message-formatter';

/**
 * Renders AI message markdown: GFM tables, syntax-highlighted code blocks
 * with copy buttons, headings, lists, blockquotes.
 */
export const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
  const handleCopyCode = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    const code = e.currentTarget.closest('.code-block')?.querySelector('code');
    if (!code) return;
    const success = await copyToClipboard(code.textContent || '');
    if (success) {
      const button = e.currentTarget;
      const original = button.innerHTML;
      button.innerHTML = '';
      const check = document.createElement('span');
      check.textContent = 'Copied';
      button.appendChild(check);
      button.dataset.copied = 'true';
      setTimeout(() => {
        button.innerHTML = original;
        delete button.dataset.copied;
      }, 2000);
    }
  }, []);

  const components: Components = {
    pre({ children }) {
      // Pull the language off the inner <code> element's className
      let language = 'text';
      const child = Array.isArray(children) ? children[0] : children;
      if (child && typeof child === 'object' && 'props' in child) {
        const match = /language-(\w+)/.exec(String(child.props.className ?? ''));
        if (match) language = match[1];
      }

      return (
        <div className="code-block" data-language={language}>
          <div className="code-header">
            <span className="code-language">{language}</span>
            <button type="button" className="copy-code-btn" onClick={handleCopyCode}>
              <Copy width={14} height={14} />
              Copy
            </button>
          </div>
          <pre>{children}</pre>
        </div>
      );
    },
    code({ className, children, ...rest }) {
      if (className?.includes('language-')) {
        return (
          <code className={className} {...rest}>
            {children}
          </code>
        );
      }
      return (
        <code className="inline-code" {...rest}>
          {children}
        </code>
      );
    },
    a({ href, children }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    table({ children }) {
      return (
        <div className="table-wrapper">
          <table>{children}</table>
        </div>
      );
    },
  };

  return (
    <div className="message-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
