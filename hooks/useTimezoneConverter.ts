import { useState, useMemo, useEffect } from 'react';

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

export const useTimezoneConverter = () => {
    const [date, setDate] = useState<string>(() => {
        const now = new Date();
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

    useEffect(() => {
        convertTime();
    }, [date, sourceTz, targetTz]);

    // Helper to create a Date object representing specific wall-clock time in a specific timezone
    const getDateFromTimezone = (year: number, month: number, day: number, hour: number, minute: number, timeZone: string): Date => {
        // Create a date assuming UTC first to get close
        let guess = new Date(Date.UTC(year, month, day, hour, minute));
        
        // Iteratively adjust to account for offset
        for (let i = 0; i < 3; i++) {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone,
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false
            }).formatToParts(guess);
            
            const getVal = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0', 10);
            
            // What time does 'guess' represent in the target timezone? 
            // We want to find a UTC moment that corresponds to the input wall clock time in sourceTz
            const observedInTzAsUtc = new Date(Date.UTC(
                getVal('year'), 
                getVal('month') - 1, 
                getVal('day'), 
                getVal('hour') === 24 ? 0 : getVal('hour'), 
                getVal('minute')
            ));
            
            const diff = guess.getTime() - observedInTzAsUtc.getTime();
            if (Math.abs(diff) < 1000) break; // Close enough
            guess = new Date(guess.getTime() + diff);
        }
        return guess;
    };


    const convertTime = () => {
        try {
            if (!date) return;

            const [datePart, timePart] = date.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hours, minutes] = timePart.split(':').map(Number);
            
            // This 'targetDate' is the actual point in time (UTC)
            const targetDate = getDateFromTimezone(year, month - 1, day, hours, minutes, sourceTz);
            
             // We need a numeric month for "same format"
            const numericFormatter = new Intl.DateTimeFormat('en-GB', {
                timeZone: targetTz,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZoneName: 'short'
            });
            const numericParts = numericFormatter.formatToParts(targetDate);
            const getNumPart = (type: string) => numericParts.find(p => p.type === type)?.value || '';

            const yyyy = getNumPart('year');
            const mm = getNumPart('month');
            const dd = getNumPart('day');
            const hh = getNumPart('hour');
            const min = getNumPart('minute');
            const tz = getNumPart('timeZoneName');

            // Format as ISO 8601-like (YYYY-MM-DDTHH:mm)
            const isoString = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
            setResult(`${isoString} ${tz}`); // For copy
            
            setResultDatePart(`${yyyy}-${mm}-${dd}`);
            setResultTimePart(`${hh}:${min}`);
            setResultTzAbbr(tz);

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

    const setNow = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        setDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    };

    return {
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
        commonTimezones: COMMON_TIMEZONES
    };
};
