import React from 'react';
import { ArrowLeftRight, Calendar, ChevronDown, Clock, Globe, MapPin } from 'lucide-react';
import ToolLayout from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CopyButton } from '../ui/CopyButton';
import { cn } from '../../lib/utils';
import { useTimezoneConverter } from '../../hooks/useTimezoneConverter';

const QUICK_TARGET_ZONE_IDS = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
  'Asia/Bangkok',
  'Australia/Sydney',
];

type TimezoneOption = {
  value: string;
  label: string;
  abbr: string;
};

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

  const timezoneOptions = React.useMemo<TimezoneOption[]>(() => {
    const map = new Map(commonTimezones.map((tz) => [tz.value, tz]));

    if (!map.has(sourceTz)) {
      map.set(sourceTz, {
        value: sourceTz,
        label: sourceTz,
        abbr: sourceTz,
      });
    }

    if (!map.has(targetTz)) {
      map.set(targetTz, {
        value: targetTz,
        label: targetTz,
        abbr: targetTz,
      });
    }

    return Array.from(map.values());
  }, [commonTimezones, sourceTz, targetTz]);

  const sourceOption = timezoneOptions.find((tz) => tz.value === sourceTz);
  const targetOption = timezoneOptions.find((tz) => tz.value === targetTz);

  const quickTargetOptions = React.useMemo(
    () =>
      QUICK_TARGET_ZONE_IDS.map((id) => timezoneOptions.find((tz) => tz.value === id)).filter(
        (tz): tz is TimezoneOption => !!tz,
      ),
    [timezoneOptions],
  );

  const hasValidResult = result !== '' && result !== 'Invalid Date' && resultDatePart && resultTimePart;
  const sourceDateTime = date ? date.replace('T', ' ') : '--';
  const convertedDateTime = hasValidResult ? `${resultDatePart} ${resultTimePart}` : '--';

  const selectClassName = cn(
    'flex h-11 w-full items-center rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 appearance-none cursor-pointer',
    'hover:bg-muted/35 transition-colors',
  );

  return (
    <ToolLayout className="max-w-6xl mx-auto">
      <div className="space-y-5">
        <ToolLayout.Panel
          title="Global Time Converter"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={setNow} className="gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Set now
              </Button>
              <Button variant="outline" size="sm" onClick={swapTimezones} className="gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Swap
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
            <div className="rounded-xl border border-border/70 bg-background p-4 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">Source</h4>
                <span className="text-xs text-muted-foreground">{sourceOption?.abbr ?? sourceTz}</span>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tz-date" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Date & Time
                </label>
                <div className="relative">
                  <Input
                    id="tz-date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11 pr-10 font-mono"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="source-tz" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Source Timezone
                </label>
                <div className="relative">
                  <select
                    id="source-tz"
                    value={sourceTz}
                    onChange={(e) => setSourceTz(e.target.value)}
                    className={selectClassName}
                    aria-label="Source timezone"
                  >
                    {timezoneOptions.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Source Preview</p>
                <p className="font-mono text-sm break-all text-foreground/90">{sourceDateTime}</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center">
              <button
                type="button"
                onClick={swapTimezones}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors"
                aria-label="Swap source and target timezones"
                title="Swap source and target timezones"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-background via-background to-primary/5 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold">Target</h4>
                <span className="text-xs text-primary/90">{targetOption?.abbr ?? targetTz}</span>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="target-tz" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Target Timezone
                </label>
                <div className="relative">
                  <select
                    id="target-tz"
                    value={targetTz}
                    onChange={(e) => setTargetTz(e.target.value)}
                    className={selectClassName}
                    aria-label="Target timezone"
                  >
                    {timezoneOptions.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-[11px] uppercase tracking-wide text-primary/80">Converted Result</p>
                  <CopyButton value={hasValidResult ? result : ''} disabled={!hasValidResult} className="h-7 w-7" />
                </div>
                <p className="font-mono text-lg sm:text-xl font-semibold text-primary break-all">{convertedDateTime}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {hasValidResult ? `${resultTzAbbr} (${targetTz})` : 'Pick valid date and timezone values'}
                </p>
              </div>
            </div>
          </div>
        </ToolLayout.Panel>

        <ToolLayout.Panel
          title="Quick Target Zones"
          actions={
            <span className="inline-flex items-center rounded-md border border-border/70 bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
              {commonTimezones.length} supported zones
            </span>
          }
        >
          <div className="flex flex-wrap gap-2">
            {quickTargetOptions.map((tz) => (
              <Button
                key={tz.value}
                variant={targetTz === tz.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTargetTz(tz.value)}
                className="font-mono"
              >
                {tz.abbr}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Tip: use quick targets for frequent zones, then fine-tune from the full timezone list.
          </p>
        </ToolLayout.Panel>
      </div>
    </ToolLayout>
  );
};

export default TimezoneConverter;
