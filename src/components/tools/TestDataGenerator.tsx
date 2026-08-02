import React from 'react';
import { Plus, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react';
import { ToolLayout } from '../ui/ToolLayout';
import { Button } from '../ui/Button';
import { CopyButton } from '../ui/CopyButton';
import { SendToToolButton } from '../ui/SendToToolButton';
import { useTestDataGenerator } from '../../hooks/tools/useTestDataGenerator';
import { cn } from '../../lib/utils';

const TestDataGenerator: React.FC = () => {
  const {
    rows,
    fields,
    allFields,
    selectedSet,
    toggleField,
    selectAll,
    allSelected,
    regenerate,
    regenerateField,
    addRow,
    removeRow,
    asTsv,
    asJson,
  } = useTestDataGenerator();

  return (
    <ToolLayout>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button onClick={regenerate} data-action="regenerate-all">
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Regenerate
        </Button>
        <Button variant="outline" onClick={addRow}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add row
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <SendToToolButton value={asJson} valueName="test data" />
          {/*
            Both copy buttons say what they copy. A bare icon beside a JSON blob and another beside
            a TSV blob left the reader to work out which was which.
          */}
          <CopyButton value={asJson} label="JSON" successMessage="Copied as JSON" />
          <CopyButton
            value={asTsv}
            label="TSV"
            successMessage="Copied as TSV — paste into a spreadsheet"
          />
        </div>
      </div>

      {/*
        Field selection, persisted. Someone testing a signup form wants a name, an email and a
        phone number — not eight rows to read past on every regenerate.
      */}
      <fieldset className="mb-4 rounded-xl border border-border/70 px-4 py-3">
        <legend className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Fields
        </legend>
        <div className="flex flex-wrap items-center gap-1.5">
          {allFields.map((field) => {
            const checked = selectedSet.has(field.id);

            return (
              <button
                key={field.id}
                type="button"
                onClick={() => toggleField(field.id)}
                aria-pressed={checked}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                  checked
                    ? 'border-primary/20 bg-primary/10 text-primary'
                    : 'border-border bg-background/60 text-muted-foreground hover:text-foreground',
                )}
              >
                {field.label}
              </button>
            );
          })}
          {!allSelected && (
            <button
              type="button"
              onClick={selectAll}
              className="ml-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Select all
            </button>
          )}
        </div>
      </fieldset>

      {rows.map((row, index) => (
        <ToolLayout.Panel
          key={index}
          title={rows.length > 1 ? `Row ${index + 1}` : 'Generated values'}
          className="mb-4"
          actions={
            rows.length > 1 ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRow(index)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                aria-label={`Remove row ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null
          }
        >
          <dl className="divide-y divide-border/50">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 sm:flex-nowrap"
              >
                <dt className="w-40 shrink-0">
                  <span className="block text-sm text-foreground">{field.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{field.hint}</span>
                </dt>
                <dd className="min-w-0 flex-1 break-all font-mono text-sm text-foreground">
                  {row[field.id]}
                </dd>
                <div className="flex shrink-0 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => regenerateField(index, field.id)}
                    className="h-8 w-8 text-muted-foreground"
                    aria-label={`Regenerate ${field.label}`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                  <CopyButton value={row[field.id]} successMessage={`${field.label} copied`} />
                </div>
              </div>
            ))}
          </dl>
        </ToolLayout.Panel>
      ))}

      {/*
        The TSV preview used to sit open, 66px tall, with 43% of its width scrolled out of sight —
        unreadable, and never meant to be read. It is behind a toggle now; the copy button above is
        the way it is actually used.
      */}
      <details className="rounded-xl border border-border/70 px-4 py-3">
        <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
          Preview TSV
        </summary>
        <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-border/60 bg-muted/30 p-3 font-mono text-xs">
          {asTsv}
        </pre>
      </details>

      <p className="mt-4 inline-flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
        <span>
          Fictitious data, valid only in format. IDs and card numbers are correct by construction,
          so a value can collide with a real one by chance — use it for form testing, never send it
          anywhere real.
        </span>
      </p>
    </ToolLayout>
  );
};

export default TestDataGenerator;
