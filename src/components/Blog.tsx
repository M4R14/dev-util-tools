import React, { useMemo } from 'react';
import { CalendarClock, Newspaper, Timer } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import BlogPostCard from './blog/BlogPostCard';

const Blog: React.FC = () => {
  const latestPostDate = useMemo(() => {
    if (BLOG_POSTS.length === 0) return '-';

    return new Date(BLOG_POSTS[0].date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <section className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight inline-flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-primary" />
              Product Updates
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Changelog and development updates for DevPulse. Follow this page for new tools,
              interface improvements, and bug fixes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-border bg-background/60 px-3 py-2 inline-flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Total Updates</span>
              <span className="font-semibold text-foreground ml-auto">{BLOG_POSTS.length}</span>
            </div>
            <div className="rounded-lg border border-border bg-background/60 px-3 py-2 inline-flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Latest</span>
              <span className="font-semibold text-foreground ml-auto">{latestPostDate}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {BLOG_POSTS.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </section>
    </div>
  );
};

export default Blog;
