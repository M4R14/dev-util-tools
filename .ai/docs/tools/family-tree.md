# Family Tree

Build a family tree from `{ name, parent, relationship }` and keep it in the browser.

- Route: `/family-tree`
- Component: `src/components/tools/family-tree/index.tsx` (+ `AddMemberForm.tsx`, `TreeView.tsx`,
  `FamilyDiagram.tsx`)
- Hook: `src/hooks/tools/useFamilyTree.ts`
- Lib: `src/lib/tools/familyTree.ts`, `src/lib/tools/familyTreeLayout.ts`
- No packages: the diagram is hand-written SVG

## Data model

```ts
interface FamilyMember {
  id: string;
  name: string;
  parentId: string | null; // null = a root
  spouseId: string | null; // the partner drawn beside them
  relationship: string;    // free text; how they relate to their parent
  note: string;
}
```

Stored **flat**, not nested. Every operation the tool offers — rename, re-parent, delete, import —
is a lookup by id, and a nested shape turns each of those into a recursive rewrite. `buildHierarchy`
derives the nesting on read.

`relationship` is free text with Thai presets (`RELATIONSHIP_PRESETS`) offered through a
`<datalist>`. Nothing computes or validates it: it is a label the owner writes, not a derived fact.

## Decisions worth keeping

**Deleting a member lifts their children, it does not delete the subtree.** Someone removing a
duplicate halfway up a tree they spent an hour on would otherwise lose every descendant to one
click, invisibly. The toast names how many moved.

**Nobody is dropped from the render.** Two things can stop a member hanging off a root — their
parent is missing (an import that lost a row) or the parent chain loops (a hand-edited file). Both
are reported on `Hierarchy` (`orphanedIds`, `cycleIds`), rendered as roots, and flagged amber in the
UI. A tree that silently omits people is worse than one showing a stray branch.

**Only members *on* a loop are lifted, not everyone below one.** "Cannot reach a root" is also true
of every descendant of a loop, and promoting those discards a parent link that was never in
question. `buildHierarchy.isOnCycle` tests whether the chain returns to the member itself.

**`reparentMember` returns a result, not a list.** Dropping a member onto their own descendant is
easy in a dropdown-driven UI and the damage — a subtree vanishing from every root at once — is
silent. Refused with a reason instead.

**The tree is never put in the URL.** Every other tool here round-trips its state through the query
string so a link reproduces the work. This one holds relatives' names; a shareable link would carry
them into browser history, link previews, and any referrer the page sends. Export is an explicit
button. `useFamilyTree` uses `persistedState`, not `useShareableState`, for this reason.

Clearing the tree removes the storage key rather than writing `[]`, so an empty tree does not come
back on the next visit.

## Partners

`spouseId` is symmetric — every write sets both sides, or the pair renders from one side only and
unlinking from the other does nothing.

**Only a partner with no parent of their own gives up their slot.** `buildHierarchy.isMarriedIn`
decides this. Someone who is themselves a descendant belongs under their own parent, and no tree can
draw one person twice; that partner stays where they are and the pair is simply not joined. When
neither has a parent, whichever was added first keeps the slot — without that tie-break the two
would each attach to the other and both vanish from the diagram.

A married-in partner has no node in the hierarchy, so `TreeView` renders them as an extra row under
the member holding the slot. Without it they would appear in the picture and be impossible to
rename, re-link or delete.

`linkSpouse` releases a previous partner before taking a new one, refuses self-marriage, and refuses
a parent marrying their own child. `removeMember` clears the link so no bar is drawn to somebody who
is gone.

## The diagram

`familyTreeLayout.ts` is a pure function from the hierarchy to coordinates and connector polylines,
tested without rendering anything. `FamilyDiagram.tsx` only turns those numbers into SVG.

**Widths are measured bottom-up before anything is placed.** A parent can be wider than its children
(a couple with one child) or narrower (six children under one person). `widthOf` takes the larger and
the placement centres the smaller inside it, which avoids a second pass to push overlapping subtrees
apart.

**Children hang from the partner bar, not from under a name.** For a couple the drop starts at the
bar's height so it passes between the two names; for a single parent it starts below the box. A lone
child gets no horizontal run — drawing a zero-length one leaves a visible dot at the join.

**SVG, not canvas or WebGL.** A few dozen rectangles and straight lines stay crisp at any zoom or
pixel density for free, and each member can be a real focusable element with a label — which is what
lets the diagram be operated from the keyboard rather than being an image with a list bolted on
beside it. It also costs no dependency: an earlier version of this tool drew the same tree with
three.js and carried 136 kB gzipped to do it.

The diagram scales down to fit its panel, never up past natural size, and stops shrinking at 55% —
below that the names stop being readable, so scrolling is the better trade.

## Type notes

The project compiles without `strictNullChecks`. Two consequences show up here:

- TypeScript narrows a discriminated union on the `true` side but not the `false` side, so
  `if (!result.ok) … result.reason` does not compile. `isFamilyFailure` is an explicit guard that
  works either way.
- `parentId` is `z.string().nullable().optional()` in the schema, which infers as `parentId?: string`
  and will not sit in a `FamilyMember[]`. `toMembers` rebuilds each member instead of casting, and
  normalises a missing key to `null` — which the import path wanted anyway.

## Related

- [Adding a New Tool](../05-adding-new-tool.md)
- [Tool Registry](../04-tool-registry.md)
