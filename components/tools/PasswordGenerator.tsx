
import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Check, ShieldCheck, ShieldAlert } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';

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
    if (length < 8 || activeOptions < 2) return { label: 'Weak', color: 'bg-red-500', icon: <ShieldAlert className="w-4 h-4" /> };
    if (length < 12 || activeOptions < 3) return { label: 'Medium', color: 'bg-yellow-500', icon: <ShieldAlert className="w-4 h-4" /> };
    return { label: 'Strong', color: 'bg-green-500', icon: <ShieldCheck className="w-4 h-4" /> };
  };

  const strength = getStrength();

  return (
    <ToolLayout className="max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Result Area */}
        <div className="relative group">
            <div className="bg-slate-950 p-6 rounded-2xl border-2 border-slate-800 group-hover:border-indigo-500 transition-all flex items-center justify-between">
            <div className="font-mono text-xl md:text-2xl text-white break-all pr-12">
                {password}
            </div>
            <div className="absolute right-4 flex gap-2">
                <button 
                    onClick={generatePassword} 
                    className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-900/50 hover:bg-slate-800 rounded-lg"
                    title="Regenerate"
                >
                <RefreshCw className="w-5 h-5" />
                </button>
                <button 
                    onClick={copy} 
                    className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-600 text-white' : 'bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-white'}`}
                    title="Copy"
                >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
            </div>
            </div>
            
            <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: `${Math.min((length / 32) * 100, 100)}%` }}></div>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase ${strength.color.replace('bg-', 'text-')}`}>
                {strength.icon} {strength.label}
            </div>
            </div>
        </div>

        {/* Controls */}
        <ToolLayout.Section title="Configuration">
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-400">Password Length</label>
                    <span className="text-indigo-400 font-mono text-lg font-bold">{length}</span>
                </div>
                <input 
                    type="range" 
                    min="4" 
                    max="64" 
                    value={length} 
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                    { id: 'upper', label: 'Uppercase (A-Z)', checked: includeUpper, set: setIncludeUpper },
                    { id: 'lower', label: 'Lowercase (a-z)', checked: includeLower, set: setIncludeLower },
                    { id: 'numbers', label: 'Numbers (0-9)', checked: includeNumbers, set: setIncludeNumbers },
                    { id: 'symbols', label: 'Symbols (!@#)', checked: includeSymbols, set: setIncludeSymbols },
                ].map(opt => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group bg-slate-900/50 p-3 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-colors">
                    <div className="relative flex items-center justify-center">
                        <input 
                        type="checkbox" 
                        checked={opt.checked} 
                        onChange={() => opt.set(!opt.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded bg-slate-800 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer" 
                        />
                         <Check className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                    </div>
                    <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors select-none">{opt.label}</span>
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
