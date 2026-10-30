import { useMemo } from 'react';
import { useBrandMark } from '../lib/brandLocal';

/** A Refactoring hand-drawn mark, drawn on by the brand runtime at time tMs (seek-safe). */
export const BrandMark: React.FC<{
  name: string;
  tMs: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
}> = ({ name, tMs, color, x, y, width, height, rotate = 0 }) => {
  const mark = useBrandMark(name);
  const svg = useMemo(() => {
    if (!mark || tMs <= 0) return '';
    return mark.runtime
      .frameSVG(mark.spec, tMs, { color, id: `${name}-mark`, width: '100%', height: '100%' })
      .replace('<svg ', '<svg preserveAspectRatio="none" style="display:block;overflow:visible" ');
  }, [mark, tMs, color, name]);
  if (!svg) return null;
  return (
    <div
      style={{ position: 'absolute', left: x, top: y, width, height, transform: `rotate(${rotate}deg)`, pointerEvents: 'none' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};
