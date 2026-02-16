import React from 'react';
import { RefreshCw, Check, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { usePasswordGenerator } from '../../hooks/usePasswordGenerator';
import { cn } from '../../lib/utils';

const PasswordGenerator: React.FC = () => {
  const {
    length,
    setLength,
    includeUpper,
    setIncludeUpper,
    includeLower,
    setIncludeLower,
    includeNumbers,
    setIncludeNumbers,
    includeSymbols,
    setIncludeSymbols,
    password,
    generatePassword,
  } = usePasswordGenerator();

  const getStrength = () => {
    const activeOptions = [includeUpper, includeLower, includeNumbers, includeSymbols].filter(
      Boolean,
    ).length;
    let score = activeOptions;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;
    if (length < 8) score = Math.min(score, 1);

    if (score < 3)
      return {
        label: 'Weak',
        color: 'bg-red-500',
        textColor: 'text-red-500',
        percent: 33,
        message: 'Too guessable',
      };
    if (score < 5)
      return {
        label: 'Medium',
        color: 'bg-amber-500',
        textColor: 'text-amber-500',
        percent: 66,
        message: 'Reasonable for most sites',
      };
    return {
      label: 'Strong',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      percent: 100,
      message: 'Excellent entropy',
    };
  };

  const strength = getStrength();

  return (
    <ToolLayout className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Col: Result & Strength */}
        <div className="space-y-6 md:sticky md:top-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight">Generated Password</h3>
            <p className="text-sm text-muted-foreground">Secure credential ready for use</p>
          </div>

          <Card className="overflow-hidden border-primary/20 shadow-lg bg-gradient-to-br from-background to-primary/5">
            <CardContent className="p-0">
              <div className="p-8 pb-6 text-center">
                <div className="font-mono text-3xl md:text-4xl tracking-wider text-primary break-all font-bold min-h-[3rem] flex items-center justify-center">
                  {password || <span className="text-muted-foreground/30 text-xl">...</span>}
                </div>
              </div>

              <div className="bg-muted/50 p-4 border-t border-border flex items-center justify-center gap-3">
                <Button
                  variant="default"
                  size="lg"
                  onClick={generatePassword}
                  className="shadow-md hover:shadow-lg transition-all active:scale-95 min-w-[140px]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Generate
                </Button>
                <CopyButton
                  value={password}
                  className="h-10 w-10 border border-input shadow-sm hover:bg-background"
                />
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Security Strength
              </span>
              <span
                className={cn(
                  'text-xs font-bold uppercase flex items-center gap-1.5',
                  strength.textColor,
                )}
              >
                {strength.label === 'Strong' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : strength.label === 'Medium' ? (
                  <Shield className="w-4 h-4" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
                {strength.label}
              </span>
            </div>
            <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-700 ease-out rounded-full',
                  strength.color,
                )}
                style={{ width: `${strength.percent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">{strength.message}</p>
          </div>
        </div>

        {/* Right Col: Configuration */}
        <ToolLayout.Section title="Customize Options">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6 space-y-8">
              {/* Length Slider */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Character Length</label>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary font-mono border border-primary/20">
                    {length}
                  </div>
                </div>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="4"
                    max="64"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className={cn(
                      'w-full h-2 rounded-lg appearance-none cursor-pointer',
                      'bg-muted accent-primary hover:accent-primary/80 transition-all',
                    )}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider px-1">
                    <span>Short</span>
                    <span>Standard</span>
                    <span>Extreme</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50" />

              {/* Toggles */}
              <div className="grid grid-cols-1 gap-3">
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  Character Sets
                </label>
                {[
                  {
                    id: 'upper',
                    label: 'Uppercase',
                    example: 'ABC',
                    checked: includeUpper,
                    set: setIncludeUpper,
                  },
                  {
                    id: 'lower',
                    label: 'Lowercase',
                    example: 'abc',
                    checked: includeLower,
                    set: setIncludeLower,
                  },
                  {
                    id: 'numbers',
                    label: 'Numbers',
                    example: '123',
                    checked: includeNumbers,
                    set: setIncludeNumbers,
                  },
                  {
                    id: 'symbols',
                    label: 'Symbols',
                    example: '!@#',
                    checked: includeSymbols,
                    set: setIncludeSymbols,
                  },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => opt.set(!opt.checked)}
                    className={cn(
                      'relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md',
                      opt.checked
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-transparent bg-muted/40 hover:bg-muted/60 hover:border-border',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                          opt.checked
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground/30 bg-transparent',
                        )}
                      >
                        {opt.checked && <Check className="w-3 h-3" />}
                      </div>
                      <div className="space-y-0.5">
                        <div
                          className={cn(
                            'font-semibold text-sm',
                            opt.checked ? 'text-foreground' : 'text-muted-foreground',
                          )}
                        >
                          {opt.label}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded border border-border/50">
                      {opt.example}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ToolLayout.Section>
      </div>
    </ToolLayout>
  );
};

export default PasswordGenerator;
