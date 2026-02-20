import React from 'react';
import { Eye, EyeOff, RefreshCw, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { Slider } from '../ui/Slider';
import { Switch } from '../ui/Switch';
import { usePasswordGenerator } from '../../hooks/usePasswordGenerator';
import { getPasswordStrength } from '../../lib/passwordStrength';
import { cn } from '../../lib/utils';

const CHARSET_SIZES = {
  upper: 26,
  lower: 26,
  numbers: 10,
  symbols: 26,
} as const;

type CharsetKey = keyof typeof CHARSET_SIZES;

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

  const [revealPassword, setRevealPassword] = React.useState(false);

  const strength = getPasswordStrength({
    length,
    includeUpper,
    includeLower,
    includeNumbers,
    includeSymbols,
  });

  const enabledSets = {
    upper: includeUpper,
    lower: includeLower,
    numbers: includeNumbers,
    symbols: includeSymbols,
  };

  const activeSetCount = Object.values(enabledSets).filter(Boolean).length;
  const characterPool = Object.entries(enabledSets).reduce((sum, [key, enabled]) => {
    if (!enabled) return sum;
    return sum + CHARSET_SIZES[key as CharsetKey];
  }, 0);
  const entropyBits = characterPool > 0 ? Math.round(length * Math.log2(characterPool)) : 0;

  const handleSetToggle = (key: CharsetKey, nextChecked: boolean) => {
    const isCurrentlyEnabled = enabledSets[key];
    if (isCurrentlyEnabled && !nextChecked && activeSetCount === 1) {
      toast.error('At least one character set must remain enabled');
      return;
    }

    if (key === 'upper') setIncludeUpper(nextChecked);
    if (key === 'lower') setIncludeLower(nextChecked);
    if (key === 'numbers') setIncludeNumbers(nextChecked);
    if (key === 'symbols') setIncludeSymbols(nextChecked);
  };

  const maskedPassword = password ? '•'.repeat(Math.max(password.length, 12)) : '';
  const previewPassword = revealPassword ? password : maskedPassword;

  const StrengthIcon =
    strength.label === 'Strong'
      ? ShieldCheck
      : strength.label === 'Medium'
        ? Shield
        : ShieldAlert;

  const charsetOptions: Array<{
    key: CharsetKey;
    label: string;
    description: string;
    sample: string;
    checked: boolean;
  }> = [
    {
      key: 'upper',
      label: 'Uppercase',
      description: 'A-Z letters',
      sample: 'ABC',
      checked: includeUpper,
    },
    {
      key: 'lower',
      label: 'Lowercase',
      description: 'a-z letters',
      sample: 'abc',
      checked: includeLower,
    },
    {
      key: 'numbers',
      label: 'Numbers',
      description: '0-9 digits',
      sample: '123',
      checked: includeNumbers,
    },
    {
      key: 'symbols',
      label: 'Symbols',
      description: 'Special characters',
      sample: '!@#',
      checked: includeSymbols,
    },
  ];

  return (
    <ToolLayout className="mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          <ToolLayout.Panel
            title="Generated Password"
            actions={
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setRevealPassword((prev) => !prev)}
                  aria-label={revealPassword ? 'Hide password' : 'Show password'}
                  title={revealPassword ? 'Hide password' : 'Show password'}
                >
                  {revealPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="default" size="sm" onClick={generatePassword}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate
                </Button>
                <CopyButton value={password} disabled={!password} />
              </div>
            }
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 p-5 md:p-6 shadow-sm">
                <p
                  className={cn(
                    'font-mono min-h-[3rem] text-center tracking-wide break-all transition-colors',
                    password
                      ? 'text-2xl md:text-3xl font-bold text-primary'
                      : 'text-base text-muted-foreground',
                  )}
                >
                  {password ? previewPassword : 'Enable at least one character set'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                  <p className="text-muted-foreground">Length</p>
                  <p className="font-mono font-semibold">{length}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                  <p className="text-muted-foreground">Pool Size</p>
                  <p className="font-mono font-semibold">{characterPool}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 col-span-2 sm:col-span-1">
                  <p className="text-muted-foreground">Entropy</p>
                  <p className="font-mono font-semibold">~{entropyBits} bits</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Security Strength
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold uppercase inline-flex items-center gap-1.5',
                      strength.textColor,
                    )}
                  >
                    <StrengthIcon className="h-4 w-4" />
                    {strength.label}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-500 rounded-full', strength.color)}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{strength.message}</p>
              </div>
            </div>
          </ToolLayout.Panel>

          <ToolLayout.Panel title="Quick Guidance">
            <div className="rounded-lg border border-border/70 bg-muted/25 px-4 py-3 text-xs text-muted-foreground space-y-1.5">
              <p>Use 16+ characters for most accounts and 24+ for critical services.</p>
              <p>Keep all character sets enabled for the highest entropy.</p>
              <p>Store generated credentials in a password manager.</p>
            </div>
          </ToolLayout.Panel>
        </div>

        <div className="lg:col-span-2">
          <ToolLayout.Panel title="Customize Options">
            <div className="space-y-7">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="password-length" className="text-sm font-semibold">
                    Character Length
                  </label>
                  <div className="h-10 min-w-10 px-3 rounded-lg border border-primary/30 bg-primary/10 inline-flex items-center justify-center text-sm font-mono font-semibold text-primary">
                    {length}
                  </div>
                </div>
                <Slider
                  id="password-length"
                  min={4}
                  max={64}
                  step={1}
                  value={[length]}
                  onValueChange={([value]) => setLength(value)}
                />
                <div className="grid grid-cols-4 gap-2">
                  {[12, 16, 24, 32].map((preset) => (
                    <Button
                      key={preset}
                      variant={length === preset ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLength(preset)}
                      className="font-mono"
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/50" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Character Sets</p>
                  <span className="text-xs text-muted-foreground">{activeSetCount}/4 enabled</span>
                </div>

                {charsetOptions.map((option) => (
                  <label
                    key={option.key}
                    htmlFor={`charset-${option.key}`}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-lg border px-3 py-3 transition-colors',
                      option.checked
                        ? 'border-primary/35 bg-primary/5'
                        : 'border-border/70 bg-background hover:bg-muted/35',
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono rounded border border-border/60 bg-muted/35 px-2 py-1 text-muted-foreground">
                        {option.sample}
                      </span>
                      <Switch
                        id={`charset-${option.key}`}
                        checked={option.checked}
                        onCheckedChange={(checked) => handleSetToggle(option.key, checked)}
                      />
                    </div>
                  </label>
                ))}
              </div>

              <div className="border-t border-border/50" />

              <div className="rounded-lg border border-border/70 bg-muted/25 px-3 py-2.5 text-xs text-muted-foreground">
                Password updates automatically when options change.
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generatePassword}
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Now
                  </Button>
                </div>
              </div>
            </div>
          </ToolLayout.Panel>
        </div>
      </div>
    </ToolLayout>
  );
};

export default PasswordGenerator;
