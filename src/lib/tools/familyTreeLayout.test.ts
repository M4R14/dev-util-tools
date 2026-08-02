import { describe, expect, it } from 'vitest';
import { buildHierarchy, type FamilyMember } from './familyTree';
import { layoutFamilyTree3D } from './familyTreeLayout';

const member = (id: string, parentId: string | null): FamilyMember => ({
  id,
  name: id,
  parentId,
  relationship: '',
  note: '',
});

const layoutOf = (members: FamilyMember[]) =>
  layoutFamilyTree3D(buildHierarchy(members).roots, {
    levelHeight: 10,
    arcSpacing: 1,
    ringGap: 100,
  });

const positionOf = (layout: ReturnType<typeof layoutOf>, id: string) =>
  layout.nodes.find((node) => node.member.id === id);

/** Angle around the Y axis, so assertions can talk about where a node sits on its ring. */
const angleOf = (node: { x: number; z: number }) => Math.atan2(node.z, node.x);

describe('layoutFamilyTree3D', () => {
  it('returns nothing for an empty tree', () => {
    expect(layoutFamilyTree3D([])).toEqual({ nodes: [], edges: [], radius: 0, height: 0 });
  });

  it('places a lone member on the axis rather than out on a ring', () => {
    const layout = layoutOf([member('solo', null)]);

    expect(layout.radius).toBe(0);
    expect(positionOf(layout, 'solo')).toMatchObject({ x: 0, y: 0, z: 0 });
  });

  it('keeps a single branch on the axis, stacked by generation', () => {
    const chain = [member('a', null), member('b', 'a'), member('c', 'b')];
    const layout = layoutOf(chain);

    // One leaf means one slot: nothing to spread apart.
    expect(layout.radius).toBe(0);
    expect(positionOf(layout, 'a')?.y).toBe(0);
    expect(positionOf(layout, 'b')?.y).toBe(-10);
    expect(positionOf(layout, 'c')?.y).toBe(-20);
  });

  it('drops each generation by the level height', () => {
    const layout = layoutOf([
      member('gp', null),
      member('dad', 'gp'),
      member('me', 'dad'),
      member('sister', 'dad'),
    ]);

    expect(positionOf(layout, 'gp')?.depth).toBe(0);
    expect(positionOf(layout, 'me')?.y).toBe(-20);
    expect(layout.height).toBe(20);
  });

  it('spreads siblings around a ring at one radius', () => {
    const layout = layoutOf([
      member('root', null),
      member('a', 'root'),
      member('b', 'root'),
      member('c', 'root'),
      member('d', 'root'),
    ]);

    const radii = ['a', 'b', 'c', 'd'].map((id) => {
      const node = positionOf(layout, id);
      return Math.hypot(node?.x ?? 0, node?.z ?? 0);
    });

    // One generation, one ring.
    radii.forEach((radius) => expect(radius).toBeCloseTo(100, 6));
    // Four leaves over a full turn.
    expect(angleOf(positionOf(layout, 'a')!)).toBeCloseTo(0, 6);
    expect(angleOf(positionOf(layout, 'b')!)).toBeCloseTo(Math.PI / 2, 6);
  });

  it('stands a lone ancestor at the apex instead of on their children’s ring', () => {
    const layout = layoutOf([
      member('root', null),
      member('a', 'root'),
      member('b', 'root'),
      member('c', 'root'),
    ]);
    const root = positionOf(layout, 'root')!;

    expect(Math.hypot(root.x, root.z)).toBe(0);
    expect(Math.hypot(positionOf(layout, 'a')!.x, positionOf(layout, 'a')!.z)).toBeCloseTo(100, 6);
  });

  it('widens the ring with every generation', () => {
    const layout = layoutOf([
      member('gp', null),
      member('dad', 'gp'),
      member('aunt', 'gp'),
      member('me', 'dad'),
    ]);

    const radiusOf = (id: string) => {
      const node = positionOf(layout, id)!;
      return Math.hypot(node.x, node.z);
    };

    expect(radiusOf('gp')).toBe(0);
    expect(radiusOf('dad')).toBeCloseTo(100, 6);
    expect(radiusOf('me')).toBeCloseTo(200, 6);
  });

  it('pushes a crowded generation past the cone so its members keep their spacing', () => {
    const wide = [
      member('root', null),
      ...Array.from({ length: 40 }, (_, i) => member(`c${i}`, 'root')),
    ];
    const layout = layoutFamilyTree3D(buildHierarchy(wide).roots, {
      arcSpacing: 3,
      ringGap: 1,
    });

    // 40 members × 3 units of arc wrapped into a circle, which beats one ring gap.
    expect(layout.radius).toBeCloseTo((40 * 3) / (2 * Math.PI), 6);
  });

  it('centres a parent on the arc its children occupy', () => {
    const layout = layoutOf([
      member('root', null),
      member('dad', 'root'),
      member('me', 'dad'),
      member('sister', 'dad'),
    ]);

    const me = angleOf(positionOf(layout, 'me')!);
    const sister = angleOf(positionOf(layout, 'sister')!);
    const dad = angleOf(positionOf(layout, 'dad')!);

    expect(dad).toBeCloseTo((me + sister) / 2, 6);
  });

  it('emits one edge per parent-child link', () => {
    const layout = layoutOf([
      member('gp', null),
      member('dad', 'gp'),
      member('me', 'dad'),
      member('sister', 'dad'),
    ]);

    expect(layout.edges).toEqual([
      { from: 'gp', to: 'dad' },
      { from: 'dad', to: 'me' },
      { from: 'dad', to: 'sister' },
    ]);
  });

  it('positions every member exactly once, including separate roots', () => {
    const twoRoots = [
      member('r1', null),
      member('r1a', 'r1'),
      member('r2', null),
      member('r2a', 'r2'),
    ];
    const layout = layoutOf(twoRoots);

    expect(layout.nodes).toHaveLength(4);
    expect(new Set(layout.nodes.map((node) => node.member.id)).size).toBe(4);
  });

  it('gives two roots different angles rather than stacking them', () => {
    const layout = layoutOf([member('r1', null), member('r2', null)]);

    expect(angleOf(positionOf(layout, 'r1')!)).not.toBeCloseTo(
      angleOf(positionOf(layout, 'r2')!),
      6,
    );
  });

  it('lays out a member orphaned by a missing parent alongside the real roots', () => {
    const layout = layoutOf([member('root', null), member('lost', 'gone')]);

    expect(layout.nodes).toHaveLength(2);
    expect(positionOf(layout, 'lost')?.depth).toBe(0);
  });
});
