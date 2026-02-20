import React from 'react';
import { Bug, Rocket, Wrench } from 'lucide-react';
import type { BlogPost } from '../../data/blogPosts';
import { cn } from '../../lib/utils';

interface BlogPostCardProps {
  post: BlogPost;
}

const CATEGORY_META = {
  release: {
    label: 'Release',
    icon: Rocket,
    className: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20',
  },
  improvement: {
    label: 'Improvement',
    icon: Wrench,
    className: 'text-sky-700 bg-sky-500/10 border-sky-500/20',
  },
  fix: {
    label: 'Fix',
    icon: Bug,
    className: 'text-amber-700 bg-amber-500/10 border-amber-500/20',
  },
} as const;

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const meta = CATEGORY_META[post.category];
  const Icon = meta.icon;
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="rounded-xl border border-border bg-card/70 backdrop-blur-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">{post.title}</h2>
        <span className="text-xs font-medium text-muted-foreground">{formattedDate}</span>
      </div>

      <div className="mt-3">
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold', meta.className)}>
          <Icon className="w-3.5 h-3.5" />
          {meta.label}
        </span>
      </div>

      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{post.summary}</p>

      <ul className="mt-4 space-y-1.5">
        {post.changes.map((change) => (
          <li key={change} className="text-sm text-foreground/90 flex gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{change}</span>
          </li>
        ))}
      </ul>
    </article>
  );
};

export default BlogPostCard;
