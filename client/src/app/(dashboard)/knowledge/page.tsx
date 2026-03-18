'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, BookOpen, Calendar, Tag } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { mockArticles } from '@/lib/mock-data';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function KnowledgePage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const categories = [...new Set(mockArticles.map((a) => a.category))];

  const filtered = mockArticles.filter((article) => {
    const matchesSearch = !search || article.title.toLowerCase().includes(search.toLowerCase()) || article.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 p-6 md:p-8">
      <PageHeader
        index="04"
        title="KNOW HUB"
        description="IT knowledge base and documentation"
      />

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1 max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <Input
            placeholder="Search knowledge base..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-11 rounded-lg border px-3 text-sm"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </motion.div>

      {/* Articles */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {filtered.map((article) => (
          <motion.div key={article.id} variants={item}>
            <Link href={`/knowledge/${article.id}`}>
              <div
                className="group rounded-xl border p-5 transition-all hover:shadow-md"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-secondary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'; }}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {article.title}
                    </h3>
                    <p className="mt-1 text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {article.content.replace(/[#*\n]/g, ' ').trim().slice(0, 150)}...
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <Tag size={12} />
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <Calendar size={12} />
                        {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        by {article.author}
                      </span>
                    </div>
                  </div>
                </div>
                {article.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <div className="py-16 text-center" style={{ color: 'var(--text-tertiary)' }}>
          <BookOpen className="mx-auto size-12 mb-3 opacity-40" />
          <p className="text-sm">No articles found matching your search.</p>
        </div>
      )}
    </div>
  );
}
