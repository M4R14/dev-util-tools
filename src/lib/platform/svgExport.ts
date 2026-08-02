/**
 * Turning a rendered `<svg>` into a file the owner can keep.
 *
 * The catch this solves: the diagram is styled with CSS classes, and a serialised SVG carries none
 * of the stylesheet with it. Opened anywhere but this page it would be black shapes on nothing —
 * every fill, stroke and font resolved to a default. So the computed value of the handful of
 * properties that matter is copied onto each element as an attribute before serialising.
 */
import { downloadBlob } from './download';

const PAINTED_PROPERTIES = [
  'fill',
  'stroke',
  'stroke-width',
  'font-size',
  'font-family',
  'font-weight',
  'text-anchor',
  'opacity',
] as const;

const inlineComputedStyles = (source: Element, target: Element) => {
  const computed = getComputedStyle(source);

  for (const property of PAINTED_PROPERTIES) {
    const value = computed.getPropertyValue(property);
    if (value) target.setAttribute(property, value);
  }

  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);

  sourceChildren.forEach((child, index) => {
    const twin = targetChildren[index];
    if (twin) inlineComputedStyles(child, twin);
  });
};

/** A standalone SVG document string, safe to open on its own. */
export const serializeSvg = (svg: SVGSVGElement): string => {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  inlineComputedStyles(svg, clone);

  // Classes are dead weight once the values are inlined, and they invite the reader to think a
  // stylesheet is still involved.
  clone.querySelectorAll('[class]').forEach((element) => element.removeAttribute('class'));
  clone.removeAttribute('class');

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const { width, height } = svg.viewBox.baseVal;
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
};

export const downloadSvg = (svg: SVGSVGElement, filename: string) => {
  downloadBlob(new Blob([serializeSvg(svg)], { type: 'image/svg+xml' }), filename);
};

/**
 * Rasterises at 2× so the result survives being dropped into a document or a chat.
 *
 * The background is painted explicitly: SVG has none, and a transparent PNG viewed on a dark
 * surface shows dark text on dark.
 */
export const downloadPng = async (
  svg: SVGSVGElement,
  filename: string,
  background: string,
  scale = 2,
): Promise<void> => {
  const { width, height } = svg.viewBox.baseVal;
  const source = serializeSvg(svg);
  const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }));

  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The diagram could not be rasterised.'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser did not provide a 2D canvas.');

    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('The image could not be encoded.');

    downloadBlob(blob, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
};
