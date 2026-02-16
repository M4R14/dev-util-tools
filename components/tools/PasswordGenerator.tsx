import React from 'react';
import { RefreshCw, Check, ShieldCheck, ShieldAlert } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { usePasswordGenerator } from '../../hooks/usePasswordGenerator';

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
        generatePassword
    } = usePasswordGenerator();

  const getStrength = () => {
    const activeOptions = [includeUpper, includeLower, includeNumbers, includeSymbols].filter(Boolean).length;
    if (length < 8 || activeOptions < 2) return { 
      label: 'Weak', color: 'bg-destructive', icon: <ShieldAlert className="w-4 h-4" />, textColor: 'text-destructive' };
    if (length < 12 || activeOptions < 3) return { 
      label: 'Medium', color: 'bg-yellow-500', icon: <ShieldAlert className="w-4 h-4" />, textColor: 'text-yellow-500'
    };
    return { 
      label: 'Strong', color: 'bg-green-500', icon: <ShieldCheck className="w-4 h-4" />, textColor: 'text-green-500'
    };
  };

  const strength = getStrength();

  return (
    <ToolLayout className="max-w-3xl mx-auto">
      <div className="space-y-6">
        {/* Result Area */}
        <div className="space-y-2">
            <Card className="border-2 border-border hover:border-primary transition-colors">
                <CardContent className="p-6 flex items-center justify-between gap-4">
                    <div className="font-mono text-xl md:text-2xl text-foreground break-all flex-1">
                        {password || <span className="text-muted-foreground italic">Select at least one option</span>}
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex items-center gap-3 px-1">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                   <div 
                        className={`h-full transition-all duration-500 ${strength.color}`} 
                        style={{ width: `${Math.min((length / 32) * 100, 100)}%` }}
                    />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase ${strength.textColor}`}>
                    {strength.icon}
                    {strength.label}
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
                <Button
                    variant="secondary"
                    onClick={generatePassword}
                    title="Regenerate"
                    className="bg-muted hover:bg-muted/80"
                >
                    <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                </Button>
                <CopyButton value={password} className="bg-muted hover:bg-muted/80" />
            </div>
        </div>
                    {strength.icon} {strength.label}
                </div>
            </div>
        </div>

        {/* Controls */}
        <ToolLayout.Section title="Configuration">
            <div className="p-6 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-foreground">Password Length</label>
                        <span className="text-primary font-mono text-lg font-bold">{length}</span>
                    </div>
                    <input 
                        type="range" 
                        min="4" 
                        max="64" 
                        value={length} 
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { id: 'upper', label: 'Uppercase (A-Z)', checked: includeUpper, set: setIncludeUpper },
                    { id: 'lower', label: 'Lowercase (a-z)', checked: includeLower, set: setIncludeLower },
                    { id: 'numbers', label: 'Numbers (0-9)', checked: includeNumbers, set: setIncludeNumbers },
                    { id: 'symbols', label: 'Symbols (!@#)', checked: includeSymbols, set: setIncludeSymbols },
                ].map((opt) => (
                    <label 
                        key={opt.id}
                        className={cn("flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                            opt.checked 
                                ? "bg-primary/10 border-primary/20" 
                                : "bg-card border-border hover:border-border/80"
                        )}
                    >
                        <span className={cn("font-medium", opt.checked ? "text-primary" : "text-muted-foreground")}>
                            {opt.label}
                        </span>
                        <input 
                            type="checkbox" 
                            checked={opt.checked}
                            onChange={(e) => opt.set(e.target.checked)}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                    </label>
                ))}
                </div>
            </div>
        </ToolLayout.Section>
      </div>
    </ToolLayout>
  );
};

export default PasswordGenerator;
