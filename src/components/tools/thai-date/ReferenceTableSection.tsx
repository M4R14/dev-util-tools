import React, { useState } from 'react';
import { Languages, RotateCcw, Table2 } from 'lucide-react';
import ToolLayout from '../../ui/ToolLayout';
import { Card, CardContent } from '../../ui/Card';
import { cn } from '../../../lib/utils';
import type { ReferenceRow } from './referenceData';

interface ReferenceTableSectionProps {
  title: string;
  description: string;
  totalLabel: string;
  rows: ReferenceRow[];
  numberLabel: string;
  minWidthClassName?: string;
}

const ReferenceTableSection: React.FC<ReferenceTableSectionProps> = ({
  title,
  description,
  totalLabel,
  rows,
  numberLabel,
  minWidthClassName = 'min-w-[760px]',
}) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const selectedEntry = rows.find((row) => row.id === selectedRow) ?? null;

  const toggleRow = (rowId: string) => {
    setSelectedRow((prev) => (prev === rowId ? null : rowId));
  };

  return (
    <ToolLayout.Section
      title={title}
      actions={(
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-xs text-muted-foreground">
            คลิกคอลัมน์เพื่อไฮไลต์
          </span>
          {selectedEntry && (
            <button
              type="button"
              onClick={() => setSelectedRow(null)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              ล้างเลือก
            </button>
          )}
        </div>
      )}
    >
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="px-5 py-4 border-b border-border/60 bg-gradient-to-r from-muted/35 to-muted/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
                <Table2 className="w-4 h-4 text-primary" />
                {description}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs">
                <span className="px-2 py-1 rounded-md border border-border bg-background text-muted-foreground">
                  {totalLabel}
                </span>
                <span className="px-2 py-1 rounded-md border border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1">
                  <Languages className="w-3 h-3" />
                  EN/TH
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 py-2.5 border-b border-border/50 bg-muted/10 text-xs text-muted-foreground">
            {selectedEntry
              ? `เลือกคอลัมน์: ${selectedEntry.number} | EN ${selectedEntry.enLong} (${selectedEntry.enShort}) | TH ${selectedEntry.thLong} (${selectedEntry.thShort})`
              : 'ยังไม่ได้เลือกคอลัมน์'}
          </div>

          <div className="overflow-x-auto">
            <table className={cn('w-max min-w-full text-sm', minWidthClassName)}>
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left">
                  <th className="sticky left-0 z-20 px-4 py-3 font-semibold text-muted-foreground min-w-[120px] bg-muted/30 border-r border-border/50">
                    {numberLabel}
                  </th>
                  {rows.map((row) => (
                    <th
                      key={`header-${row.id}`}
                      className="px-2 py-2 min-w-[110px]"
                    >
                      <button
                        type="button"
                        onClick={() => toggleRow(row.id)}
                        className={cn(
                          'w-full rounded-md px-2 py-1.5 font-semibold text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                          selectedRow === row.id
                            ? 'bg-primary/25 text-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-primary/15',
                        )}
                      >
                        {row.number}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/40 bg-background">
                  <th className="sticky left-0 z-10 px-4 py-3 font-semibold text-muted-foreground text-left bg-background border-r border-border/50">
                    EN
                  </th>
                  {rows.map((row) => (
                    <td key={`en-${row.id}`} className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => toggleRow(row.id)}
                        className={cn(
                          'w-full rounded-md px-2 py-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                          selectedRow === row.id
                            ? 'bg-primary/25 text-foreground shadow-sm'
                            : 'hover:bg-primary/15 text-foreground',
                        )}
                      >
                        {row.enLong} ({row.enShort})
                      </button>
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-border/40 bg-muted/10">
                  <th className="sticky left-0 z-10 px-4 py-3 font-semibold text-muted-foreground text-left bg-muted/10 border-r border-border/50">
                    TH
                  </th>
                  {rows.map((row) => (
                    <td key={`th-${row.id}`} className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => toggleRow(row.id)}
                        className={cn(
                          'w-full rounded-md px-2 py-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                          selectedRow === row.id
                            ? 'bg-primary/25 text-foreground shadow-sm'
                            : 'hover:bg-primary/15 text-foreground',
                        )}
                      >
                        {row.thLong} ({row.thShort})
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </ToolLayout.Section>
  );
};

export default ReferenceTableSection;
