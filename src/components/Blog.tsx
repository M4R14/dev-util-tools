import React, { useMemo } from 'react';
import { CalendarClock, Newspaper, SearchX, Timer } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { useBlogFilters } from '../hooks/useBlogFilters';
import { BlogFilters, BlogPostCard } from './blog/index';

const Blog: React.FC = () => {
  const { language, setLanguage, category, setCategory, search, setSearch, visiblePosts, counts } =
    useBlogFilters();

  const latestPostDate = useMemo(() => {
    if (BLOG_POSTS.length === 0) return '-';

    // timeZone: 'UTC' because the frontmatter date is a calendar date, not an instant — see
    // BlogPostCard for the same reason.
    return new Date(BLOG_POSTS[0].date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
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

        <div className="mt-6 border-t border-border/60 pt-4">
          <BlogFilters
            category={category}
            onCategoryChange={setCategory}
            language={language}
            onLanguageChange={setLanguage}
            search={search}
            onSearchChange={setSearch}
            counts={counts}
          />
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {visiblePosts.map((post) => (
          <BlogPostCard key={post.id} post={post} language={language} />
        ))}

        {visiblePosts.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
            <SearchX className="w-8 h-8 mx-auto text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-foreground">
              No updates match your filters
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different category, or clear the search box.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Blog;
