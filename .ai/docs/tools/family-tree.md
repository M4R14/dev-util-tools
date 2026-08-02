# Family Tree

Build a family tree from `{ name, parent, relationship }` and keep it in the browser.

- Route: `/family-tree`
- Component: `src/components/tools/family-tree/index.tsx` (+ `AddMemberForm.tsx`, `TreeView.tsx`,
  `FamilyScene.tsx`)
- Hook: `src/hooks/tools/useFamilyTree.ts`
- Lib: `src/lib/tools/familyTree.ts`, `src/lib/tools/familyTreeLayout.ts`
- Package: `three`

## Data model

```ts
interface FamilyMember {
  id: string;
  name: string;
  parentId: string | null; // null = a root
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

## The 3D view

`familyTreeLayout.ts` is a pure function from the hierarchy to coordinates, so the geometry is
tested without a WebGL context. `FamilyScene.tsx` only turns those coordinates into objects.

**Generations are rings on a widening cone.** Stacking generations on Y and wrapping each onto a
circle means eight cousins do not push their grandparents off the screen the way a flat tree does.
The first version gave every ring the same radius and it read badly — the oldest ancestor stood on
the same circle as their own children, just slightly higher. Radius now grows with depth, so the
ancestor is at the apex. A crowded generation overrides the cone and takes the circumference it
needs.

Angles come from one slot ordering shared by every generation, so a parent sits above the arc its
children occupy and edges stay short. Parent slots are fractional on purpose; rounding would drag a
parent off centre whenever it had an even number of children.

**Labels are canvas textures on sprites, not `TextGeometry`.** The names here are usually Thai, and
`TextGeometry` needs a typeface JSON with the glyphs baked in — a Thai font covering the combining
vowels and tone marks is larger than the rest of this bundle. A 2D canvas uses the font the browser
already has and gets shaping for free. Sprites also face the camera, which keeps the tree readable
while orbiting.

**Selection repaints two labels; it does not rebuild the scene.** Keying the build effect on
`selectedId` was the obvious thing to write and it made the tool unusable — every click tore down
the renderer and reset the camera, throwing away whatever angle the user had orbited to.

**No animation loop while idle.** `OrbitControls` damping is off, so the scene renders on the
`change` event instead of a permanent `requestAnimationFrame`. A loop runs only while auto-rotate
is on, and the first deliberate interaction stops it. Auto-rotate respects `prefers-reduced-motion`.

**Everything is disposed on unmount.** three.js holds GPU memory that garbage collection cannot
reach. Textures are read off each sprite rather than from a list captured at build time, because
selection swaps in a fresh one. Verified by bouncing in and out of the route 13 times: one canvas
in the DOM, no context-loss warnings.

**The list is not decorative.** A WebGL canvas offers nothing to a keyboard or a screen reader, so
the tree stays operable from the list underneath, and selection is shared both ways.

### Bundle cost

three.js is ~541 kB raw / ~136 kB gzipped, in its own `FamilyScene-*.js` chunk behind `React.lazy`,
so no other page pays for it and the main bundle is unchanged. Switching from `import * as THREE`
to named imports changed that chunk by **zero bytes** — same size, same hash. `WebGLRenderer`
reaches most of the library, so there is nothing to tree-shake; the lazy boundary is the only lever
that matters. This is what trips the "chunks larger than 500 kB" build warning.

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
