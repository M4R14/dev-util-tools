import React from 'react';
import { Clock, ArrowLeftRight, ChevronDown, Calendar, Globe, MapPin } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CopyButton } from '../ui/CopyButton';
import { cn } from '../../lib/utils';
import { useTimezoneConverter } from '../../hooks/useTimezoneConverter';

const TimezoneConverter: React.FC = () => {
  const {
    date,
    setDate,
    sourceTz,
    setSourceTz,
    targetTz,
    setTargetTz,
    result,
    resultDatePart,
    resultTimePart,
    resultTzAbbr,
    swapTimezones,
    setNow,
    commonTimezones,
  } = useTimezoneConverter();

  return (
    <ToolLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Global Time Converter
            </h3>
            <p className="text-sm text-muted-foreground">
              Compare times across different cities and zones.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={setNow}
            className="gap-2 bg-background hover:bg-muted"
          >
            <Clock className="w-3.5 h-3.5" />
            Set to Now
          </Button>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
          {/* Source Panel */}
          <Card className="border-border shadow-sm group hover:border-primary/30 transition-colors">
            <CardHeader className="pb-2 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> From Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Select Date & Time</label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-14 text-lg font-mono bg-background"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none opacity-50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Source Timezone</label>
                <div className="relative">
                  <select
                    value={sourceTz}
                    onChange={(e) => setSourceTz(e.target.value)}
                    className={cn(
                      'flex h-12 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 appearance-none cursor-pointer hover:bg-muted/50 transition-colors',
                    )}
                  >
                    {commonTimezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Swap Trigger */}
          <div className="hidden lg:flex flex-col justify-center relative z-10 -mx-3">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border/50 -z-10" />
            <Button
              variant="outline"
              size="icon"
              onClick={swapTimezones}
              className="rounded-full shadow-md h-12 w-12 border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:scale-110"
              title="Swap Timezones"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </Button>
          </div>
          {/* Mobile Swap */}
          <div className="flex lg:hidden justify-center items-center py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={swapTimezones}
              className="gap-2 text-muted-foreground hover:text-primary"
            >
              <ArrowLeftRight className="w-4 h-4 rotate-90" /> Swap Direction
            </Button>
          </div>

          {/* Result Panel */}
          <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-background via-background to-primary/5 group hover:shadow-xl transition-all duration-300 ring-1 ring-primary/5">
            <CardHeader className="pb-2 border-b border-border/50 bg-primary/5">
              <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> To Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative flex flex-col justify-between">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-primary uppercase tracking-widest">
                      Converted Time
                    </label>
                    <CopyButton
                      value={result}
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                    />
                  </div>

                  <div className="relative group/input bg-primary/5 rounded-lg border border-primary/10 hover:border-primary/30 hover:bg-primary/10 transition-all duration-300">
                    <Input
                      readOnly
                      value={`${resultDatePart}T${resultTimePart}`}
                      className="text-xl sm:text-2xl h-14 font-mono font-bold text-primary tracking-tight border-none bg-transparent shadow-none focus-visible:ring-0 px-4 cursor-text selection:bg-primary/20 w-full"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/50 text-xs font-medium text-primary/80 backdrop-blur-sm">
                        <Globe className="w-3 h-3" />
                        <span>{resultTzAbbr}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-6 border-t border-border/40 mt-auto">
                <label className="text-xs font-semibold text-foreground">Target Timezone</label>
                <div className="relative">
                  <select
                    value={targetTz}
                    onChange={(e) => setTargetTz(e.target.value)}
                    className={cn(
                      'flex h-12 w-full items-center justify-between rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 appearance-none cursor-pointer hover:bg-background transition-colors',
                    )}
                  >
                    {commonTimezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Badge footer */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground border border-border/50">
            <Globe className="w-3.5 h-3.5" />
            <span>Supporting {commonTimezones.length} major global timezones</span>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default TimezoneConverter;
