import { z } from 'zod';

export interface ThaiIdAnalysis {
  sanitized: string;
  formatted: string;
  isValid: boolean;
  expectedChecksum: number;
  actualChecksum: number;
  personTypeDescription: string;
  provinceCode: string;
  districtCode: string;
  householdNumber: string;
  personNumber: string;
}

export interface ThaiIdPersonType {
  digit: string;
  description: string;
}

export interface ThaiIdStructureItem {
  range: string;
  meaning: string;
}

export interface GenerateThaiIdOptions {
  personTypeDigit?: string;
}

const THAI_ID_LENGTH = 13;
const THAI_ID_BODY_LENGTH = 12;
const THAI_ID_GROUPS = [1, 4, 5, 2, 1] as const;
const thaiIdBodySchema = z.string().regex(/^\d{12}$/);
const thaiIdSchema = z.string().regex(/^\d{13}$/);

const PERSON_TYPE_MAP: Record<string, string> = {
  '1': 'คนที่มีสัญชาติไทยและแจ้งเกิดในเวลากำหนด',
  '2': 'คนที่มีสัญชาติไทยแต่แจ้งเกิดเกินเวลาที่กำหนด',
  '3': 'คนไทยหรือคนต่างด้าวและมีชื่ออยู่ในทะเบียนบ้านก่อน 31/05/2527',
  '4': 'คนไทยหรือคนต่างด้าวที่มีใบสำคัญคนต่างด้าว แต่แจ้งย้ายเข้าโดยไม่มีเลขบัตร',
  '5': 'คนที่เพิ่มเข้าไปภายหลัง อาจเพราะตกสำรวจหรือสาเหตุอื่น',
  '6': 'คนที่เข้าเมืองโดยไม่ถูกกฎหมาย หรือถูกกฎหมายแต่เป็นสถานะชั่วคราว',
  '7': 'ลูกของคนในประเภท 6',
  '8': 'คนต่างด้าวที่ได้รับสัญชาติไทยอย่างถูกกฎหมาย',
};

export const THAI_ID_PERSON_TYPES: ThaiIdPersonType[] = [
  { digit: '1', description: PERSON_TYPE_MAP['1'] },
  { digit: '2', description: PERSON_TYPE_MAP['2'] },
  { digit: '3', description: PERSON_TYPE_MAP['3'] },
  { digit: '4', description: PERSON_TYPE_MAP['4'] },
  { digit: '5', description: PERSON_TYPE_MAP['5'] },
  { digit: '6', description: PERSON_TYPE_MAP['6'] },
  { digit: '7', description: PERSON_TYPE_MAP['7'] },
  { digit: '8', description: PERSON_TYPE_MAP['8'] },
];

export const THAI_ID_STRUCTURE: ThaiIdStructureItem[] = [
  {
    range: 'หลักที่ 1',
    meaning: 'ระบุประเภทของบุคคล (1-8)',
  },
  {
    range: 'หลักที่ 2-5',
    meaning: 'ระบุสถานที่เกิด (2-3 คือจังหวัด, 4-5 คืออำเภอ)',
  },
  {
    range: 'หลักที่ 6-10',
    meaning: 'ระบุเลขในทะเบียนบ้าน',
  },
  {
    range: 'หลักที่ 11-12',
    meaning: 'ระบุลำดับการเกิดในบุคคลประเภทนั้นๆ',
  },
  {
    range: 'หลักที่ 13',
    meaning: 'หลักตรวจสอบความถูกต้อง (Checksum)',
  },
];

export const sanitizeThaiIdInput = (value: string): string => value.replace(/\D/g, '');

export const formatThaiId = (value: string): string => {
  const digits = sanitizeThaiIdInput(value).slice(0, THAI_ID_LENGTH);
  if (!digits) return '';

  const segments: string[] = [];
  let cursor = 0;

  THAI_ID_GROUPS.forEach((size) => {
    const segment = digits.slice(cursor, cursor + size);
    if (segment) {
      segments.push(segment);
      cursor += size;
    }
  });

  return segments.join('-');
};

export const calculateThaiIdChecksum = (firstTwelveDigits: string): number => {
  if (!thaiIdBodySchema.safeParse(firstTwelveDigits).success) {
    throw new Error('Thai ID checksum requires exactly 12 digits');
  }

  const sum = firstTwelveDigits
    .split('')
    .reduce((acc, char, index) => acc + Number(char) * (13 - index), 0);

  return (11 - (sum % 11)) % 10;
};

export const generateThaiId = (options: GenerateThaiIdOptions = {}): string => {
  const availablePersonTypes = Object.keys(PERSON_TYPE_MAP);
  const selectedPersonType = options.personTypeDigit && availablePersonTypes.includes(options.personTypeDigit)
    ? options.personTypeDigit
    : availablePersonTypes[Math.floor(Math.random() * availablePersonTypes.length)];

  const firstTwelveDigits = `${selectedPersonType}${Array.from({ length: 11 }, () =>
    Math.floor(Math.random() * 10).toString(),
  ).join('')}`;

  const checksumDigit = calculateThaiIdChecksum(firstTwelveDigits);
  return `${firstTwelveDigits}${checksumDigit}`;
};

export const analyzeThaiId = (input: string): ThaiIdAnalysis => {
  const sanitized = sanitizeThaiIdInput(input);

  if (!sanitized) {
    throw new Error('Please enter a Thai ID number');
  }

  if (!thaiIdSchema.safeParse(sanitized).success) {
    throw new Error('Thai ID must contain exactly 13 digits');
  }

  const body = sanitized.slice(0, THAI_ID_BODY_LENGTH);
  const actualChecksum = Number(sanitized[12]);
  const expectedChecksum = calculateThaiIdChecksum(body);

  const personTypeDigit = sanitized[0];

  return {
    sanitized,
    formatted: formatThaiId(sanitized),
    isValid: actualChecksum === expectedChecksum,
    expectedChecksum,
    actualChecksum,
    personTypeDescription: PERSON_TYPE_MAP[personTypeDigit] ?? 'ไม่พบคำอธิบายประเภทของบุคคลสำหรับเลขหลักแรกนี้',
    provinceCode: sanitized.slice(1, 3),
    districtCode: sanitized.slice(3, 5),
    householdNumber: sanitized.slice(5, 10),
    personNumber: sanitized.slice(10, 12),
  };
};
