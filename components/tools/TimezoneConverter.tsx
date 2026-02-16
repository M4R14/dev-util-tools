import React, { useState, useEffect } from 'react';
import { Clock, Copy, Check, ArrowLeftRight, Calendar, Globe } from 'lucide-react';

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
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Timezone Converter</h2>
              <p className="text-slate-400 text-sm">Convert date and time across different timezones instantly</p>
            </div>
          </div>
          <button 
              onClick={setNow}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-all border border-slate-600 hover:border-slate-500 shadow-sm"
          >
              <Clock className="w-4 h-4" />
              Reset to Now
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
          
          {/* Source Panel */}
          <div className="space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
            <label className="flex items-center gap-2 text-sm font-medium text-blue-300 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              Input Time
            </label>
            
            <div className="relative">
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-700 hover:border-slate-600 rounded-lg px-4 py-3 text-slate-200 text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder-slate-500"
              />
            </div>
            
            <div className="relative">
              <select
                value={sourceTz}
                onChange={(e) => setSourceTz(e.target.value)}
                className="w-full appearance-none bg-slate-800 border-2 border-slate-700 hover:border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>

          {/* Swap Trigger */}
          <div className="flex justify-center -my-2 lg:my-0 z-10">
            <button 
              onClick={swapTimezones}
              className="p-3 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded-full shadow-lg border-4 border-slate-800 transition-all transform hover:scale-110 active:rotate-180"
              title="Swap Timezones"
            >
              <ArrowLeftRight className="w-5 h-5 lg:rotate-0 rotate-90" />
            </button>
          </div>

          {/* Result Panel */}
          <div className="space-y-4 bg-gradient-to-br from-blue-900/20 to-slate-900/50 p-6 rounded-xl border border-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button
                  onClick={copyToClipboard}
                  className="p-2 bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg shadow-sm border border-slate-700 transition-colors"
                  title="Copy full date"
               >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
               </button>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-emerald-300 uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              Converted Result
            </label>

            <div className="pt-2 pb-1">
               <div className="text-4xl md:text-5xl font-mono font-bold text-white tracking-tight flex items-baseline gap-3">
                  {resultTimePart}
                  <span className="text-lg md:text-xl font-sans font-medium text-blue-400">{resultTzAbbr}</span>
               </div>
               <div className="text-slate-400 font-medium mt-2">
                  {resultDatePart}
               </div>
            </div>

            <div className="relative pt-2">
              <select
                value={targetTz}
                onChange={(e) => setTargetTz(e.target.value)}
                className="w-full appearance-none bg-slate-800 border-2 border-slate-700 hover:border-slate-600 rounded-lg px-4 py-3 text-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pt-2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-slate-500 text-sm">
           Displaying conversion from <span className="text-blue-400 font-medium">{COMMON_TIMEZONES.find(t=>t.value===sourceTz)?.abbr || sourceTz }</span> to <span className="text-emerald-400 font-medium">{COMMON_TIMEZONES.find(t=>t.value===targetTz)?.abbr || targetTz}</span>
        </div>

      </div>
    </div>
  );
};

export default TimezoneConverter;
