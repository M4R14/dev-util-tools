import React from 'react';
import type { BlogPost } from '../../data/blogPosts';
import { BLOG_CATEGORY_META } from '../../data/blogCategories';
import type { BlogLanguage } from '../../lib/blogContent';
import { cn } from '../../lib/utils';

interface BlogPostCardProps {
  post: BlogPost;
  language: BlogLanguage;
}

const MARKDOWN_SUMMARY_CLASS =
  'mt-4 text-sm text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-muted/40 [&_code]:px-1 [&_code]:py-0.5';

const MARKDOWN_CONTENT_CLASS =
  'mt-4 text-sm leading-relaxed text-foreground/90 ' +
  '[&_h1]:mt-5 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight ' +
  '[&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight ' +
  '[&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold ' +
  '[&_p]:leading-7 [&_p+p]:mt-3 ' +
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 ' +
  '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 ' +
  '[&_li]:text-foreground/90 ' +
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-90 ' +
  '[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground ' +
  '[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border/60 [&_pre]:bg-muted/30 [&_pre]:p-3 ' +
  '[&_pre_code]:rounded-none [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-xs [&_pre_code]:leading-6 ' +
  '[&_code]:rounded [&_code]:bg-muted/40 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] ' +
  '[&_hr]:my-4 [&_hr]:border-border/70 ' +
  '[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-border/60 ' +
  '[&_thead]:bg-muted/30 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide ' +
  '[&_td]:border-t [&_td]:border-border/40 [&_td]:px-3 [&_td]:py-2';

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, language }) => {
  const meta = BLOG_CATEGORY_META[post.category];
  const Icon = meta.icon;
  // The date is an ISO calendar date, not an instant. Without timeZone: 'UTC' it is parsed as UTC
  // midnight and then localised, so every reader west of UTC sees the previous day.
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const body = post.html[language];

  return (
    <article className="rounded-xl border border-border bg-card/70 backdrop-blur-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">{post.title}</h2>
        <span className="text-xs font-medium text-muted-foreground">{formattedDate}</span>
      </div>

      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold',
              meta.className,
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {meta.label}
          </span>
          {post.id === 'auto-release-notes' && (
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
              Auto
            </span>
          )}
        </div>
      </div>

      <div
        className={MARKDOWN_SUMMARY_CLASS}
        dangerouslySetInnerHTML={{ __html: post.summaryHtml }}
      />

      {post.html.shared && (
        <div
          className={MARKDOWN_CONTENT_CLASS}
          dangerouslySetInnerHTML={{ __html: post.html.shared }}
        />
      )}

      {body && (
        <div className={MARKDOWN_CONTENT_CLASS} dangerouslySetInnerHTML={{ __html: body }} />
      )}
    </article>
  );
};
