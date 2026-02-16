import React from 'react';
import { Link2, Code, RotateCcw, Search, Hash, Globe, Lock, Trash2, Plus } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { CopyButton } from '../ui/CopyButton';
import { useUrlParser } from '../../hooks/useUrlParser';

const UrlParser: React.FC = () => {
    const {
        input,
        setInput,
        parsedUrl,
        error,
        params,
        encode,
        decode,
        updateParam
    } = useUrlParser();

    // Helper to handle parameter changes
    const handleParamChange = (index: number, key: string, value: string) => {
        updateParam(index, key, value);
    };

    const handleEncode = () => {
        if (encode()) {
            toast.success('URL encoded and copied to clipboard');
        } else {
            toast.error('Failed to encode URL');
        }
    };

    const handleDecode = () => {
        if (decode()) {
            toast.success('URL decoded');
        } else {
            toast.error('Failed to decode URL');
        }
    };

    const clearInput = () => {
        setInput('');
        toast.info('Cleared');
    };

    return (
        <ToolLayout>
            <div className="space-y-8">
                {/* Input Section */}
                <ToolLayout.Section 
                    title="Input URL"
                    actions={
                        <Button variant="ghost" size="sm" onClick={clearInput} className="h-8 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            Clear
                        </Button>
                    }
                >
                    <div className="space-y-4 p-6">
                        <div className="relative group">
                            <Textarea
                                placeholder="Paste your URL here..."
                                className="font-mono text-sm min-h-[120px] resize-y bg-background focus:ring-2 ring-primary/20 transition-all border-muted-foreground/20"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            {input && (
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CopyButton value={input} />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={handleEncode} className="hover:bg-primary hover:text-primary-foreground transition-all">
                                    <Code className="w-4 h-4 mr-2" />
                                    Encode
                                </Button>
                                <Button variant="secondary" size="sm" onClick={handleDecode} className="hover:bg-primary hover:text-primary-foreground transition-all">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Decode
                                </Button>
                            </div>
                            
                            {error && (
                                <div className="text-sm font-medium text-destructive flex items-center animate-in fade-in slide-in-from-left-2">
                                    <span className="w-2 h-2 rounded-full bg-destructive mr-2" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </ToolLayout.Section>

                {error === null && parsedUrl && (
                    <div className="grid gap-6 md:grid-cols-2 lg:h-[600px]">
                         {/* Path Info */}
                        <ToolLayout.Panel 
                            title="Components" 
                            className="bg-card/50"
                        >
                            <div className="space-y-6 pt-2 h-full overflow-y-auto pr-2">
                                <div className="grid gap-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Protocol</label>
                                            <div className="relative group">
                                                <Input 
                                                    readOnly 
                                                    value={parsedUrl.protocol} 
                                                    className="font-mono text-xs bg-muted/30 focus:bg-background h-9 border-primary/20" 
                                                />
                                                <div className="absolute right-2.5 top-2.5">
                                                    {parsedUrl.protocol === 'https:' ? 
                                                        <Lock className="w-3.5 h-3.5 text-emerald-500" /> : 
                                                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Port</label>
                                            <Input 
                                                readOnly 
                                                value={parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443' : '80')} 
                                                className="font-mono text-xs bg-muted/30 focus:bg-background h-9 border-primary/20" 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Host</label>
                                        <div className="flex gap-2 group relative">
                                            <Input 
                                                readOnly 
                                                value={parsedUrl.hostname} 
                                                className="font-mono text-xs bg-muted/30 focus:bg-background h-9 border-primary/20 pr-8" 
                                            />
                                            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <CopyButton value={parsedUrl.hostname} className="h-7 w-7" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Origin</label>
                                        <div className="relative group">
                                            <Input 
                                                readOnly 
                                                value={parsedUrl.origin} 
                                                className="font-mono text-xs bg-muted/30 focus:bg-background h-9 border-primary/20 pr-9" 
                                            />
                                            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <CopyButton value={parsedUrl.origin} className="h-7 w-7" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Path</label>
                                        <div className="flex gap-2 group relative">
                                            <Textarea 
                                                readOnly 
                                                value={parsedUrl.pathname} 
                                                className="font-mono text-xs bg-muted/30 focus:bg-background min-h-[38px] h-auto border-primary/20 resize-none py-2 pr-9" 
                                                rows={1}
                                            />
                                            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <CopyButton value={parsedUrl.pathname} className="h-7 w-7" />
                                            </div>
                                        </div>
                                    </div>

                                    {parsedUrl.hash && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hash</label>
                                            <div className="relative group">
                                                <Input 
                                                    readOnly 
                                                    value={parsedUrl.hash} 
                                                    className="font-mono text-xs bg-muted/30 focus:bg-background h-9 border-primary/20 pl-8 pr-9" 
                                                />
                                                <Hash className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground/50" />
                                                <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <CopyButton value={parsedUrl.hash} className="h-7 w-7" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ToolLayout.Panel>

                        {/* Query Params */}
                        <ToolLayout.Panel 
                            title={`Query Parameters (${params.length})`}
                            className="bg-card/50"
                        >
                            <div className="h-full flex flex-col pt-2">
                                {params.length > 0 ? (
                                    <div className="flex flex-col h-full"> 
                                        <div className="grid grid-cols-[1fr_2fr] gap-4 px-1 pb-2 border-b border-border/40 mb-4">
                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key</div>
                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value</div>
                                        </div>
                                        <div className="space-y-3 overflow-y-auto pr-2 flex-1 min-h-0">
                                            {params.map((param, index) => (
                                                <div key={index} className="grid grid-cols-[1fr_2fr] gap-4 items-start group">
                                                    <div>
                                                        <Input 
                                                            value={param.key} 
                                                            onChange={(e) => handleParamChange(index, e.target.value, param.value)}
                                                            className="font-mono text-xs bg-muted/50 focus:bg-background transition-colors"
                                                            placeholder="Key"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Textarea 
                                                            value={param.value} 
                                                            onChange={(e) => handleParamChange(index, param.key, e.target.value)}
                                                            className="font-mono text-xs min-h-[38px] bg-muted/50 focus:bg-background transition-colors resize-y"
                                                            placeholder="Value"
                                                            rows={1}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/80 space-y-4 rounded-lg bg-muted/20 border-2 border-dashed border-primary/10 m-4">
                                        <div className="p-3 bg-background rounded-full border border-primary/20 shadow-sm mb-2">
                                            <Search className="w-8 h-8 text-primary/50" />
                                        </div>
                                        <div className="text-center px-4">
                                            <p className="font-semibold text-foreground">No parameters</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                Add parameters to your URL and they will appear here automatically
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ToolLayout.Panel>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
};

export default UrlParser;