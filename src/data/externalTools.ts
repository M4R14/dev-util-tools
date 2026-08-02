import {
  CalendarDays,
  Car,
  Clock,
  Code2,
  Factory,
  FileText,
  Hash,
  Image as ImageIcon,
  ListChecks,
  Palette,
  RotateCw,
  Ruler,
  ScanBarcode,
  ShieldCheck,
  Type,
  Variable,
  Wand2,
} from 'lucide-react';
import type { ExternalToolSpec } from '../components/tools/ExternalToolPage';

/**
 * Content for every external-tool landing page. Adding an external tool means adding an
 * entry here plus the usual registry wiring — see `.ai/docs/05-adding-new-tool.md`.
 */

const DUMMYIMAGE_BASE_URL = 'https://dummyimage.com/';

export const WORD_COUNTER_SPEC: ExternalToolSpec = {
  accent: 'emerald',
  heroIcon: FileText,
  badgeIcon: Hash,
  brand: 'WordCounter',
  blurb:
    'Online writing metrics for words, characters, reading time, and keyword density. Useful for SEO, social content, and article drafting.',
  url: 'https://wordcounter.net/',
  ctaLabel: 'Open WordCounter',
  guide: {
    title: 'What It Measures',
    kind: 'rows',
    icon: Type,
    rows: [
      { label: 'Words', description: 'Total words separated by spaces/punctuation.' },
      { label: 'Characters', description: 'Character count with or without spaces.' },
      { label: 'Sentences', description: 'Sentence count from punctuation and structure.' },
      { label: 'Paragraphs', description: 'Paragraph count from line breaks.' },
      { label: 'Reading Time', description: 'Estimated reading time based on average speed.' },
      { label: 'Keyword Density', description: 'Frequency ratio of repeated words/keywords.' },
    ],
  },
  reference: {
    title: 'Copy-Ready Samples',
    kind: 'rows',
    rows: [
      {
        label: 'Blog Intro',
        description: 'Build developer tools that solve one specific problem really well.',
        copyValue: 'Build developer tools that solve one specific problem really well.',
      },
      {
        label: 'PR Summary',
        description: 'Refactored AI bridge routing, improved error details, and updated docs.',
        copyValue: 'Refactored AI bridge routing, improved error details, and updated docs.',
      },
      {
        label: 'SEO Snippet',
        description: 'Fast online word counter for content writers, marketers, and editors.',
        copyValue: 'Fast online word counter for content writers, marketers, and editors.',
      },
    ],
  },
};

export const WHEEL_RANDOM_SPEC: ExternalToolSpec = {
  accent: 'cyan',
  heroIcon: RotateCw,
  badgeIcon: Wand2,
  brand: 'Wheel Random',
  blurb:
    'Spin a customizable random wheel to pick names, tasks, prizes, and options quickly. Great for live sessions and lightweight decision-making.',
  url: 'https://wheelrandom.com/',
  ctaLabel: 'Open Wheel Random',
  guide: {
    title: 'Common Use Cases',
    kind: 'rows',
    icon: ListChecks,
    rows: [
      { label: 'Pick giveaway winners from a participant list' },
      { label: 'Decide random lunch/team activity choices' },
      { label: 'Select backlog items for sprint experiments' },
      { label: 'Run classroom/team icebreaker selections' },
      { label: 'Choose random prompts for writing sessions' },
    ],
  },
  reference: {
    title: 'Copy-Ready Item Lists',
    kind: 'rows',
    rows: [
      {
        label: 'Team Lunch',
        description: 'Khao Man Gai, Pad Thai, Ramen, Salad, Sandwich, Burger',
        copyValue: 'Khao Man Gai, Pad Thai, Ramen, Salad, Sandwich, Burger',
      },
      {
        label: 'Retro Topic',
        description: 'Process, Communication, Testing, Release, Tooling, Docs',
        copyValue: 'Process, Communication, Testing, Release, Tooling, Docs',
      },
      {
        label: 'Giveaway',
        description: 'User-014, User-125, User-339, User-402, User-588',
        copyValue: 'User-014, User-125, User-339, User-402, User-588',
      },
    ],
  },
};

export const DUMMY_IMAGE_SPEC: ExternalToolSpec = {
  accent: 'violet',
  heroIcon: ImageIcon,
  badgeIcon: Palette,
  brand: 'DummyImage',
  blurb:
    'Generate quick placeholder images by URL with custom size, background, foreground, and text. Useful for UI mocks and content skeletons.',
  url: 'https://www.dummyimage.com/',
  ctaLabel: 'Open DummyImage',
  guide: {
    title: 'Quick Sizes',
    kind: 'rows',
    rows: [
      {
        label: 'Avatar',
        description: '128x128',
        badgeIcon: Ruler,
        copyValue: `${DUMMYIMAGE_BASE_URL}128x128`,
      },
      {
        label: 'Card Thumbnail',
        description: '400x240',
        badgeIcon: Ruler,
        copyValue: `${DUMMYIMAGE_BASE_URL}400x240`,
      },
      {
        label: 'Hero Placeholder',
        description: '1200x400',
        badgeIcon: Ruler,
        copyValue: `${DUMMYIMAGE_BASE_URL}1200x400`,
      },
      {
        label: 'Story Banner',
        description: '1080x1920',
        badgeIcon: Ruler,
        copyValue: `${DUMMYIMAGE_BASE_URL}1080x1920`,
      },
    ],
  },
  reference: {
    title: 'Copy-Ready URL Templates',
    kind: 'code',
    rows: [
      { label: 'Basic Placeholder', value: `${DUMMYIMAGE_BASE_URL}600x400` },
      { label: 'Custom Colors', value: `${DUMMYIMAGE_BASE_URL}600x400/0f172a/f8fafc` },
      {
        label: 'With Text',
        value: `${DUMMYIMAGE_BASE_URL}600x400/1d4ed8/ffffff&text=DevPulse+Placeholder`,
      },
      {
        label: 'PNG Extension',
        value: `${DUMMYIMAGE_BASE_URL}1024x512/111827/e5e7eb.png&text=Landing+Banner`,
      },
    ],
  },
};

export const VIN_TOOL_SPEC: ExternalToolSpec = {
  accent: 'sky',
  heroIcon: Car,
  badgeIcon: ScanBarcode,
  brand: 'Tetono VIN Tool',
  blurb:
    'Generate random 17-character vehicle identification numbers with a correct ISO 3779 check digit, using manufacturer codes of cars assembled in Thailand. Also decodes and validates any VIN you paste in — handy for seeding test data.',
  url: 'https://tetono.com/tools/vin/',
  ctaLabel: 'Open VIN Tool',
  guide: {
    title: 'What It Does',
    kind: 'rows',
    icon: ShieldCheck,
    rows: [
      {
        label: 'Standards-Compliant Random VIN',
        description: 'Generates 17-character VINs that follow the ISO 3779 layout.',
      },
      {
        label: 'Valid Check Digit',
        description:
          'Position 9 is computed with the official weighted checksum, so the VIN verifies.',
      },
      {
        label: 'Real Thai-Assembled WMI Codes',
        description:
          'Uses world manufacturer identifiers of vehicles actually assembled in Thailand.',
      },
      {
        label: 'EV Brand Selection',
        description: 'Pick an EV manufacturer to generate a VIN under that brand prefix.',
      },
      {
        label: 'Decode & Validate Any VIN',
        description: 'Paste an existing VIN to break it down and confirm its check digit.',
      },
    ],
  },
  reference: {
    title: 'VIN Structure (ISO 3779)',
    kind: 'rows',
    icon: Factory,
    rows: [
      {
        badge: '1–3',
        label: 'WMI',
        description: 'World Manufacturer Identifier — country, manufacturer, and vehicle type.',
      },
      {
        badge: '4–8',
        label: 'VDS',
        description:
          'Vehicle Descriptor Section — model, body style, engine, and restraint system.',
      },
      {
        badge: '9',
        label: 'Check Digit',
        description: 'Weighted checksum over the other 16 characters; detects typos and fakes.',
      },
      {
        badge: '10',
        label: 'Model Year',
        description: 'Encoded year character (I, O, Q, U, Z and 0 are never used).',
      },
      {
        badge: '11',
        label: 'Plant Code',
        description: 'Assembly plant that produced the vehicle.',
      },
      {
        badge: '12–17',
        label: 'Serial Number',
        description: 'Sequential production number unique to that plant and model year.',
      },
    ],
  },
};

export const CRONTAB_SPEC: ExternalToolSpec = {
  accent: 'indigo',
  heroIcon: Clock,
  badgeIcon: CalendarDays,
  brand: 'Crontab Guru',
  blurb:
    'The “quick and simple” editor for cron schedule expressions. Perfect for double-checking your logic before deployment.',
  url: 'https://crontab.guru/',
  ctaLabel: 'Open Editor',
  // The syntax diagram is bespoke markup; CrontabTool passes it as children.
  reference: {
    title: 'Quick Cheatsheet',
    kind: 'code',
    rows: [
      { label: 'Every minute', value: '* * * * *' },
      { label: 'Every 5 minutes', value: '*/5 * * * *' },
      { label: 'Every hour at minute 0', value: '0 * * * *' },
      { label: 'Every day at midnight', value: '0 0 * * *' },
      { label: 'Every Monday at 1 AM', value: '0 1 * * 1' },
      { label: 'At 10:00 AM on 1st of month', value: '0 10 1 * *' },
      { label: 'Every 15 mins during 9AM-5PM', value: '*/15 9-17 * * *' },
      { label: 'Every Sunday at 4:30 AM', value: '30 4 * * 0' },
    ],
  },
};

export const CRON_PARTS = [
  { label: 'minute', range: '0 - 59' },
  { label: 'hour', range: '0 - 23' },
  { label: 'day of month', range: '1 - 31' },
  { label: 'month', range: '1 - 12' },
  { label: 'day of week', range: '0 - 6 (Sun-Sat)' },
];

export const CRON_OPERATORS = [
  { symbol: '*', meaning: 'any value' },
  { symbol: ',', meaning: 'value list separator' },
  { symbol: '-', meaning: 'range of values' },
  { symbol: '/', meaning: 'step values' },
];

export const REGEX_TESTER_SPEC: ExternalToolSpec = {
  accent: 'pink',
  heroIcon: Code2,
  badgeIcon: Variable,
  brand: 'regex101',
  blurb:
    'The industry standard for testing regular expressions. Features real-time explanation, match information, and code generation for multiple languages.',
  url: 'https://regex101.com/',
  ctaLabel: 'Open regex101',
  reference: {
    title: 'Common Patterns',
    kind: 'code',
    rows: [
      { label: 'Email Address', value: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
      { label: 'Date (YYYY-MM-DD)', value: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$' },
      { label: '24-Hour Time (HH:MM)', value: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
      {
        label: 'URL / Website',
        value:
          'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
      },
      { label: 'Slug (URL friendly)', value: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
      { label: 'Hex Color', value: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$' },
      { label: 'Username (Alphanumeric)', value: '^[a-zA-Z0-9_]{3,16}$' },
      { label: 'Password (Strong)', value: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$' },
    ],
  },
};
