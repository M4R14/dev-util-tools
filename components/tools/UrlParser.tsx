import React, { useState } from 'react';
import { Link2, Code, RotateCcw, Copy, ExternalLink, Search, Hash, Globe, Lock } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { CopyButton } from '../ui/CopyButton';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const UrlParser: React.FC = () => {
    const [input, setInput] = useState('');
    const [parsedUrl, setParsedUrl] = useState<URL | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInput(value);

        if (!value.trim()) {
            setParsedUrl(null);
            setError(null);
            return;
        }

        try {
            const url = new URL(value);
            setParsedUrl(url);
            setError(null);
        } catch (err) {
            // Try adding protocol if missing
            try {
                if (!value.match(/^[a-zA-Z]+:\/\//)) {
                    const url = new URL('https://' + value);
                    setParsedUrl(url); // We parse it as https, but warn?
                    setError(null);
                } else {
                    setParsedUrl(null);
                    setError("Invalid URL format");
                }
            } catch {
                setParsedUrl(null);
                setError("Invalid URL format");
            }
        }
    };

    const encode = () => {
        try {
            const encoded = encodeURIComponent(input);
            navigator.clipboard.writeText(encoded);
            toast.success("Encoded URL copied to clipboard");
        } catch (err) {
            toast.error("Failed to encode");
        }
    };

    const decode = () => {
        try {
            const decoded = decodeURIComponent(input);
            setInput(decoded);
            handleInputChange({ target: { value: decoded } } as React.ChangeEvent<HTMLTextAreaElement>);
            toast.success("Decoded URL applied");
        } catch (err) {
            toast.error("Failed to decode");
        }
    };

    const formatParams = (searchParams: URLSearchParams) => {
        const params: { key: string; value: string }[] = [];
        searchParams.forEach((value, key) => {
            params.push({ key, value });
        });
        return params;
    };

    return (
        <ToolLayout className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Input Section */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-border/60 shadow-sm">
                         <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Link2 className="w-4 h-4 text-primary" />
                                    Input URL
                                </label>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={encode} disabled={!input}>
                                        Encode
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={decode} disabled={!input}>
                                        Decode
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setInput('');
                                        setParsedUrl(null);
                                        setError(null);
                                    }} disabled={!input}>
                                        <RotateCcw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <Textarea 
                                placeholder="https://example.com/path?query=123"
                                className="font-mono text-sm min-h-[100px]"
                                value={input}
                                onChange={handleInputChange}
                            />
                            {error && (
                                <p className="text-sm text-red-500 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    {error}
                                </p>
                            )}
                         </CardContent>
                    </Card>
                </div>

                {parsedUrl && (
                    <>
                        {/* URL Components */}
                        <div className="lg:col-span-1 space-y-4">
                             <div className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                Components
                            </div>
                            
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Protocol</label>
                                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded border border-border">
                                            {parsedUrl.protocol === 'https:' ? <Lock className="w-3 h-3 text-emerald-500" /> : <Globe className="w-3 h-3 text-amber-500" />}
                                            <code className="text-sm">{parsedUrl.protocol}</code>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Hostname</label>
                                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border group">
                                            <code className="text-sm truncate" title={parsedUrl.hostname}>{parsedUrl.hostname}</code>
                                            <CopyButton value={parsedUrl.hostname} className="h-6 w-6 opacity-0 group-hover:opacity-100" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Port</label>
                                        <div className="p-2 bg-muted/50 rounded border border-border">
                                            <code className="text-sm">{parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443' : '80')}</code>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Pathname</label>
                                        <div className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border group">
                                            <code className="text-sm truncate" title={parsedUrl.pathname}>{parsedUrl.pathname}</code>
                                            <CopyButton value={parsedUrl.pathname} className="h-6 w-6 opacity-0 group-hover:opacity-100" />
                                        </div>
                                    </div>
                                    {parsedUrl.hash && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Hash</label>
                                            <div className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border group">
                                                <code className="text-sm truncate" title={parsedUrl.hash}>{parsedUrl.hash}</code>
                                                <CopyButton value={parsedUrl.hash} className="h-6 w-6 opacity-0 group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Query Params */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                                Query Parameters
                            </div>
                            
                            <Card className="h-full">
                                <CardContent className="p-0">
                                    {Array.from(parsedUrl.searchParams).length > 0 ? (
                                        <div className="divide-y divide-border">
                                            <div className="grid grid-cols-12 bg-muted/30 p-3 text-xs font-medium text-muted-foreground">
                                                <div className="col-span-4">Key</div>
                                                <div className="col-span-8">Value</div>
                                            </div>
                                            {formatParams(parsedUrl.searchParams).map((param, idx) => (
                                                <div key={idx} className="grid grid-cols-12 p-3 text-sm hover:bg-muted/20 transition-colors group items-start">
                                                    <div className="col-span-4 font-mono break-all pr-2 text-primary/80 pt-1">
                                                        {param.key}
                                                    </div>
                                                    <div className="col-span-8 font-mono break-all text-foreground/80 flex items-start justify-between gap-2">
                                                        <span>{param.value}</span>
                                                        <CopyButton value={param.value} className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground/50">
                                            <Search className="w-12 h-12 mb-3 opacity-20" />
                                            <p className="text-sm">No query parameters found</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </ToolLayout>
    );
};

export default UrlParser;
