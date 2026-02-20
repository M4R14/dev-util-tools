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

interface AnchorButtonProps {
  label: string;
  copied: boolean;
  onClick: () => void;
  variant?: 'title' | 'section';
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

const useCopyState = () => {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const markCopied = React.useCallback(() => {
    setCopied(true);

    if (typeof window === 'undefined') return;

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => setCopied(false), 1200);
  }, []);

  return { copied, markCopied };
};

const AnchorButton: React.FC<AnchorButtonProps> = ({
  label,
  copied,
  onClick,
  variant = 'section',
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'group inline-flex items-center gap-1.5 rounded-md text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      variant === 'title'
        ? 'px-1 py-0.5 hover:bg-muted/40'
        : 'px-1.5 py-1 hover:bg-muted/60',
    )}
    title={variant === 'title' ? 'Copy title link' : 'Copy section link'}
  >
    <span
      className={cn(
        'text-primary font-semibold transition-all',
        variant === 'title' ? 'text-2xl' : 'text-base',
        copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
      )}
      aria-hidden="true"
    >
      #
    </span>
    <span
      className={cn(
        'transition-colors group-hover:text-primary group-hover:underline underline-offset-4',
        variant === 'title' ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
      )}
    >
      {label}
    </span>
    {copied && (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary ml-1">
        <Check className="w-3.5 h-3.5" />
        Copied
      </span>
    )}
  </button>
);

const ToolLayout = ({ children, className, title, description, icon: Icon }: ToolLayoutProps) => {
  const titleId = title ? `tool-${toAnchorId(title)}` : undefined;
  const titleCopy = useCopyState();

  const handleCopyTitleLink = async () => {
    if (!titleId) return;

    await copyAnchorLink(titleId);
    titleCopy.markCopied();
  };

  return (
    <div
      className={cn(
        'container py-6 md:px-8 md:py-2 space-y-7 md:space-y-8 animate-in fade-in zoom-in-95 duration-500',
        className,
      )}
    >
      {(title || description || Icon) && (
        <div className="flex flex-wrap items-start gap-4 pb-6 border-b border-border/50">
          {Icon && (
            <div className="shrink-0 p-3.5 bg-primary/10 rounded-2xl shadow-sm border border-primary/20">
              <Icon className="w-7 h-7 text-primary" />
            </div>
          )}
          <div className="space-y-1.5 min-w-0">
            {title && (
              <h1 id={titleId} className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                <AnchorButton
                  label={title}
                  copied={titleCopy.copied}
                  onClick={handleCopyTitleLink}
                  variant="title"
                />
              </h1>
            )}
            {description && <p className="text-muted-foreground text-sm md:text-base max-w-3xl">{description}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

const Section = ({ title, children, actions, className }: ToolSectionProps) => {
  const sectionId = title ? `section-${toAnchorId(title)}` : undefined;
  const sectionCopy = useCopyState();

  const handleCopyLink = async () => {
    if (!sectionId) return;
    await copyAnchorLink(sectionId);
    sectionCopy.markCopied();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          {title && (
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 id={sectionId} className="text-sm font-semibold uppercase tracking-wider">
                <AnchorButton
                  label={title}
                  copied={sectionCopy.copied}
                  onClick={handleCopyLink}
                />
              </h3>
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <Card className="overflow-hidden rounded-2xl bg-card/70 backdrop-blur-sm border-border/70 shadow-sm">
        <CardContent className="p-0">{children}</CardContent>
      </Card>
    </div>
  );
};

const Panel = ({ title, children, actions, className }: ToolPanelProps) => {
  return (
    <Card
      className={cn(
        'flex flex-col h-full overflow-hidden rounded-2xl bg-card/70 border-border/70 shadow-sm',
        className,
      )}
    >
      {(title || actions) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3 border-b bg-muted/20">
          {title && <CardTitle className="text-sm font-semibold tracking-tight">{title}</CardTitle>}
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
