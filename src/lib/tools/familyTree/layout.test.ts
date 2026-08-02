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
  spouseId,
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
