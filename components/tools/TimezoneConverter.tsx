import React, { useState, useEffect } from 'react';
import { Clock, Copy, Check, ArrowLeftRight, Calendar, Globe } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';

const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Universal Time Coordinated)', abbr: 'UTC' },
  { value: 'Asia/Bangkok', label: 'Bangkok (Indochina Time)', abbr: 'ICT' },
  { value: 'Asia/Tokyo', label: 'Tokyo (Japan Standard Time)', abbr: 'JST' },
  { value: 'Asia/Seoul', label: 'Seoul (Korea Standard Time)', abbr: 'KST' },
  { value: 'Asia/Singapore', label: 'Singapore (Singapore Time)', abbr: 'SGT' },
  { value: 'Asia/Shanghai', label: 'Shanghai (China Standard Time)', abbr: 'CST' },
  { value: 'Asia/Kolkata', label: 'Kolkata (India Standard Time)', abbr: 'IST' },
  { value: 'Australia/Sydney', label: 'Sydney (Eastern Australia)', abbr: 'AEDT' },
  { value: 'Europe/London', label: 'London (Greenwich Mean Time)', abbr: 'GMT/BST' },
  { value: 'Europe/Paris', label: 'Paris (Central European Time)', abbr: 'CET' },
  { value: 'Europe/Berlin', label: 'Berlin (Central European Time)', abbr: 'CET' },
  { value: 'Europe/Moscow', label: 'Moscow (Moscow Standard Time)', abbr: 'MSK' },
  { value: 'America/New_York', label: 'New York (Eastern Time)', abbr: 'ET' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time)', abbr: 'PT' },
  { value: 'America/Chicago', label: 'Chicago (Central Time)', abbr: 'CT' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (Brasilia Time)', abbr: 'BRT' },
  { value: 'Pacific/Auckland', label: 'Auckland (New Zealand Time)', abbr: 'NZDT' },
];

const TimezoneConverter: React.FC = () => {
  // Default to current time, local timezone, and UTC as target
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    // Format for datetime-local input: YYYY-MM-DDThh:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  const [sourceTz, setSourceTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [targetTz, setTargetTz] = useState<string>('UTC');
  const [result, setResult] = useState<string>('');
  const [resultDatePart, setResultDatePart] = useState<string>('');
  const [resultTimePart, setResultTimePart] = useState<string>('');
  const [resultTzAbbr, setResultTzAbbr] = useState<string>('');
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    convertTime();
  }, [date, sourceTz, targetTz]);

  const convertTime = () => {
    try {
      if (!date) return;

      const [datePart, timePart] = date.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      const targetDate = getDateFromTimezone(year, month - 1, day, hours, minutes, sourceTz);
      
      // Detailed parts formatting
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: targetTz,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short'
      });

      const parts = formatter.formatToParts(targetDate);
      const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
      
      // Full formatting for copy
      const formattedDate = `${getPart('year')}-${parts.find(p=>p.type==='month')?.value.slice(0,3)}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}:${getPart('second')} ${getPart('timeZoneName')}`;
      setResult(formattedDate);

      // UI Parts
      setResultDatePart(`${getPart('weekday')}, ${getPart('day')} ${getPart('month')} ${getPart('year')}`);
      setResultTimePart(`${getPart('hour')}:${getPart('minute')}`);
      setResultTzAbbr(getPart('timeZoneName'));

    } catch (error) {
      console.error(error);
      setResult('Invalid Date');
    }
  };

  const swapTimezones = () => {
    const temp = sourceTz;
    setSourceTz(targetTz);
    setTargetTz(temp);
  };

  // Helper to create a Date object representing specific wall-clock time in a specific timezone
  const getDateFromTimezone = (year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date => {
    let guess = new Date(Date.UTC(year, month, day, hour, minute));
    for (let i = 0; i < 3; i++) {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        }).formatToParts(guess);
        
        const getVal = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0', 10);
        const observedInTzAsUtc = new Date(Date.UTC(getVal('year'), getVal('month') - 1, getVal('day'), getVal('hour') === 24 ? 0 : getVal('hour'), getVal('minute')));
        const diff = guess.getTime() - observedInTzAsUtc.getTime();
        if (diff === 0) break;
        guess = new Date(guess.getTime() + diff);
    }
    return guess;
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  const setNow = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  return (
    <ToolLayout>
      <div className="space-y-6">
        <div className="flex justify-end">
            <Button 
                variant="outline"
                size="sm"
                onClick={setNow}
                className="gap-2"
            >
                <Clock className="w-3.5 h-3.5" />
                Reset to Now
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          
          {/* Source Panel */}
          <Card>
            <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date & Time</label>
                    <Input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Source Timezone</label>
                    <div className="relative">
                        <select
                            value={sourceTz}
                            onChange={(e) => setSourceTz(e.target.value)}
                            className={cn(
                                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                            )}
                        >
                            {COMMON_TIMEZONES.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                             <ChevronDownIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>

          {/* Swap Trigger */}
          <div className="flex justify-center -my-2 lg:my-0 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={swapTimezones}
              className="rounded-full shadow-lg"
              title="Swap Timezones"
            >
              <ArrowLeftRight className="w-5 h-5 lg:rotate-0 rotate-90" />
            </Button>
          </div>

          {/* Result Panel */}
          <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
            <CardContent className="p-6 relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost" 
                        size="icon"
                        onClick={copyToClipboard}
                        className="h-8 w-8"
                        title="Copy full date"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>

                <div className="mb-6 space-y-1">
                    <label className="text-xs font-medium text-primary/70 uppercase tracking-wider">Converted Time</label>
                    <div className="text-3xl md:text-3xl font-mono font-bold text-foreground tracking-tight flex flex-wrap items-baseline gap-2 md:gap-3">
                        {resultTimePart}
                        <span className="text-lg md:text-xl font-sans font-medium text-primary">{resultTzAbbr}</span>
                    </div>
                    <div className="text-muted-foreground font-medium">
                        {resultDatePart}
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Timezone</label>
                    <div className="relative">
                        <select
                            value={targetTz}
                            onChange={(e) => setTargetTz(e.target.value)}
                            className={cn(
                                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                            )}
                        >
                            {COMMON_TIMEZONES.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                            <ChevronDownIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>

        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-muted-foreground text-xs">
           Displaying conversion from <span className="text-primary font-medium">{COMMON_TIMEZONES.find(t=>t.value===sourceTz)?.abbr || sourceTz }</span> to <span className="text-primary font-medium">{COMMON_TIMEZONES.find(t=>t.value===targetTz)?.abbr || targetTz}</span>
        </div>

      </div>
    </ToolLayout>
  );
};
// Helper Icon
const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
)

export default TimezoneConverter;
