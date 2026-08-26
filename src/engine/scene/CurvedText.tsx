import React, { useEffect, useRef, useState } from 'react';
import type { SceneTextStyle } from './elementTypes';

interface CurvedTextProps {
  text: string;
  style: SceneTextStyle;
  pathId: string;
  className?: string;
}

export const CurvedText: React.FC<CurvedTextProps> = ({
  text,
  style,
  pathId,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 320,
    height: 140,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth || 320;
      const h = el.clientHeight || Math.max(100, (style.fontSize || 24) * 3);
      setDimensions((prev) => {
        if (Math.abs(prev.width - w) > 2 || Math.abs(prev.height - h) > 2) {
          return { width: Math.max(120, w), height: Math.max(60, h) };
        }
        return prev;
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [style.fontSize]);

  const curvature = style.curvature ?? 0;
  const fontSize = style.fontSize || 24;

  // Process text transformations
  let processedText = text;
  if (style.textTransform === 'uppercase') {
    processedText = text.toUpperCase();
  } else if (style.textTransform === 'lowercase') {
    processedText = text.toLowerCase();
  }

  const { width, height } = dimensions;
  const normC = Math.max(-100, Math.min(100, curvature));

  // Determine angle and geometry based on curvature
  const theta = (Math.abs(normC) / 100) * (1.85 * Math.PI);
  const chordWidth = Math.max(80, width * 0.88);
  const radius = chordWidth / Math.max(0.001, theta);

  const cx = width / 2;
  let pathD = '';
  const largeArc = theta > Math.PI ? 1 : 0;

  if (normC > 0) {
    // Arching UPWARDS (rainbow ⌒)
    // Top of the circle sits near top of container
    const topMargin = Math.max(12, fontSize * 0.75);
    const cy = topMargin + radius;

    const x1 = cx - radius * Math.sin(theta / 2);
    const y1 = cy - radius * Math.cos(theta / 2);
    const x2 = cx + radius * Math.sin(theta / 2);
    const y2 = cy - radius * Math.cos(theta / 2);

    // Clockwise arc over the top of the circle
    pathD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  } else {
    // Arching DOWNWARDS (smile ‿)
    // Bottom of the circle sits near bottom/middle of container
    const bottomMargin = Math.max(12, fontSize * 0.75);
    const targetBottom = Math.max(height - bottomMargin, fontSize * 2);
    const cy = targetBottom - radius;

    const x1 = cx - radius * Math.sin(theta / 2);
    const y1 = cy + radius * Math.cos(theta / 2);
    const x2 = cx + radius * Math.sin(theta / 2);
    const y2 = cy + radius * Math.cos(theta / 2);

    // Counter-clockwise arc along bottom of circle (sweep=0 keeps glyphs upright)
    pathD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius.toFixed(2)} ${radius.toFixed(2)} 0 ${largeArc} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }

  const textAnchor =
    style.textAlign === 'center'
      ? 'middle'
      : style.textAlign === 'right'
        ? 'end'
        : 'start';

  const startOffset =
    style.textAlign === 'center'
      ? '50%'
      : style.textAlign === 'right'
        ? '100%'
        : '0%';

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[48px] overflow-visible ${className}`}
      style={{
        minHeight: Math.max(48, fontSize * 1.6),
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible pointer-events-none"
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          <path id={pathId} d={pathD} fill="none" />
        </defs>
        <text
          fill={style.color || '#111827'}
          fontFamily={style.fontFamily || '"Quicksand", sans-serif'}
          fontSize={fontSize}
          fontWeight={style.fontWeight || 400}
          letterSpacing={style.letterSpacing ? `${style.letterSpacing}px` : undefined}
          fontStyle={style.fontStyle || 'normal'}
          textDecoration={style.textDecoration || 'none'}
          textAnchor={textAnchor}
          dominantBaseline="central"
          style={{
            filter: style.textShadow
              ? `drop-shadow(${style.textShadow.split(',')[0].trim()})`
              : undefined,
          }}
        >
          <textPath
            href={`#${pathId}`}
            xlinkHref={`#${pathId}`}
            startOffset={startOffset}
          >
            {processedText}
          </textPath>
        </text>
      </svg>
    </div>
  );
};
