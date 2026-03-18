'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, BookOpen } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';
import { PageSkeleton } from '@/components/ui/skeleton-loaders';
import { PageTransition } from '@/components/layout/PageTransition';
import { useArticle } from '@/lib/queries';

/**
 * Simple markdown renderer for trusted internal content only.
 */
function MarkdownLine({ line }: { line: string }) {
  function parseBold(text: string): React.ReactNode[] {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
    );
  }

  if (line.startsWith('# ')) {
    return <h1 className="text-2xl font-bold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>{parseBold(line.slice(2))}</h1>;
  }
  if (line.startsWith('## ')) {
    return <h2 className="text-lg font-semibold mt-5 mb-2" style={{ color: 'var(--text-primary)' }}>{parseBold(line.slice(3))}</h2>;
  }
  if (line.startsWith('- ')) {
    return <li className="ml-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{parseBold(line.slice(2))}</li>;
  }
  if (/^\d+\.\s/.test(line)) {
    return <li className="ml-4 list-decimal text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{parseBold(line.replace(/^\d+\.\s/, ''))}</li>;
  }
  if (line.trim() === '') {
    return <div className="h-2" />;
  }
  return <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{parseBold(line)}</p>;
}

function renderMarkdown(content: string) {
  return content.split('\n').map((line, i) => <MarkdownLine key={i} line={line} />);
}

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: article, isLoading, error } = useArticle(id);

  if (isLoading) {
    return <PageSkeleton type="list" count={1} />;
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <EmptyState
          icon={BookOpen}
          title="Article not found"
          description="The article you are looking for does not exist or has been removed."
          actionLabel="Back to Know Hub"
          actionHref="/knowledge"
        />
      </div>
    );
  }

  const authorName = article.author
    ? (typeof article.author === 'string' ? article.author : `${article.author.firstName} ${article.author.lastName}`)
    : 'Unknown';

  return (
    <ErrorBoundary fallbackTitle="Article failed to load">
      <PageTransition>
      <div className="space-y-6 p-6 md:p-8">
        <Link
          href="/knowledge"
          className="flex items-center gap-1 text-sm transition-colors hover:text-[var(--text-primary)] min-h-[44px] inline-flex"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="size-4" />
          Back to Know Hub
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          {/* Metadata */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <Tag size={12} aria-hidden="true" />
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <User size={12} aria-hidden="true" />
              {authorName}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <Calendar size={12} aria-hidden="true" />
              Updated {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-1.5">
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div
            className="rounded-xl border p-6 md:p-8"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
          >
            <div className="prose-sm">
              {renderMarkdown(article.content || '')}
            </div>
          </div>
        </motion.article>
      </div>
      </PageTransition>
    </ErrorBoundary>
  );
}
