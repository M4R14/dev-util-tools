import { describe, expect, it } from 'vitest';
import type { LucideIcon } from 'lucide-react';
import { filterCommandPaletteActions } from './items';
import type { CommandPaletteAction } from './types';

const iconStub = (() => null) as unknown as LucideIcon;

const makeAction = (
  id: string,
  name: string,
  description: string,
  keywords?: string[],
): CommandPaletteAction => ({
  id,
  name,
  description,
  icon: iconStub,
  keywords,
  onSelect: () => {},
});

const actions = [
  makeAction('settings', 'Open settings', 'Go to app settings', ['preferences', 'config']),
  makeAction('updates', 'Check updates', 'Check for a newer app version'),
  makeAction('cache', 'Clear offline cache', 'Delete cached offline assets'),
];

const names = (results: CommandPaletteAction[]) => results.map((action) => action.name);

describe('filterCommandPaletteActions', () => {
  it('returns everything for an empty term', () => {
    expect(filterCommandPaletteActions(actions, '')).toBe(actions);
    expect(filterCommandPaletteActions(actions, '   ')).toBe(actions);
  });

  it('matches on name', () => {
    expect(names(filterCommandPaletteActions(actions, 'settings'))).toContain('Open settings');
  });

  it('forgives a typo, the way the tool half of the list already did', () => {
    // The old substring filter returned nothing here, so `jsn` found JSON tools while `settngs`
    // found no actions — two matching rules inside one list.
    expect(names(filterCommandPaletteActions(actions, 'settngs'))).toContain('Open settings');
  });

  it('matches on a prefix', () => {
    expect(names(filterCommandPaletteActions(actions, 'clea'))).toContain('Clear offline cache');
  });

  it('matches on keywords that appear in no visible text', () => {
    expect(names(filterCommandPaletteActions(actions, 'preferences'))).toContain('Open settings');
  });

  it('matches on description', () => {
    expect(names(filterCommandPaletteActions(actions, 'newer'))).toContain('Check updates');
  });

  it('returns nothing for a term that matches nothing', () => {
    expect(filterCommandPaletteActions(actions, 'zzzqqq')).toEqual([]);
  });

  it('handles an empty action list', () => {
    expect(filterCommandPaletteActions([], 'anything')).toEqual([]);
  });

  it('reuses the index for the same array instead of rebuilding it', () => {
    // The cache is keyed by array identity; a stale index would return the wrong actions here.
    const first = filterCommandPaletteActions(actions, 'settings');
    const second = filterCommandPaletteActions(actions, 'settings');

    expect(names(second)).toEqual(names(first));
  });

  it('indexes a new array rather than serving the previous one', () => {
    const other = [makeAction('theme', 'Toggle theme', 'Switch between light and dark')];

    expect(names(filterCommandPaletteActions(other, 'theme'))).toEqual(['Toggle theme']);
    expect(filterCommandPaletteActions(other, 'settings')).toEqual([]);
  });
});
