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

    it('puts the shared parent between their partners', () => {
      const layout = layoutOf(remarried());
      const [first, gp, second] = ['first', 'gp', 'second'].map((id) => boxOf(layout, id)!);

      expect([first.y, gp.y, second.y]).toEqual([0, 0, 0]);
      /*
       * Left to right: first partner, the shared parent, second partner. With the parent at one
       * end the second bar joined two partners to each other, and that marriage's children dropped
       * out of the first partner's head.
       */
      expect(gp.x - first.x).toBe(140);
      expect(second.x - gp.x).toBe(140);
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

    it('gives the slot enough width for three people', () => {
      // Three at 100 with two 40 gaps.
      expect(layoutOf(remarried()).width).toBe(380);
    });

    it('hangs each child from the bar of the marriage they belong to', () => {
      const layout = layoutOf(remarried());
      const gp = boxOf(layout, 'gp')!;
      const first = boxOf(layout, 'first')!;
      const second = boxOf(layout, 'second')!;

      const dropFrom = (x: number) =>
        layout.connectors.find(
          (connector) =>
            connector.kind === 'descent' &&
            connector.points[0].x === x &&
            connector.points[0].y === 30,
        );

      // This is the whole point: half-siblings descend from different bars.
      expect(dropFrom((gp.x + first.x) / 2)).toBeDefined();
      expect(dropFrom((gp.x + second.x) / 2)).toBeDefined();
    });

    it('drops a child of no recorded marriage from under the holder alone', () => {
      const layout = layoutOf([...remarried(), member('c', 'gp')]);
      const gp = boxOf(layout, 'gp')!;

      const holderDrop = layout.connectors.find(
        (connector) =>
          connector.kind === 'descent' &&
          connector.points[0].x === gp.x &&
          connector.points[0].y === 100,
      );

      expect(holderDrop).toBeDefined();
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
