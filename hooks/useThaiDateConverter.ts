import { useState, useMemo, useEffect } from 'react';

const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const thaiShortMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const thaiDays = [
    'อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'
];

const toThaiDigits = (num: number | string) => {
    const digits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
    return num.toString().split('').map(d => {
        const parsed = parseInt(d);
        return isNaN(parsed) ? d : digits[parsed];
    }).join('');
};

export const useThaiDateConverter = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [parseInput, setParseInput] = useState('');
    const [parseResult, setParseResult] = useState<{ iso: string; formatted: string } | null>(null);

    // Derived state for formatted dates (from `date`)
    const formats = useMemo(() => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return [];

        const day = d.getDate();
        const monthIndex = d.getMonth();
        const yearBE = d.getFullYear() + 543;
        const dayOfWeek = d.getDay();
        const yearAD = d.getFullYear();

        return [
            { label: 'Full Date (Official)', value: `วัน${thaiDays[dayOfWeek]}ที่ ${day} ${thaiMonths[monthIndex]} พ.ศ. ${yearBE}` },
            { label: 'Long Date', value: `${day} ${thaiMonths[monthIndex]} ${yearBE}` },
            { label: 'Short Date', value: `${day} ${thaiShortMonths[monthIndex]} ${yearBE}` },
            { label: 'Short Date (2-digit year)', value: `${day} ${thaiShortMonths[monthIndex]} ${yearBE.toString().slice(-2)}` },
            { label: 'Numerical (Slash)', value: `${day.toString().padStart(2, '0')}/${(monthIndex + 1).toString().padStart(2, '0')}/${yearBE}` },
            { label: 'ISO-like (Buddhist)', value: `${yearBE}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` },
            { label: 'Thai Digits', value: toThaiDigits(`วัน${thaiDays[dayOfWeek]}ที่ ${day} ${thaiMonths[monthIndex]} พ.ศ. ${yearBE}`) },
             // AD formats for reference
            { label: 'ISO Date (AD)', value: `${yearAD}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` },
        ];
    }, [date]);

    // Parsing effect
    useEffect(() => {
        if (!parseInput.trim()) {
            setParseResult(null);
            return;
        }

        const input = parseInput.trim();
        const parts = input.split(/[\s/.-]+/); 
        
        // Reset check
        let day: number | null = null;
        let month: number | null = null;
        let year: number | null = null;

        for (const part of parts) {
            const fullMonthIdx = thaiMonths.findIndex(m => m === part);
            if (fullMonthIdx !== -1) {
                month = fullMonthIdx;
                continue;
            }
            
            const shortMonthIdx = thaiShortMonths.findIndex(m => m === part || m === part + '.');
            if (shortMonthIdx !== -1) {
                month = shortMonthIdx;
                continue;
            }

            // Fix parseInt in map callback context
            // Correct logic to replace thai digits with arabic digits
            const arabicPart = part.replace(/[๐-๙]/g, d => '0123456789'['๐๑๒๓๔๕๖๗๘๙'.indexOf(d)] || d);
            const num = parseInt(arabicPart);
            
            if (!isNaN(num)) {
                if (num > 2500 || (num > 100 && num < 2500)) { // Buddhist year range heuristic
                    year = num;
                } else if (num > 0 && num <= 31 && day === null) {
                    day = num;
                } else if (num > 0 && num <= 12 && month === null) {
                    month = num - 1;
                } else if (year === null) {
                    year = num; // Fallback
                }
            }
        }

        if (day !== null && month !== null && year !== null) {
            const adYear = year > 2400 ? year - 543 : year;
            const d = new Date(adYear, month, day);
            
            if (!isNaN(d.getTime())) {
                setParseResult({
                    iso: d.toISOString().split('T')[0],
                    formatted: d.toLocaleDateString('en-CA') 
                });
            } else {
                setParseResult(null);
            }
        } else {
            setParseResult(null);
        }
    }, [parseInput]);

    return {
        date,
        setDate,
        parseInput,
        setParseInput,
        formats,
        parseResult
    };
};
