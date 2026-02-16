
import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, ShieldCheck, ShieldAlert } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    if (includeUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      setPassword('Select at least one option');
      return;
    }

    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(generated);
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    const activeOptions = [includeUpper, includeLower, includeNumbers, includeSymbols].filter(Boolean).length;
    if (length < 8 || activeOptions < 2) return { 
      label: 'Weak', color: 'bg-red-500', icon: <ShieldAlert className="w-4 h-4" />, textColor: 'text-red-500' };
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
            <Card className="border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
                <CardContent className="p-6 flex items-center justify-between gap-4">
                    <div className="font-mono text-xl md:text-2xl text-slate-800 dark:text-white break-all flex-1">
                        {password}
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => { generatePassword(); }}
                            title="Regenerate"
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </Button>
                        <Button
                            variant={copied ? "default" : "secondary"}
                            size="icon"
                            onClick={copy}
                            title="Copy"
                            className={copied ? "bg-green-600 hover:bg-green-700" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"}
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            <div className="flex items-center gap-3 px-1">
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-500 ${strength.color}`} 
                        style={{ width: `${Math.min((length / 32) * 100, 100)}%` }}
                    />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase ${strength.textColor}`}>
                    {strength.icon} {strength.label}
                </div>
            </div>
        </div>

        {/* Controls */}
        <ToolLayout.Section title="Configuration">
            <div className="p-6 space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-400">Password Length</label>
                        <span className="text-indigo-600 dark:text-indigo-400 font-mono text-lg font-bold">{length}</span>
                    </div>
                    <input 
                        type="range" 
                        min="4" 
                        max="64" 
                        value={length} 
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
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
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                            opt.checked 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/50' 
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                    >
                        <span className={`font-medium ${opt.checked ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                            {opt.label}
                        </span>
                        <input 
                            type="checkbox" 
                            checked={opt.checked}
                            onChange={(e) => opt.set(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
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
