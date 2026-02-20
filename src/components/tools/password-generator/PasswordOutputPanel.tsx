import React from 'react';
import { Eye, EyeOff, RefreshCw, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import ToolLayout from '../../ui/ToolLayout';
import { Button } from '../../ui/Button';
import { CopyButton } from '../../ui/CopyButton';
import { cn } from '../../../lib/utils';
import type { PasswordStrength } from '../../../lib/passwordStrength';

interface PasswordOutputPanelProps {
  password: string;
  previewPassword: string;
  revealPassword: boolean;
  length: number;
  characterPool: number;
  entropyBits: number;
  strength: PasswordStrength;
  onToggleReveal: () => void;
  onGenerate: () => void;
}

const PasswordOutputPanel: React.FC<PasswordOutputPanelProps> = ({
  password,
  previewPassword,
  revealPassword,
  length,
  characterPool,
  entropyBits,
  strength,
  onToggleReveal,
  onGenerate,
}) => {
  const StrengthIcon =
    strength.label === 'Strong'
      ? ShieldCheck
      : strength.label === 'Medium'
        ? Shield
        : ShieldAlert;

  return (
    <ToolLayout.Panel
      title="Generated Password"
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onToggleReveal}
            aria-label={revealPassword ? 'Hide password' : 'Show password'}
            title={revealPassword ? 'Hide password' : 'Show password'}
          >
            {revealPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="default" size="sm" onClick={onGenerate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate
          </Button>
          <CopyButton
            value={password}
            disabled={!password}
            onCopy={() => toast.success('Password copied')}
          />
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
  );
};

export default PasswordOutputPanel;
