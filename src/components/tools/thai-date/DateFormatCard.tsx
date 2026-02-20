import React from 'react';
import { CopyButton } from '../../ui/CopyButton';

export interface DateFormatItem {
  label: string;
  value: string;
}

interface DateFormatCardProps {
  item: DateFormatItem;
  index?: number;
  variant?: 'default' | 'compact';
}

const DateFormatCard: React.FC<DateFormatCardProps> = ({ item, index = 0, variant = 'default' }) => {
  return (
    <div className="group relative rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-primary/35">
      <div className="flex items-start gap-2.5">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <p className="font-mono text-xs sm:text-sm leading-snug text-card-foreground break-all">
            {item.value}
          </p>
        </div>

        <CopyButton
          value={item.value}
          className="h-6 w-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
          iconClassName="w-3 h-3"
        />
      </div>
    </div>
  );
};

export default DateFormatCard;
