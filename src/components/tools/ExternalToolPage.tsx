import React from 'react';
import { ExternalLink, type LucideIcon } from 'lucide-react';
import { ToolLayout } from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { cn } from '../../lib/utils';

/**
 * Shared landing page for tools that hand off to an external site.
 *
 * The hero card and the reference sections are pure data (`ExternalToolSpec`), so adding an
 * external tool means adding one entry to `src/data/externalTools.ts` — not copying ~150
 * lines of layout. Anything genuinely bespoke goes through `children`, which renders in the
 * left column under the hero (see `CrontabTool`'s syntax diagram).
 */

export type ExternalToolAccent = 'emerald' | 'cyan' | 'violet' | 'sky' | 'indigo' | 'pink';

export interface ExternalToolRow {
  label: string;
  description?: string;
  /** Short text shown in a leading badge, e.g. a VIN character range. */
  badge?: string;
  /** Icon shown in a leading badge. Ignored when `badge` is set. */
  badgeIcon?: LucideIcon;
  /** Renders a copy button for this row. */
  copyValue?: string;
}

export type ExternalToolSection =
  | {
      title: string;
      kind: 'rows';
      /** Bullet icon rendered beside every row label. */
      icon?: LucideIcon;
      rows: ExternalToolRow[];
    }
  | {
      title: string;
      kind: 'code';
      rows: { label: string; value: string }[];
    };

export interface ExternalToolSpec {
  accent: ExternalToolAccent;
  /** Large watermark behind the hero card. */
  heroIcon: LucideIcon;
  /** Small icon in the hero badge. */
  badgeIcon: LucideIcon;
  brand: string;
  blurb: string;
  url: string;
  ctaLabel: string;
  /** Optional section in the left column, under the hero. */
  guide?: ExternalToolSection;
  /** Section filling the right column. */
  reference: ExternalToolSection;
}

/**
 * Tailwind scans source for complete class names, so every accent variant is spelled out
 * here rather than interpolated.
 */
const ACCENT_STYLES: Record<ExternalToolAccent, Record<string, string>> = {
  emerald: {
    card: 'border-emerald-500/20 from-emerald-50/50 dark:from-emerald-950/10',
    badge: 'bg-emerald-100 dark:bg-emerald-900/30 ring-emerald-500/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    button: 'shadow-emerald-500/20 hover:shadow-emerald-500/30 bg-emerald-600 hover:bg-emerald-700',
    chip: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  cyan: {
    card: 'border-cyan-500/20 from-cyan-50/50 dark:from-cyan-950/10',
    badge: 'bg-cyan-100 dark:bg-cyan-900/30 ring-cyan-500/20',
    icon: 'text-cyan-600 dark:text-cyan-400',
    button: 'shadow-cyan-500/20 hover:shadow-cyan-500/30 bg-cyan-600 hover:bg-cyan-700',
    chip: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },
  violet: {
    card: 'border-violet-500/20 from-violet-50/50 dark:from-violet-950/10',
    badge: 'bg-violet-100 dark:bg-violet-900/30 ring-violet-500/20',
    icon: 'text-violet-600 dark:text-violet-400',
    button: 'shadow-violet-500/20 hover:shadow-violet-500/30 bg-violet-600 hover:bg-violet-700',
    chip: 'border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  sky: {
    card: 'border-sky-500/20 from-sky-50/50 dark:from-sky-950/10',
    badge: 'bg-sky-100 dark:bg-sky-900/30 ring-sky-500/20',
    icon: 'text-sky-600 dark:text-sky-400',
    button: 'shadow-sky-500/20 hover:shadow-sky-500/30 bg-sky-600 hover:bg-sky-700',
    chip: 'border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400',
  },
  indigo: {
    card: 'border-indigo-500/20 from-indigo-50/50 dark:from-indigo-950/10',
    badge: 'bg-indigo-100 dark:bg-indigo-900/30 ring-indigo-500/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
    button: 'shadow-indigo-500/20 hover:shadow-indigo-500/30 bg-indigo-600 hover:bg-indigo-700',
    chip: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
  pink: {
    card: 'border-pink-500/20 from-pink-50/50 dark:from-pink-950/10',
    badge: 'bg-pink-100 dark:bg-pink-900/30 ring-pink-500/20',
    icon: 'text-pink-600 dark:text-pink-400',
    button: 'shadow-pink-500/20 hover:shadow-pink-500/30 bg-pink-600 hover:bg-pink-700',
    chip: 'border-pink-500/20 bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
};

/** Visible on touch, hover-revealed on pointer devices. */
const COPY_BUTTON_REVEAL =
  'flex-shrink-0 self-end sm:self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity';

const HeroCard: React.FC<{ spec: ExternalToolSpec }> = ({ spec }) => {
  const accent = ACCENT_STYLES[spec.accent];
  const HeroIcon = spec.heroIcon;
  const BadgeIcon = spec.badgeIcon;

  return (
    <Card
      className={cn(
        'shadow-lg bg-gradient-to-br to-background dark:to-background overflow-hidden relative',
        accent.card,
      )}
    >
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <HeroIcon className="w-32 h-32" />
      </div>
      <CardContent className="p-8 space-y-6 relative z-10">
        <div className="space-y-4">
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center ring-1',
              accent.badge,
            )}
          >
            <BadgeIcon className={cn('w-7 h-7', accent.icon)} />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">{spec.brand}</h3>
            <p className="text-muted-foreground leading-relaxed">{spec.blurb}</p>
          </div>
        </div>

        <Button
          asChild
          size="lg"
          className={cn(
            'w-full sm:w-auto h-12 px-8 text-base shadow-lg hover:-translate-y-0.5 transition-all text-white border-none',
            accent.button,
          )}
        >
          <a
            href={spec.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            {spec.ctaLabel} <ExternalLink className="w-4 h-4 opacity-80" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

const SectionRows: React.FC<{
  section: Extract<ExternalToolSection, { kind: 'rows' }>;
  accent: ExternalToolAccent;
}> = ({ section, accent }) => {
  const styles = ACCENT_STYLES[accent];
  const BulletIcon = section.icon;

  return (
    <div className="divide-y divide-border/50">
      {section.rows.map((row) => {
        const BadgeIcon = row.badgeIcon;

        return (
          <div
            key={row.label}
            className="group flex items-start gap-3 p-4 hover:bg-muted/40 transition-colors"
          >
            {(row.badge || BadgeIcon) && (
              <div
                className={cn(
                  'shrink-0 rounded-lg border flex items-center justify-center text-xs font-mono font-medium',
                  // Text badges size to their content; icon badges stay square.
                  row.badge ? 'h-7 min-w-[3.25rem] px-2' : 'w-8 h-8',
                  styles.chip,
                )}
              >
                {row.badge ?? (BadgeIcon ? <BadgeIcon className="w-4 h-4" /> : null)}
              </div>
            )}

            <div className="space-y-1 min-w-0 flex-1">
              <div className="font-medium text-sm text-foreground flex items-start gap-2">
                {BulletIcon && (
                  <BulletIcon className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', styles.icon)} />
                )}
                <span>{row.label}</span>
              </div>
              {row.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{row.description}</p>
              )}
            </div>

            {row.copyValue && (
              <div className={COPY_BUTTON_REVEAL}>
                <CopyButton
                  value={row.copyValue}
                  className="h-8 w-8 hover:bg-background shadow-sm border border-border/50"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const SectionCode: React.FC<{ section: Extract<ExternalToolSection, { kind: 'code' }> }> = ({
  section,
}) => (
  <div className="divide-y divide-border/50">
    {section.rows.map((row) => (
      <div
        key={row.label}
        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/40 transition-colors"
      >
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="font-medium text-sm text-foreground">{row.label}</div>
          {/* inline-block so short expressions hug their content, max-w-full + break-all so
              long URLs and regexes still wrap instead of overflowing. */}
          <code className="inline-block max-w-full text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1.5 rounded border border-border/50 break-all">
            {row.value}
          </code>
        </div>
        <div className={COPY_BUTTON_REVEAL}>
          <CopyButton
            value={row.value}
            className="h-8 w-8 hover:bg-background shadow-sm border border-border/50"
          />
        </div>
      </div>
    ))}
  </div>
);

const ToolSection: React.FC<{
  section: ExternalToolSection;
  accent: ExternalToolAccent;
  /** Right-column sections stretch and scroll; left-column sections hug their content. */
  fill?: boolean;
}> = ({ section, accent, fill }) => (
  <ToolLayout.Section title={section.title}>
    <Card
      className={cn(
        'border-border shadow-sm overflow-hidden',
        fill && 'h-full max-h-full flex flex-col',
      )}
    >
      <CardContent className={cn('p-0', fill && 'overflow-y-auto custom-scrollbar')}>
        {section.kind === 'rows' ? (
          <SectionRows section={section} accent={accent} />
        ) : (
          <SectionCode section={section} />
        )}
      </CardContent>
    </Card>
  </ToolLayout.Section>
);

interface ExternalToolPageProps {
  spec: ExternalToolSpec;
  /** Bespoke content for the left column, rendered under the hero and after `spec.guide`. */
  children?: React.ReactNode;
}

const ExternalToolPage: React.FC<ExternalToolPageProps> = ({ spec, children }) => (
  <ToolLayout>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        <ToolLayout.Section title="External Tool">
          <HeroCard spec={spec} />
        </ToolLayout.Section>

        {spec.guide && <ToolSection section={spec.guide} accent={spec.accent} />}
        {children}
      </div>

      <ToolSection section={spec.reference} accent={spec.accent} fill />
    </div>
  </ToolLayout>
);

export default ExternalToolPage;
