import { useCallback, useState } from 'react';
import {
  TEST_DATA_FIELDS,
  generateTestDataSet,
  type TestDataFieldId,
} from '../../lib/tools/testDataGenerator';

/**
 * Deliberately not synced to the URL: a shareable link to randomly generated values would name a
 * set nobody asked for, and every regenerate would rewrite the address bar.
 */
export const useTestDataGenerator = () => {
  const [rows, setRows] = useState(() => [generateTestDataSet()]);

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

  /** Tab-separated so a paste into a spreadsheet lands in columns. */
  const asTsv = [
    TEST_DATA_FIELDS.map((f) => f.id).join('\t'),
    ...rows.map((row) => TEST_DATA_FIELDS.map((f) => row[f.id]).join('\t')),
  ].join('\n');

  const asJson = JSON.stringify(rows.length === 1 ? rows[0] : rows, null, 2);

  return {
    rows,
    fields: TEST_DATA_FIELDS,
    regenerate,
    regenerateField,
    addRow,
    removeRow,
    asTsv,
    asJson,
  };
};
