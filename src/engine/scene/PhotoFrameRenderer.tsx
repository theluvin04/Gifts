import React from 'react';
import type { ScenePhotoFrameElement, ScenePhotoFrameStyle } from './elementTypes';
import { resolvePhotoFrameStyle } from './photoFramePresets';

export interface PhotoFrameRendererProps {
  element: ScenePhotoFrameElement;
  device?: 'desktop' | 'mobile';
  isEditor?: boolean;
  onSelectPhotoSlot?: (slotIndex: number) => void;
  className?: string;
}

export const PhotoFrameRenderer: React.FC<PhotoFrameRendererProps> = ({
  element,
  device = 'desktop',
  isEditor = false,
  onSelectPhotoSlot,
  className = '',
}) => {
  const isMobile = device === 'mobile';
  const style: ScenePhotoFrameStyle = resolvePhotoFrameStyle(
    isMobile
      ? {
          ...element.frameStyle,
          ...element.mobileFrameStyle,
        }
      : element.frameStyle
  );

  const mainSource = isMobile
    ? element.mobileSrc || element.src
    : element.src;

  const rawPhotos = isMobile
    ? element.mobilePhotos || element.photos || []
    : element.photos || [];

  const caption = isMobile
    ? element.mobileCaption ?? element.caption ?? ''
    : element.caption || '';

  const layout = style.layout || (style.preset?.includes('4') ? 'strip-vertical-4' : style.preset?.includes('3') ? 'strip-vertical-3' : style.preset === 'polaroid-grid-4' ? 'grid-2x2' : 'single');
  const isMultiPhoto = layout === 'strip-vertical-4' || layout === 'strip-vertical-3' || layout === 'grid-2x2';
  const count = layout === 'strip-vertical-4' || layout === 'grid-2x2' ? 4 : layout === 'strip-vertical-3' ? 3 : 1;

  // Build slots array
  const photoSlots: string[] = [];
  for (let i = 0; i < count; i++) {
    photoSlots.push(rawPhotos[i] || (i === 0 ? mainSource : ''));
  }

  const padding = Math.max(2, style.paddingPercent ?? 4);
  const gap = Math.max(1, style.gapPercent ?? 2.5);
  const captionArea = caption || isEditor ? Math.max(6, style.captionAreaPercent ?? 8) : 0;

  // Outer frame container style
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: `${padding}%`,
    paddingBottom: captionArea > 0 ? `${Math.max(padding, padding * 0.8)}%` : `${padding}%`,
    backgroundColor: style.background || '#7e192a',
    borderRadius: style.outerRadius ?? 6,
    boxShadow: style.boxShadow || '0 20px 45px -4px rgba(50, 10, 18, 0.45), 0 8px 18px rgba(0, 0, 0, 0.22)',
    boxSizing: 'border-box',
    overflow: 'hidden',
    userSelect: 'none',
  };

  // Render single photo layout (classic Polaroid)
  if (!isMultiPhoto) {
    const singleCaptionArea = Math.max(12, style.captionAreaPercent ?? 22);
    return (
      <div style={containerStyle} className={`group ${className}`}>
        <div
          style={{
            minHeight: 0,
            flex: `1 1 ${100 - (caption ? singleCaptionArea : 0)}%`,
            borderRadius: style.innerRadius ?? 2,
            backgroundColor: '#262626',
            overflow: 'hidden',
            position: 'relative',
          }}
          onClick={() => onSelectPhotoSlot?.(0)}
        >
          {mainSource ? (
            <img
              src={mainSource}
              alt={element.alt || ''}
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: style.imageFit || 'cover',
                display: 'block',
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-2 text-center text-[10px] font-bold text-white/40">
              Chọn ảnh cho khung
            </div>
          )}
        </div>

        {caption ? (
          <div
            style={{
              minHeight: `${singleCaptionArea}%`,
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                style.captionAlign === 'left'
                  ? 'flex-start'
                  : style.captionAlign === 'right'
                    ? 'flex-end'
                    : 'center',
              color: style.captionColor || '#34302f',
              fontFamily: style.captionFontFamily,
              fontSize: style.captionFontSize || 15,
              fontWeight: style.captionFontWeight || 600,
              textAlign: style.captionAlign || 'center',
              lineHeight: 1.25,
              whiteSpace: 'pre-line',
              overflow: 'hidden',
              paddingTop: '2%',
            }}
          >
            {caption}
          </div>
        ) : null}
      </div>
    );
  }

  // Render Multi-photo layout (4-photo vertical strip, 3-photo vertical strip, 2x2 grid)
  return (
    <div style={containerStyle} className={`group ${className}`}>
      {/* Photo Grid / Strip Area */}
      <div
        style={{
          minHeight: 0,
          flex: '1 1 auto',
          display: 'grid',
          gridTemplateColumns: layout === 'grid-2x2' ? 'repeat(2, 1fr)' : '1fr',
          gridTemplateRows:
            layout === 'grid-2x2'
              ? 'repeat(2, 1fr)'
              : layout === 'strip-vertical-3'
                ? 'repeat(3, 1fr)'
                : 'repeat(4, 1fr)',
          gap: `${gap}%`,
          width: '100%',
          height: '100%',
        }}
      >
        {photoSlots.map((src, index) => {
          const slotNum = index + 1;
          return (
            <div
              key={index}
              style={{
                borderRadius: style.innerRadius ?? 3,
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                position: 'relative',
                width: '100%',
                height: '100%',
                border: style.innerBorderWidth
                  ? `${style.innerBorderWidth}px solid ${style.innerBorderColor || 'rgba(255,255,255,0.2)'}`
                  : undefined,
              }}
              className="group/slot cursor-pointer transition-transform hover:brightness-105"
              onClick={(e) => {
                if (isEditor && onSelectPhotoSlot) {
                  e.stopPropagation();
                  onSelectPhotoSlot(index);
                }
              }}
              title={isEditor ? `Nhấn để đổi ảnh ô #${slotNum}` : undefined}
            >
              {src ? (
                <img
                  src={src}
                  alt={element.alt || `Photo ${slotNum}`}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: style.imageFit || 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-1 text-center text-white/40">
                  <span className="text-[14px] leading-none">📷</span>
                  <span className="mt-0.5 text-[8px] font-bold">Ô #{slotNum}</span>
                </div>
              )}

              {/* Slot Number Tag in Editor */}
              {isEditor && (
                <div className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[7px] font-bold text-white/90 opacity-0 backdrop-blur-sm transition-opacity group-hover/slot:opacity-100">
                  #{slotNum}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Title / Date Stamp / Caption */}
      {caption ? (
        <div
          style={{
            marginTop: `${gap * 0.8}%`,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              style.captionAlign === 'left'
                ? 'flex-start'
                : style.captionAlign === 'right'
                  ? 'flex-end'
                  : 'center',
            color: style.captionColor || '#ffffff',
            fontFamily: style.captionFontFamily,
            fontSize: style.captionFontSize || 12,
            fontWeight: style.captionFontWeight || 600,
            textAlign: style.captionAlign || 'center',
            lineHeight: 1.2,
            whiteSpace: 'pre-line',
            overflow: 'hidden',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
};
