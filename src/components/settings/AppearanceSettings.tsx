import React from 'react';
import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { THEME_PREFERENCES, type ThemePreference } from '../../lib/platform/theme';
import { cn } from '../../lib/utils';

const OPTION_META: Record<ThemePreference, { label: string; icon: typeof Sun }> = {
  light: { label: 'Light', icon: Sun },
  dark: { label: 'Dark', icon: Moon },
  system: { label: 'System', icon: Monitor },
};

export const AppearanceSettings: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <Card className="border-border/70 bg-background/70">
      <CardHeader className="pb-3">
        <CardTitle className="inline-flex items-center gap-2 text-base">
          <Palette className="h-4 w-4 text-primary" />
          Theme
        </CardTitle>
        <CardDescription>
          {theme === 'system'
            ? `Following your operating system, currently ${resolvedTheme}.`
            : 'Fixed to your choice, ignoring the operating system.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="inline-flex items-center rounded-lg border border-border bg-background/60 p-1"
          role="group"
          aria-label="Theme"
        >
          {THEME_PREFERENCES.map((option) => {
            const { label, icon: Icon } = OPTION_META[option];
            const active = theme === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                aria-pressed={active}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
