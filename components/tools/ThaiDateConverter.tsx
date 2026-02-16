
import React, { useEffect, useState } from 'react';
import { Calendar, RotateCcw, ArrowRightLeft, Search, Info, Check, Copy } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { useThaiDateConverter } from '../../hooks/useThaiDateConverter';
import { cn } from '../../lib/utils';

const ThaiDateConverter: React.FC = () => {
    const {
        date,
        setDate,
        parseInput,
        setParseInput,
        formats,
        parseResult
    } = useThaiDateConverter();

  return (
    <ToolLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Converter Section */}
        <ToolLayout.Section title="Date Converter">
            <Card className="border-border shadow-sm">
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
                            Enter Date (A.D.)
                        </label>
                        <div className="flex gap-4">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-12 text-lg"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDate(new Date().toISOString().split('T')[0])}
                                className="h-12 w-12 shrink-0"
                                title="Today"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                         {formats.map((format, index) => (
                             <div 
                                key={index} 
                                className="group relative bg-muted/30 hover:bg-muted/60 p-3 rounded-lg border border-transparent hover:border-border transition-all"
                             >
                                <div className="text-xs text-muted-foreground mb-1 font-medium">{format.label}</div>
                                <div className="font-mono text-base md:text-lg text-primary pr-8 break-words">
                                    {format.value}
                                </div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CopyButton value={format.value} className="h-8 w-8" />
                                </div>
                             </div>
                         ))}
                    </div>
                </CardContent>
            </Card>
        </ToolLayout.Section>

        {/* Parser Section */}
        <ToolLayout.Section title="Thai Date Parser">
            <Card className="border-border shadow-sm h-full">
                <CardContent className="p-6 space-y-6">
                     <div className="space-y-4">
                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
                            Parse Thai Date
                        </label>
                        <div className="relative">
                            <Input
                                value={parseInput}
                                onChange={(e) => setParseInput(e.target.value)}
                                placeholder="e.g. 1 ม.ค. 2567, 12 สิงหา 60"
                                className="h-12 text-lg pl-11"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" />
                            Supports various text formats: "1 มค 67", "12/08/2560"
                        </p>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                            <div className="bg-background px-2 text-muted-foreground rotate-90 md:rotate-0">
                                <ArrowRightLeft className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="border-t border-border mt-8 mb-8" />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider block">
                            Result (ISO 8601)
                        </label>
                        
                        <div className={cn(
                            "p-6 rounded-xl border-2 transition-all flex items-center justify-between",
                            parseResult 
                                ? "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300"
                                : "bg-muted/30 border-dashed border-border text-muted-foreground"
                        )}>
                            {parseResult ? (
                                <>
                                    <div className="space-y-1">
                                        <div className="text-2xl font-mono font-bold">{parseResult.iso}</div>
                                        <div className="text-sm opacity-80">Formatted: {parseResult.formatted}</div>
                                    </div>
                                    <CopyButton 
                                        value={parseResult.iso} 
                                        className="h-10 w-10 hover:bg-green-500/20 text-green-700 dark:text-green-300" 
                                        iconClassName="w-5 h-5"
                                    />
                                </>
                            ) : (
                                <div className="text-center w-full py-2">
                                    {parseInput ? 'Invalid format' : 'Waiting for input...'}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </ToolLayout.Section>
      </div>
    </ToolLayout>
  );
};

export default ThaiDateConverter;
