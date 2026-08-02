import React, { useEffect, useRef } from 'react';
/*
 * Named imports rather than `import * as THREE`, for readability only.
 *
 * Worth recording so nobody spends the afternoon I did on it: switching from the namespace import
 * to these named ones changed the built chunk by zero bytes — same size, same hash. `WebGLRenderer`
 * reaches most of the library on its own, so there is nothing for tree-shaking to drop. The 136 kB
 * gzipped is the price of rendering with three.js, and the only lever that matters is the lazy
 * boundary in `index.tsx` that keeps this chunk off every other page.
 */
import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  type Material,
  PerspectiveCamera,
  Raycaster,
  SRGBColorSpace,
  Scene,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { layoutFamilyTree3D } from '../../../lib/tools/familyTreeLayout';
import { prefersReducedMotion } from '../../../lib/platform/motion';
import type { FamilyNode } from '../../../lib/tools/familyTree';

interface FamilySceneProps {
  roots: FamilyNode[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const LABEL_WIDTH = 2.6;
const LABEL_HEIGHT = 0.85;

/** Canvas pixels per world unit. Fixed rather than DPR-scaled so a zoomed-in label stays sharp. */
const LABEL_RESOLUTION = 128;

interface LabelColors {
  background: string;
  border: string;
  text: string;
  subtext: string;
}

/**
 * Draws a member's card into a canvas and hands back a texture.
 *
 * Labels are canvas textures on sprites rather than `TextGeometry`, because the names in this tool
 * are usually Thai. `TextGeometry` needs a typeface JSON with the glyphs baked in, and a Thai font
 * covering the combining vowels and tone marks is far larger than the whole rest of this bundle.
 * A 2D canvas just uses the font the browser already has, and gets shaping for free.
 *
 * Sprites also always face the camera, which is what makes the tree readable from any angle once
 * the user starts orbiting.
 */
const drawLabel = (
  name: string,
  detail: string,
  colors: LabelColors,
  isSelected: boolean,
): CanvasTexture | null => {
  const canvas = document.createElement('canvas');
  canvas.width = LABEL_WIDTH * LABEL_RESOLUTION;
  canvas.height = LABEL_HEIGHT * LABEL_RESOLUTION;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const radius = 16;
  const { width, height } = canvas;

  ctx.beginPath();
  ctx.roundRect(2, 2, width - 4, height - 4, radius);
  ctx.fillStyle = colors.background;
  ctx.fill();
  ctx.lineWidth = isSelected ? 6 : 2;
  ctx.strokeStyle = isSelected ? colors.text : colors.border;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = colors.text;
  ctx.font = '600 30px system-ui, -apple-system, "Noto Sans Thai", sans-serif';
  ctx.fillText(name || 'Untitled', width / 2, detail ? height / 2 - 2 : height / 2 + 10, width - 24);

  if (detail) {
    ctx.fillStyle = colors.subtext;
    ctx.font = '400 22px system-ui, -apple-system, "Noto Sans Thai", sans-serif';
    ctx.fillText(detail, width / 2, height / 2 + 30, width - 24);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
};

const readColors = (): LabelColors => {
  const isDark = document.documentElement.classList.contains('dark');

  return isDark
    ? {
        background: '#1e293b',
        border: '#475569',
        text: '#e2e8f0',
        subtext: '#94a3b8',
        }
    : {
        background: '#ffffff',
        border: '#cbd5e1',
        text: '#0f172a',
        subtext: '#64748b',
      };
};

interface SceneHandle {
  sprites: Sprite[];
  colors: LabelColors;
  render: () => void;
}

export const FamilyScene: React.FC<FamilySceneProps> = ({ roots, selectedId, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // The click handler is rebuilt on every render; the scene effect must not be.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  /**
   * Selection repaints two labels; it does not rebuild the scene.
   *
   * Keying the build effect on `selectedId` as well was the obvious thing to write and it made
   * the tool unusable: every click tore down the renderer and put the camera back at its opening
   * position, so choosing a node threw away whatever angle the user had just orbited to.
   */
  const sceneRef = useRef<SceneHandle | null>(null);
  const paintedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const layout = layoutFamilyTree3D(roots);
    if (layout.nodes.length === 0) return;

    const colors = readColors();
    const isDark = document.documentElement.classList.contains('dark');

    const scene = new Scene();
    const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // Everything created below is tracked so the cleanup can dispose it. Three.js holds GPU
    // memory that garbage collection cannot reach, so leaving this out leaks a buffer per edit.
    const materials: Material[] = [];
    const geometries: BufferGeometry[] = [];

    const sprites: Sprite[] = [];
    const positionsById = new Map(
      layout.nodes.map((node) => [node.member.id, new Vector3(node.x, node.y, node.z)]),
    );

    for (const node of layout.nodes) {
      const detail = [node.member.relationship, node.member.note].filter(Boolean).join(' · ');
      const texture = drawLabel(node.member.name, detail, colors, false);
      if (!texture) continue;

      const material = new SpriteMaterial({ map: texture, transparent: true });
      const sprite = new Sprite(material);
      sprite.position.set(node.x, node.y, node.z);
      sprite.scale.set(LABEL_WIDTH, LABEL_HEIGHT, 1);
      // Kept so the selection effect can repaint this label without consulting the tree again.
      sprite.userData.memberId = node.member.id;
      sprite.userData.name = node.member.name;
      sprite.userData.detail = detail;

      scene.add(sprite);
      sprites.push(sprite);
      materials.push(material);
    }

    if (layout.edges.length > 0) {
      const points: number[] = [];
      for (const edge of layout.edges) {
        const from = positionsById.get(edge.from);
        const to = positionsById.get(edge.to);
        if (!from || !to) continue;
        points.push(from.x, from.y, from.z, to.x, to.y, to.z);
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
      const material = new LineBasicMaterial({
        color: isDark ? 0x64748b : 0x94a3b8,
        transparent: true,
        opacity: 0.8,
      });

      scene.add(new LineSegments(geometry, material));
      geometries.push(geometry);
      materials.push(material);
    }

    // Frame the whole tree: back off far enough that the widest ring and the deepest generation
    // both fit, whatever the shape of the family.
    const centreY = -layout.height / 2;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, centreY, 0);
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 200;
    // Damping needs a continuous animation loop to settle; without it the scene can render only
    // when something actually changes, which costs nothing while the user reads.
    controls.enableDamping = false;
    controls.autoRotate = !prefersReducedMotion() && layout.nodes.length > 1;
    controls.autoRotateSpeed = 0.6;

    const distance = Math.max(layout.radius * 2.6, layout.height * 1.6, 8);
    camera.position.set(distance * 0.55, centreY + layout.height * 0.5 + 3, distance * 0.75);
    controls.update();

    const render = () => renderer.render(scene, camera);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;

      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      render();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    controls.addEventListener('change', render);

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      controls.update();
    };

    // Only spin up a loop when there is something to animate. `controls.update()` fires 'change',
    // which drives the render.
    if (controls.autoRotate) tick();

    const stopAutoRotate = () => {
      if (!controls.autoRotate) return;
      controls.autoRotate = false;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const raycaster = new Raycaster();
    const pointer = new Vector2();

    const handlePointerDown = (event: PointerEvent) => {
      // Any deliberate interaction ends the tour; fighting a rotating scene is miserable.
      stopAutoRotate();

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(sprites, false)[0];
      onSelectRef.current(hit ? (hit.object.userData.memberId as string) : null);
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    sceneRef.current = { sprites, colors, render };
    paintedIdRef.current = null;

    return () => {
      sceneRef.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.removeEventListener('change', render);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();

      // Read the map off each sprite rather than from a list captured at build time: selection
      // swaps in a fresh texture, and the one built here is long gone by then.
      sprites.forEach((sprite) => (sprite.material as SpriteMaterial).map?.dispose());
      materials.forEach((material) => material.dispose());
      geometries.forEach((geometry) => geometry.dispose());

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [roots]);

  useEffect(() => {
    const handle = sceneRef.current;
    if (!handle) return;

    const repaint = (sprite: Sprite, isSelected: boolean) => {
      const material = sprite.material as SpriteMaterial;
      const texture = drawLabel(
        sprite.userData.name as string,
        sprite.userData.detail as string,
        handle.colors,
        isSelected,
      );
      if (!texture) return;

      // The outgoing texture holds GPU memory of its own, so it goes before the swap.
      material.map?.dispose();
      material.map = texture;
      material.needsUpdate = true;
    };

    for (const sprite of handle.sprites) {
      const id = sprite.userData.memberId as string;
      const wasSelected = id === paintedIdRef.current;
      const isSelected = id === selectedId;
      if (wasSelected !== isSelected) repaint(sprite, isSelected);
    }

    paintedIdRef.current = selectedId;
    handle.render();
  }, [selectedId, roots]);

  return (
    <div
      ref={containerRef}
      className="h-[420px] w-full cursor-grab overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-muted/20 to-transparent active:cursor-grabbing"
      role="img"
      aria-label="Family tree in three dimensions. The list below carries the same information."
    />
  );
};

export default FamilyScene;
