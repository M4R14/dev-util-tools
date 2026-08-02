import { describe, expect, it } from 'vitest';
import { buildHierarchy } from './hierarchy';
import type { FamilyMember } from './types';
import { layoutFamilyTree2D } from './layout';

const member = (
  id: string,
  parentId: string | null,
  spouseId: string | null = null,
): FamilyMember => ({
  id,
  name: id,
  parentId,
  spouseIds: spouseId ? [spouseId] : [],
  otherParentId: null,
  gender: 'unknown',
  relationship: '',
  birth: '',
  death: '',
  note: '',
});

/** Round numbers so the assertions read as geometry rather than arithmetic. */
const OPTIONS = {
  nodeWidth: 100,
  nodeHeight: 100,
  avatarSize: 60,
  spouseGap: 40,
  siblingGap: 20,
  levelGap: 100,
  padding: 0,
};

const layoutOf = (members: FamilyMember[]) =>
  layoutFamilyTree2D(buildHierarchy(members).roots, OPTIONS);

const boxOf = (layout: ReturnType<typeof layoutOf>, id: string) =>
  layout.boxes.find((box) => box.member.id === id);

describe('layoutFamilyTree2D', () => {
  it('returns nothing for an empty tree', () => {
    const layout = layoutFamilyTree2D([], OPTIONS);

    expect(layout.boxes).toEqual([]);
    expect(layout.connectors).toEqual([]);
    expect(layout.width).toBe(0);
    expect(layout.height).toBe(0);
  });

  it('puts each generation on its own row', () => {
    const layout = layoutOf([member('gp', null), member('dad', 'gp'), member('me', 'dad')]);

    expect(boxOf(layout, 'gp')?.y).toBe(0);
    expect(boxOf(layout, 'dad')?.y).toBe(200);
    expect(boxOf(layout, 'me')?.y).toBe(400);
    expect(layout.height).toBe(500);
  });

  it('centres a parent over its children', () => {
    const layout = layoutOf([
      member('dad', null),
      member('a', 'dad'),
      member('b', 'dad'),
      member('c', 'dad'),
    ]);

    const centres = ['a', 'b', 'c'].map((id) => boxOf(layout, id)!.x);

    expect(boxOf(layout, 'dad')?.x).toBeCloseTo((centres[0] + centres[2]) / 2, 6);
  });

  it('spaces siblings by the sibling gap without overlapping', () => {
    const layout = layoutOf([member('dad', null), member('a', 'dad'), member('b', 'dad')]);

    const a = boxOf(layout, 'a')!;
    const b = boxOf(layout, 'b')!;

    // Node width 100 plus a 20 gap between the edges.
    expect(b.x - a.x).toBe(120);
  });

  it('draws partners side by side with a bar between them', () => {
    const layout = layoutOf([member('gp', null, 'gm'), member('gm', null, 'gp')]);

    const gp = boxOf(layout, 'gp')!;
    const gm = boxOf(layout, 'gm')!;

    expect(gp.y).toBe(gm.y);
    expect(gm.x - gp.x).toBe(140);
    expect(gm.isSpouse).toBe(true);
    expect(gp.isSpouse).toBe(false);

    const bar = layout.connectors.find((connector) => connector.kind === 'spouse');
    expect(bar?.points).toEqual([
      { x: gp.x, y: 30 },
      { x: gm.x, y: 30 },
    ]);
  });

  it('hangs children from the middle of the partner bar', () => {
    const layout = layoutOf([
      member('gp', null, 'gm'),
      member('gm', null, 'gp'),
      member('kid', 'gp'),
    ]);

    const gp = boxOf(layout, 'gp')!;
    const gm = boxOf(layout, 'gm')!;
    const coupleCentre = (gp.x + gm.x) / 2;

    const drop = layout.connectors.find(
      (connector) => connector.kind === 'descent' && connector.points[0].x === coupleCentre,
    );

    // Starts on the bar, not below the names.
    expect(drop?.points[0].y).toBe(30);
    expect(boxOf(layout, 'kid')?.x).toBe(coupleCentre);
  });

  it('drops from under a single parent rather than through their name', () => {
    const layout = layoutOf([member('dad', null), member('kid', 'dad')]);

    const drop = layout.connectors.find((connector) => connector.kind === 'descent');

    expect(drop?.points[0].y).toBe(100);
  });

  it('skips the horizontal run when there is only one child', () => {
    const layout = layoutOf([member('dad', null), member('kid', 'dad')]);

    const horizontal = layout.connectors.filter(
      (connector) => connector.points[0].y === connector.points[1].y,
    );

    expect(horizontal).toEqual([]);
  });

  it('runs one horizontal bus across several children', () => {
    const layout = layoutOf([member('dad', null), member('a', 'dad'), member('b', 'dad')]);

    const horizontal = layout.connectors.filter(
      (connector) => connector.points[0].y === connector.points[1].y,
    );

    expect(horizontal).toHaveLength(1);
    expect(horizontal[0].points[0].x).toBe(boxOf(layout, 'a')?.x);
    expect(horizontal[0].points[1].x).toBe(boxOf(layout, 'b')?.x);
  });

  it('widens a couple’s slot so one child does not squeeze them together', () => {
    const layout = layoutOf([
      member('gp', null, 'gm'),
      member('gm', null, 'gp'),
      member('kid', 'gp'),
    ]);

    // The couple is 240 wide; the lone child must not shrink the row below that.
    expect(layout.width).toBe(240);
  });

  it('gives a wide sibling set room rather than overlapping the parents', () => {
    const layout = layoutOf([
      member('gp', null, 'gm'),
      member('gm', null, 'gp'),
      member('a', 'gp'),
      member('b', 'gp'),
      member('c', 'gp'),
    ]);

    const xs = ['a', 'b', 'c'].map((id) => boxOf(layout, id)!.x).sort((l, r) => l - r);

    expect(xs[1] - xs[0]).toBe(120);
    expect(xs[2] - xs[1]).toBe(120);
    // Three children at 100 wide with two 20 gaps is 340, which now sets the row width.
    expect(layout.width).toBe(340);
  });

  it('lays out several roots left to right without overlap', () => {
    const layout = layoutOf([member('r1', null), member('r2', null)]);

    const r1 = boxOf(layout, 'r1')!;
    const r2 = boxOf(layout, 'r2')!;

    expect(r1.y).toBe(r2.y);
    expect(r2.x - r1.x).toBeGreaterThanOrEqual(100);
  });

  describe('a second marriage', () => {
    const remarried = (): FamilyMember[] => [
      { ...member('gp', null), spouseIds: ['first', 'second'] },
      { ...member('first', null), spouseIds: ['gp'] },
      { ...member('second', null), spouseIds: ['gp'] },
      { ...member('a', 'gp'), otherParentId: 'first' },
      { ...member('b', 'gp'), otherParentId: 'second' },
    ];

    it('lines the partners up beside the shared parent', () => {
      const layout = layoutOf(remarried());
      const [gp, first, second] = ['gp', 'first', 'second'].map((id) => boxOf(layout, id)!);

      expect([first.y, second.y]).toEqual([gp.y, gp.y]);
      expect(first.x - gp.x).toBe(140);
      expect(second.x - first.x).toBe(140);
    });

    it('joins every bar to the shared parent, never one partner to another', () => {
      const layout = layoutOf(remarried());
      const gp = boxOf(layout, 'gp')!;
      const bars = layout.connectors.filter((connector) => connector.kind === 'spouse');

      expect(bars).toHaveLength(2);
      bars.forEach((bar) => {
        expect(bar.points.some((point) => point.x === gp.x)).toBe(true);
      });
    });

    it('arcs a second marriage above the heads instead of across them', () => {
      const layout = layoutOf(remarried());
      const gp = boxOf(layout, 'gp')!;
      const [firstBar, secondBar] = layout.connectors.filter(
        (connector) => connector.kind === 'spouse',
      );

      // The first is the classic straight bar between two avatars.
      expect(firstBar.points).toHaveLength(2);
      expect(firstBar.points[0].y).toBe(firstBar.points[1].y);

      // The second goes up, across above the row, and back down.
      expect(secondBar.points).toHaveLength(4);
      expect(secondBar.points[1].y).toBeLessThan(gp.y);
      expect(secondBar.points[2].y).toBeLessThan(gp.y);
    });

    it('leaves room above the top row for the raised bars', () => {
      // Without it the arc is drawn off the top of the canvas and simply not seen.
      expect(boxOf(layoutOf(remarried()), 'gp')!.y).toBeGreaterThan(0);
    });

    it('gives the slot enough width for three people', () => {
      // Three at 100 with two 40 gaps.
      expect(layoutOf(remarried()).width).toBe(380);
    });

    it('descends the first marriage from the couple bar and the rest from their own partner', () => {
      const layout = layoutOf(remarried());
      const gp = boxOf(layout, 'gp')!;
      const first = boxOf(layout, 'first')!;
      const second = boxOf(layout, 'second')!;

      const dropAt = (x: number, y: number) =>
        layout.connectors.find(
          (connector) =>
            connector.kind === 'descent' &&
            connector.points[0].x === x &&
            connector.points[0].y === y,
        );

      // Half-siblings descend from different places, and neither place is another person's box.
      expect(dropAt((gp.x + first.x) / 2, gp.y + 30)).toBeDefined();
      expect(dropAt(second.x, gp.y + 100)).toBeDefined();
    });

    it('keeps a third marriage clear of everyone else', () => {
      const thrice: FamilyMember[] = [
        { ...member('gp', null), spouseIds: ['w1', 'w2', 'w3'] },
        { ...member('w1', null), spouseIds: ['gp'] },
        { ...member('w2', null), spouseIds: ['gp'] },
        { ...member('w3', null), spouseIds: ['gp'] },
        { ...member('a', 'gp'), otherParentId: 'w1' },
        { ...member('b', 'gp'), otherParentId: 'w2' },
        { ...member('c', 'gp'), otherParentId: 'w3' },
      ];
      const layout = layoutOf(thrice);
      const xs = new Map(layout.boxes.map((box) => [box.member.id, box.x]));

      const drops = layout.connectors
        .filter((connector) => connector.kind === 'descent')
        .filter((connector) => connector.points[0].x === connector.points[1].x)
        .map((connector) => connector.points[0].x);

      // Each marriage descends from somewhere of its own...
      expect(new Set(drops).size).toBeGreaterThanOrEqual(3);

      // ...and no descent starts on top of a partner who is not that marriage's own.
      expect(drops).not.toContain(xs.get('w1'));
      expect(drops).not.toContain(xs.get('gp'));

      // The bars stack rather than sharing a line, so three marriages stay countable.
      const barHeights = layout.connectors
        .filter((connector) => connector.kind === 'spouse')
        .map((connector) => Math.min(...connector.points.map((point) => point.y)));

      expect(new Set(barHeights).size).toBe(3);
    });

    it('treats an unrecorded second parent as the only partner when there is one', () => {
      // Every tree built before the field existed looks like this, and its children still belong
      // to the couple rather than to one parent alone.
      const single: FamilyMember[] = [
        { ...member('gp', null), spouseIds: ['gm'] },
        { ...member('gm', null), spouseIds: ['gp'] },
        member('kid', 'gp'),
      ];
      const layout = layoutOf(single);
      const centre = (boxOf(layout, 'gp')!.x + boxOf(layout, 'gm')!.x) / 2;

      const barDrop = layout.connectors.find(
        (connector) => connector.points[0].x === centre && connector.points[0].y === 30,
      );

      expect(barDrop).toBeDefined();
    });
  });

  describe('packing sibling branches', () => {
    /** Every pair of boxes sharing a row, closest first. */
    const tightestGap = (layout: ReturnType<typeof layoutOf>): number => {
      const rows = new Map<number, number[]>();
      layout.boxes.forEach((box) => rows.set(box.y, [...(rows.get(box.y) ?? []), box.x]));

      let closest = Infinity;
      rows.forEach((xs) => {
        const sorted = [...xs].sort((left, right) => left - right);
        for (let i = 1; i < sorted.length; i += 1) {
          closest = Math.min(closest, sorted[i] - sorted[i - 1]);
        }
      });

      return closest;
    };

    /**
     * Two branches whose outlines interlock: one carries its line down the left, the other down
     * the right. Reserving a rectangle per branch cannot exploit that; comparing outlines can.
     */
    const interlocking = (): FamilyMember[] => {
      const members = [member('root', null), member('L', 'root'), member('R', 'root')];
      let left = 'L';
      let right = 'R';

      for (let i = 0; i < 4; i += 1) {
        members.push(member(`l${i}`, left), member(`lpad${i}`, left));
        left = `l${i}`;
        members.push(member(`rpad${i}`, right), member(`r${i}`, right));
        right = `r${i}`;
      }

      return members;
    };

    it('never lets two boxes on a row come closer than one node plus the gap', () => {
      // The thing packing could plausibly break, checked on the shape most likely to break it.
      expect(tightestGap(layoutOf(interlocking()))).toBe(120);
    });

    it('tucks a shallow branch under the overhang of a deep one', () => {
      const layout = layoutOf(interlocking());

      /*
       * Under the replaced rule — width = max(own, sum of children) — a long chain under one child
       * inflated the block of every ancestor, so siblings were pushed apart at every level, even
       * ones where nothing sat between them. Every row grew by a node width over the row above it.
       *
       * The numbers below are what the packed layout produces. The block rule gave 1180 for the
       * same fixture. Neither is the theoretical optimum — the outlines above genuinely do keep
       * these branches apart — but the overhang is no longer paid for at every level on the way
       * down.
       */
      const deepest = Math.max(...layout.boxes.map((entry) => entry.depth));
      const bottom = layout.boxes.filter((box) => box.depth === deepest);
      const span = Math.max(...bottom.map((b) => b.x)) - Math.min(...bottom.map((b) => b.x));

      expect(bottom).toHaveLength(4);
      expect(span).toBe(720);
      expect(layout.width).toBe(820);
    });

    it('leaves a uniform tree exactly where it was', () => {
      // Where every branch has the same silhouette there is nothing to tuck, and the packed result
      // must match what the simple rule already produced.
      const balanced = [
        member('r', null),
        member('a', 'r'),
        member('b', 'r'),
        member('a1', 'a'),
        member('a2', 'a'),
        member('b1', 'b'),
        member('b2', 'b'),
      ];
      const layout = layoutOf(balanced);

      expect(layout.width).toBe(460);
      expect(boxOf(layout, 'r')?.x).toBe(230);
      expect(tightestGap(layout)).toBe(120);
    });

    it('keeps separate roots further apart than siblings', () => {
      const layout = layoutOf([member('r1', null), member('r2', null)]);
      const gap = boxOf(layout, 'r2')!.x - boxOf(layout, 'r1')!.x;

      // Two families that are not related should not read as two siblings.
      expect(gap).toBeGreaterThan(120);
    });
  });

  it('places every member exactly once, partners included', () => {
    const layout = layoutOf([
      member('gp', null, 'gm'),
      member('gm', null, 'gp'),
      member('dad', 'gp', 'mum'),
      member('mum', null, 'dad'),
      member('me', 'dad'),
    ]);

    expect(layout.boxes).toHaveLength(5);
    expect(new Set(layout.boxes.map((box) => box.member.id)).size).toBe(5);
    expect(boxOf(layout, 'mum')?.depth).toBe(1);
    expect(boxOf(layout, 'me')?.depth).toBe(2);
  });
});
