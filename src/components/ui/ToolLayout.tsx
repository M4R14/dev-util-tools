import React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Check, LucideIcon } from 'lucide-react';

interface ToolLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

interface ToolSectionProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

interface ToolPanelProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const toAnchorId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getAnchorUrl = (anchorId: string) => {
  if (typeof window === 'undefined') {
    return `#${anchorId}`;
  }

  return `${window.location.origin}${window.location.pathname}${window.location.search}#${anchorId}`;
};

const copyAnchorLink = async (anchorId: string) => {
  if (typeof window === 'undefined') return;

  const hash = `#${anchorId}`;
  const url = getAnchorUrl(anchorId);
  window.history.replaceState(null, '', hash);

  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // no-op: keep anchor update even if clipboard is unavailable
  }
};

const ToolLayout = ({ children, className, title, description, icon: Icon }: ToolLayoutProps) => {
  const titleId = title ? `tool-${toAnchorId(title)}` : undefined;
  const [copiedTitle, setCopiedTitle] = React.useState(false);

  const handleCopyTitleLink = async () => {
    if (!titleId) return;

    await copyAnchorLink(titleId);
    setCopiedTitle(true);
    window.setTimeout(() => setCopiedTitle(false), 1200);
  };

  return (
    <div
      className={cn(
        'container max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500',
        className,
      )}
    >
      {(title || description || Icon) && (
        <div className="flex items-center gap-4 pb-6 border-b border-border/40">
          {Icon && (
            <div className="p-3 bg-primary/10 rounded-xl shadow-sm border border-primary/20">
              <Icon className="w-8 h-8 text-primary" />
            </div>
          )}
          <div className="space-y-1">
            {title && (
              <h1 id={titleId} className="text-3xl font-bold tracking-tight text-foreground">
                <button
                  type="button"
                  onClick={handleCopyTitleLink}
                  className="group inline-flex items-center gap-1.5 text-left"
                  title="Copy title link"
                >
                  <span
                    className={cn(
                      'text-primary text-2xl font-semibold transition-all',
                      copiedTitle ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    )}
                    aria-hidden="true"
                  >
                    #
                  </span>
                  <span className="transition-colors group-hover:text-primary group-hover:underline underline-offset-4">
                    {title}
                  </span>
                  {copiedTitle && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary ml-1">
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </span>
                  )}
                </button>
              </h1>
            )}
            {description && <p className="text-muted-foreground text-lg">{description}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

const Section = ({ title, children, actions, className }: ToolSectionProps) => {
  const sectionId = title ? `section-${toAnchorId(title)}` : undefined;
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async () => {
    if (!sectionId) return;
    await copyAnchorLink(sectionId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-1">
          {title && (
            <div className="flex items-center gap-2">
              <h3 id={sectionId} className="text-sm font-semibold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="group inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Copy section link"
                >
                  <span
                    className={cn(
                      'text-primary text-base font-semibold transition-all',
                      copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    )}
                    aria-hidden="true"
                  >
                    #
                  </span>
                  <span className="transition-colors group-hover:text-primary group-hover:underline underline-offset-4">
                    {title}
                  </span>
                </button>
              </h3>
              {copied && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                  <Check className="w-3.5 h-3.5" />
                  Copied
                </span>
              )}
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-border">
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </div>
  );
};

const Panel = ({ title, children, actions, className }: ToolPanelProps) => {
  return (
    <Card
      className={cn(
        'flex flex-col h-full overflow-hidden bg-background border-border shadow-sm',
        className,
      )}
    >
      {(title || actions) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3 border-b bg-muted/30">
          {title && <CardTitle className="text-sm font-medium">{title}</CardTitle>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className="flex-1 p-4 relative text-foreground">{children}</CardContent>
    </Card>
  );
};

ToolLayout.Section = Section;
ToolLayout.Panel = Panel;

export default ToolLayout;
