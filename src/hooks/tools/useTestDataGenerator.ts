import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';
import {
  TEST_DATA_FIELDS,
  generateTestDataSet,
  type TestDataFieldId,
} from '../../lib/tools/testDataGenerator';
import { readPersisted, writePersisted } from '../../lib/platform/persistedState';

const STORAGE_KEY = 'test-data-fields';

const ALL_FIELD_IDS = TEST_DATA_FIELDS.map((field) => field.id);
const storedSchema = z.array(z.string());

/**
 * Which fields to generate, remembered across visits.
 *
 * Someone testing a signup form wants a name, an email and a phone number, not eight rows they
 * have to read past every time. The same person tests the same form tomorrow, so the choice is
 * worth keeping.
 */
const readSelection = (): TestDataFieldId[] => {
  const stored = readPersisted(STORAGE_KEY, storedSchema, ALL_FIELD_IDS);
  const known = stored.filter((id): id is TestDataFieldId =>
    (ALL_FIELD_IDS as string[]).includes(id),
  );

  // An empty selection would render a tool that generates nothing, so fall back to everything.
  return known.length > 0 ? known : ALL_FIELD_IDS;
};

/**
 * Rows are generated for every field regardless of the selection, so toggling one back on shows a
 * value immediately rather than a blank waiting for the next regenerate.
 */
export const useTestDataGenerator = () => {
  const [rows, setRows] = useState(() => [generateTestDataSet()]);
  const [selected, setSelected] = useState<TestDataFieldId[]>(readSelection);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const fields = useMemo(
    () => TEST_DATA_FIELDS.filter((field) => selectedSet.has(field.id)),
    [selectedSet],
  );

  const toggleField = useCallback((id: TestDataFieldId) => {
    setSelected((previous) => {
      const next = previous.includes(id)
        ? previous.filter((entry) => entry !== id)
        : [...ALL_FIELD_IDS].filter((entry) => entry === id || previous.includes(entry));

      // Refusing the last removal beats rendering an empty tool with no explanation.
      if (next.length === 0) return previous;

      writePersisted(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(ALL_FIELD_IDS);
    writePersisted(STORAGE_KEY, ALL_FIELD_IDS);
  }, []);

  const regenerate = useCallback(
    () => setRows((previous) => previous.map(generateTestDataSet)),
    [],
  );
  const addRow = useCallback(() => setRows((previous) => [...previous, generateTestDataSet()]), []);
  const removeRow = useCallback(
    (index: number) =>
      setRows((previous) =>
        previous.length === 1 ? previous : previous.filter((_, i) => i !== index),
      ),
    [],
  );

  const regenerateField = useCallback((index: number, fieldId: TestDataFieldId) => {
    const field = TEST_DATA_FIELDS.find((f) => f.id === fieldId);
    if (!field) return;

    setRows((previous) =>
      previous.map((row, i) => (i === index ? { ...row, [fieldId]: field.generate() } : row)),
    );
  }, []);

  /** Tab-separated so a paste into a spreadsheet lands in columns. Selected fields only. */
  const asTsv = useMemo(
    () =>
      [
        fields.map((f) => f.id).join('\t'),
        ...rows.map((row) => fields.map((f) => row[f.id]).join('\t')),
      ].join('\n'),
    [fields, rows],
  );

  const asJson = useMemo(() => {
    const picked = rows.map((row) => Object.fromEntries(fields.map((f) => [f.id, row[f.id]])));
    return JSON.stringify(picked.length === 1 ? picked[0] : picked, null, 2);
  }, [fields, rows]);

  return {
    rows,
    fields,
    allFields: TEST_DATA_FIELDS,
    selectedSet,
    toggleField,
    selectAll,
    allSelected: selected.length === ALL_FIELD_IDS.length,
    regenerate,
    regenerateField,
    addRow,
    removeRow,
    asTsv,
    asJson,
  };
};
