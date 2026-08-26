import React from 'react';
import type { SceneImageStyle } from './elementTypes';
import { getImageShapeDefinition, getStrokeDashArray } from './imageShapeUtils';

export interface ImageShapeRendererProps {
  src?: string;
  alt?: string;
  style?: SceneImageStyle;
  placeholder?: React.ReactNode;
  className?: string;
  isEditor?: boolean;
}

export const ImageShapeRenderer: React.FC<ImageShapeRendererProps> = ({
  src,
  alt = '',
  style,
  placeholder,
  className = '',
  isEditor = false,
}) => {
  const currentStyle: SceneImageStyle = style || {};
  const shape = currentStyle.shape || 'rectangle';
  const shapeDef = getImageShapeDefinition(shape);
  const isPolygon = Boolean(shapeDef.isPolygon && shapeDef.clipPath);
  const borderWidth = currentStyle.borderWidth || 0;
  const borderColor = currentStyle.borderColor || '#ffffff';
  const borderStyle = currentStyle.borderStyle || 'solid';
  const borderRadius =
    shape === 'circle'
      ? 9999
      : (currentStyle.borderRadius ?? 0);

  const dashArray = getStrokeDashArray(borderStyle, borderWidth);

  // Common container styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    boxShadow: currentStyle.boxShadow,
    opacity: currentStyle.opacity ?? 1,
    overflow: isPolygon ? 'visible' : 'hidden',
  };

  // If not polygon, use native CSS border and background
  if (!isPolygon) {
    containerStyle.borderRadius = borderRadius;
    containerStyle.backgroundColor = currentStyle.background || 'transparent';
    if (borderWidth > 0 && borderStyle !== 'none') {
      containerStyle.borderWidth = borderWidth;
      containerStyle.borderStyle = borderStyle;
      containerStyle.borderColor = borderColor;
      containerStyle.boxSizing = 'border-box';
    }
  }

  const innerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: isPolygon ? currentStyle.background || 'transparent' : undefined,
    clipPath: isPolygon ? shapeDef.clipPath : undefined,
    WebkitClipPath: isPolygon ? shapeDef.clipPath : undefined,
    borderRadius: !isPolygon ? borderRadius : undefined,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: currentStyle.objectFit || 'contain',
    display: 'block',
    userSelect: 'none',
  };

  return (
    <div style={containerStyle} className={`select-none ${className}`}>
      <div style={innerStyle}>
        {src ? (
          <img
            src={src}
            alt={alt}
            draggable={false}
            style={imgStyle}
            className="h-full w-full"
          />
        ) : (
          placeholder || (
            <div className="flex h-full w-full items-center justify-center p-2 text-center text-[10px] font-bold text-black/30">
              Chọn ảnh từ kho tài nguyên
            </div>
          )
        )}
      </div>

      {/* SVG Stroke Overlay for Polygon Shapes */}
      {isPolygon && borderWidth > 0 && borderStyle !== 'none' && shapeDef.svgPolygonPoints && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            filter: currentStyle.boxShadow ? `drop-shadow(${currentStyle.boxShadow})` : undefined,
          }}
        >
          <polygon
            points={shapeDef.svgPolygonPoints}
            fill="none"
            stroke={borderColor}
            strokeWidth={borderWidth}
            vectorEffect="non-scaling-stroke"
            strokeDasharray={dashArray}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
};
