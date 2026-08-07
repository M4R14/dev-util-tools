import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../ui/Input';
import { cn } from '../../../lib/utils';
import type { FamilyMember } from '../../../lib/tools/familyTree/types';

interface MemberSearchProps {
  members: FamilyMember[];
  onSelect: (id: string) => void;
}

const MAX_RESULTS = 6;

/**
 * Finding one person in a tree too big to scan.
 *
 * Plain substring matching, not the app's MiniSearch index: the corpus is a handful of names the
 * owner typed themselves and remembers, so fuzzy matching would mostly add surprises. Selecting a
 * result is all it does — the diagram already scrolls to whoever is selected.
 */
export const MemberSearch: React.FC<MemberSearchProps> = ({ members, onSelect }) => {
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return [];

    return members
      .filter((member) =>
        [member.name, member.relationship, member.note].join(' ').toLowerCase().includes(needle),
      )
      .slice(0, MAX_RESULTS);
  }, [members, query]);

  const total = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return 0;

    return members.filter((member) =>
      [member.name, member.relationship, member.note].join(' ').toLowerCase().includes(needle),
    ).length;
  }, [members, query]);

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find someone in the tree"
        aria-label="Find someone in the tree"
        className="h-8 pl-8 text-xs"
        autoComplete="off"
      />

      {query.trim().length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {matches.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Nobody by that name.</p>
          ) : (
            <>
              {matches.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    onSelect(member.id);
                    setQuery('');
                  }}
                  className={cn(
                    'flex w-full items-baseline gap-2 px-3 py-1.5 text-left text-xs',
                    'hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                  )}
                >
                  <span className="font-medium text-foreground">{member.name || 'Untitled'}</span>
                  {member.relationship && (
                    <span className="text-muted-foreground">{member.relationship}</span>
                  )}
                </button>
              ))}
              {/* Say what was left out rather than letting the list look complete. */}
              {total > matches.length && (
                <p className="border-t border-border/60 px-3 py-1.5 text-[11px] text-muted-foreground">
                  {total - matches.length} more — keep typing
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
