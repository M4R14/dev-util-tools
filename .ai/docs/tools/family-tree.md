# Family Tree

Build a family tree from `{ name, parent, relationship }` and keep it in the browser.

- Route: `/family-tree`
- Component: `src/components/tools/family-tree/` — `index.tsx` composes; the diagram is
  `FamilyDiagram.tsx` (composition only) over `MemberNode.tsx`, `DiagramToolbar.tsx`,
  `MemberEditor.tsx`, `useDiagramViewport.ts` and `diagramLabels.ts`; the list is `TreeView.tsx`
  and the form `AddMemberForm.tsx`
- Hook: `src/hooks/tools/useFamilyTree.ts`
- Lib: `src/lib/tools/familyTree/` — see below
- No packages: the diagram is hand-written SVG

## Module split

`src/lib/tools/familyTree/` is four modules and a layout, deliberately without a barrel:

| File | Holds | Depends on |
|---|---|---|
| `types.ts` | `FamilyMember`, `FamilyNode`, `Hierarchy`, `Gender`, `CreateMemberInput`, `FamilyFailure`, `isFamilyFailure`, `RELATIONSHIP_PRESETS` | nothing |
| `members.ts` | every change to the flat list — create, append, update, remove, `linkSpouse`, `reparentMember`, `ancestorIdsOf` | `types`, `randomUtils` |
| `hierarchy.ts` | `buildHierarchy`, `collapseHierarchy`, `countDescendants`, `countGenerations`, `flattenHierarchy` | `types` |
| `storage.ts` | the zod schema, `normalizeMembers`, `serializeFamily`, `parseFamily` | `types`, `zod` |
| `layout.ts` | `layoutFamilyTree2D` | `types` |

The split follows what the callers actually ask for. Five of the six components import nothing but
`FamilyMember` or `FamilyNode` to type a prop; only the hook wants operations. One 466-line module
meant naming a type pulled in zod, `randomUUID` and every mutation.

**No barrel on purpose.** Re-exporting everything through an `index.ts` would hand every component
the whole surface again and undo the split. Imports name the module they want.

`hierarchy.ts` does not import `members.ts` and vice versa: one derives, the other mutates, and
neither needs the other.

## Data model

```ts
interface FamilyMember {
  id: string;
  name: string;
  parentId: string | null; // null = a root
  spouseId: string | null; // the partner drawn beside them
  gender: 'male' | 'female' | 'unknown';
  relationship: string;    // free text; how they relate to their parent
  birth: string;           // free text, not a date — see lifeDates.ts
  death: string;           // anything at all here means the person is gone
  note: string;
}
```

`gender` is a field rather than a guess from `relationship`. Reading "ลูกสาว" out of free text works
right up until somebody writes "ลูก" or "ลูกคนโต", at which point the diagram is confidently wrong
with nothing on screen to explain why.

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

**A refused write is announced and stays on screen.** `writePersisted` returns `false` when
localStorage says no — a full quota, Safari in private mode — and the hook used to discard that.
Someone could enter their whole family, watch every edit appear, and lose all of it on reload with
no signal at all. The warning has a fixed toast id so it replaces itself instead of stacking one per
keystroke, has no timeout, and is withdrawn with a confirmation once a write succeeds again. This
tool has no value except the data typed into it, so a failure to keep it is the one thing that
cannot be quiet.

**Destructive actions are undoable, not guarded by a dialog.** Clear, import and delete all offer an
Undo on the toast for twelve seconds. A confirmation only ever asks before the mistake; undo answers
the case that actually happens, where the click already landed and an hour of work is off the
screen.

**Toasts are raised outside the state updater.** React calls updaters twice under StrictMode, so a
side effect inside one fires twice — deleting used to announce itself two times in development.

## Dates and order

`birth` and `death` stay **free text**. A family tree is filled in from memory and from the back of
photographs — "2510", "ราวๆ 2495", "12 มี.ค. 2503" — and a date picker that demands a valid date
turns "some time in the sixties" into a blank.

`lifeDates.ts` reads a year out of whatever is there, and nothing else depends on it, so a value it
cannot parse costs the owner only the sorting. It takes the first four-digit run, rejects anything
outside 1000–2999 so a phone number in the wrong field is not read as a year, and treats anything at
or above **2300 as Buddhist** — the boundary is CE 1757, which no Common Era entry in a family tree
can reach and no Buddhist one can fall below.

`death` holding anything at all means the person is gone, whether or not it carries a year; the
label then reads "deceased". No dagger — it carries a religious reading that does not fit every
family this tool is for.

**Sibling order is editable.** It used to be the order people happened to be entered, permanently:
someone who remembered the youngest first left them on the left forever. `moveMember` swaps a member
with the sibling beside them, stepping over anyone who is not a sibling, and `sortChildrenByBirth`
reorders one person's children oldest first with unknown births trailing in place.

Sorting is **offered, never automatic**. Applying it as dates are typed would rearrange the diagram
under someone mid-edit, and a tree with half its dates filled in would shuffle on every entry.

## Partners and remarriage

`spouseIds` is a **list**, and symmetric — every write sets both sides, or the pair renders from one
side only and unlinking from the other does nothing.

A list rather than one id because a person marries more than once. With a single slot a second
marriage could not be recorded at all: adding a partner had to drop the previous one, which quietly
rewrote history — the children of the first marriage were left attributed to a couple that no longer
existed.

`otherParentId` on a child names which of their parent's partners they also descend from. **This is
what separates half-siblings**; without it the children of a first and a second marriage sit in one
undifferentiated row with nothing to say they have different mothers. When the parent has exactly
one partner an unrecorded value means that partner — there is nothing to be ambiguous about, and
every tree built before the field existed looks like this.

`unlinkSpouse` clears the attribution of any child of that pairing, or they would hang off a bar
that is no longer drawn, which puts them nowhere. `removeMember` does the same.

**A shared parent with more than one partner is drawn between them.** With the parent at one end of
the row, the second bar visually joined two partners *to each other*, and that marriage's children
dropped out of the first partner's head — caught by looking at it, not by a test. Past two partners
a bar has to span over an inner one; the bars stagger so they stay countable, but a third marriage
is drawn less clearly than the first two.

Old exports carry `spouseId` rather than `spouseIds`; `storage.ts` accepts both and lifts the single
key into the list, so a saved file is never a reason to lose a tree.

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

`layout.ts` is a pure function from the hierarchy to coordinates and connector polylines,
tested without rendering anything. The rendering is split the same way the work is:

| File | Holds |
|---|---|
| `FamilyDiagram.tsx` | composition only — layout in, the pieces below arranged |
| `MemberNode.tsx` | one person: outline, silhouette, labels, warning badge, fold control |
| `DiagramToolbar.tsx` | zoom, fit and export chrome |
| `useDiagramViewport.ts` | what is on screen: zoom, fit, drag-to-pan, scroll-to-reveal |
| `diagramLabels.ts` | cutting each label to the width of its slot |

`useDiagramViewport` is one hook rather than four because zoom, fit, panning and revealing all
read or write the same two numbers — the scroll offsets of one element. Splitting them would mean
four things fighting over the same ref.

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

### Reading a big tree

**The fit floor is 85%, and that number was measured.** It was 55% first, which turned out to be the
worst of both worlds: a fourteen-sibling generation rendered its names at 7.1px — unreadable — and
*still* needed horizontal scrolling. At 85% the same tree draws at 11px and scrolls. Below the
floor, scrolling at a legible size beats shrinking past it.

**Labels are truncated against a real measurement, not a character count.** `svgText.ts` takes a
`measure` function so the fitting logic is testable without a canvas, and `createCanvasMeasurer`
supplies the real one. It splits on grapheme clusters via `Intl.Segmenter`: Thai writes vowels and
tone marks as separate code points that attach to the consonant before them, so a code-point slice
strands a combining mark and renders a dotted circle. Anything cut keeps its full text in a
`<title>`. Before this, notes were cut at 22 characters and names were not cut at all — two Thai
names at 140px in a 116px slot overlapped into a smear.

**Zoom, pan and fit.** Buttons step the zoom; dragging the background pans. Pointer-down on a member
is left alone so panning does not eat clicks.

`Fit` scales **up as well as down**, against both axes. It was capped at 1 first, which made it a
permanently dead button for any tree narrower than the panel — which is most of them: the user
pressed it and nothing happened, correctly reporting it as broken. The readability floor still
applies, so on a tree too wide to fit, `Fit` means "as close as stays legible" and the diagram
scrolls. The button carries `aria-pressed` and lights up in fit mode, so the click has visible
feedback even when the scale it lands on is unchanged.

**The scroll box has a fixed height** (`60vh`, clamped). Not a stylistic choice: `Fit` reads this
box to pick a scale, so a height that grew with the content would feed back into the number that
produced it. It also keeps a deep tree scrolling in its own frame instead of stretching the page.

**Selection scrolls the diagram.** Selection is shared with the list, and on a wide tree the person
picked there was routinely off-screen with nothing to say so. Honours `prefers-reduced-motion`.

**Members the list flags amber are flagged in the diagram too.** An orphan drawn as a plain second
root looks like a deliberate one, and the diagram is what people actually look at.

**Folding is view state, not tree data.** `collapseHierarchy` is a pure prune over the hierarchy, so
the layout never learns that folding exists — it lays out whatever tree it is handed. The badge
shows the number of hidden people because a bare chevron hides how much is behind it. The fold
control sits *below* the box: inside it, it landed exactly on the detail line and the two drew over
each other.

### Editing from the diagram

Clicking a member opens `MemberEditor` anchored under them: name, relationship, gender, note, and
buttons for child, partner and delete. It writes through on every keystroke, so there is no save
button to forget. The list below still exists for what the card has no room for — re-parenting,
re-partnering, and a reading order that works without a mouse.

The card lives inside the scaled content wrapper, not over the scroll port, so it travels with the
diagram rather than hovering in place while the tree slides underneath.

**Adding selects and focuses the new member.** That is why `useFamilyTree.addMember` returns an id
and `appendMember` is split out of `addMember` — the id has to be known before the state update
lands. Click a person, press Child, type the name: no round trip to the form.

**A child added from the married-in side attaches to their partner.** Children hang from whichever
partner holds the slot, and refusing the click because someone stood on the wrong half of a couple
would be pedantry. Which partner holds it is read off the hierarchy rather than re-derived: when
neither has a parent it is settled by who was added first, and the obvious guess — "no parent and
has a spouse" — identifies the slot holder exactly backwards.

**Selection scrolls the diagram only when the selection changes.** Keying that effect on the layout
alone re-centred the view on every letter typed into a name, because writing through rebuilds the
layout.

### Export

`svgExport.ts` copies the computed value of the painted properties onto each element before
serialising. Without that the file is styled entirely by CSS classes that travel with nothing, and
opens anywhere else as black shapes on nothing. PNG rasterises at 2× and paints the background
explicitly, since SVG has none and a transparent PNG on a dark surface is dark text on dark.

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
