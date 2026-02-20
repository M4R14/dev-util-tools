import { buildShareableSearchParams } from './shareableUrlState';

describe('shareableUrlState', () => {
  it('sets non-empty values into query string', () => {
    const next = buildShareableSearchParams('', [
      { key: 'input', value: 'hello' },
      { key: 'mode', value: 'split' },
    ]);

    expect(next.toString()).toBe('input=hello&mode=split');
  });

  it('removes empty values from query string', () => {
    const next = buildShareableSearchParams('input=hello&mode=split', [
      { key: 'input', value: '' },
      { key: 'mode', value: undefined },
    ]);

    expect(next.toString()).toBe('');
  });

  it('removes values that match default values', () => {
    const next = buildShareableSearchParams('view=split&q=1&hy=0', [
      { key: 'view', value: 'split', defaultValue: 'split' },
      { key: 'q', value: '1', defaultValue: '1' },
      { key: 'hy', value: '0', defaultValue: '1' },
    ]);

    expect(next.toString()).toBe('hy=0');
  });
});
