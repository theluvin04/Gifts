import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  motion,
} from 'motion/react';

import {
  Heart,
} from 'lucide-react';

import type {
  TemplateDesignConfig,
} from '../../templates/design';

interface ProposalActionsProps {
  rejectCount: number;
  yesText: string;
  noText: string;
  design: TemplateDesignConfig;
  onYes: () => void;
  onNo: () => void;
}

export const ProposalActions:
React.FC<
  ProposalActionsProps
> = ({
  rejectCount,
  yesText,
  noText,
  design,
  onYes,
  onNo,
}) => {
  const areaRef =
    useRef<HTMLDivElement>(
      null
    );

  const [
    noPosition,
    setNoPosition,
  ] = useState({
    x: 0,
    y: 0,
  });

  const isFinalStage =
    rejectCount >= 5;

  const yesWidth =
    Math.min(
      205 +
        rejectCount * 18,
      280
    );

  const moveNoButton =
    () => {
      if (isFinalStage) {
        return;
      }

      if (!areaRef.current) {
        onNo();
        return;
      }

      const areaWidth =
        areaRef.current
          .clientWidth;

      const buttonWidth =
        150;

      const horizontalRoom =
        Math.max(
          0,
          (
            areaWidth -
            buttonWidth
          ) /
            2 -
            10
        );

      setNoPosition({
        x:
          (
            Math.random() *
              2 -
            1
          ) *
          horizontalRoom,
        y:
          Math.random() *
          45,
      });

      onNo();
    };

  useEffect(() => {
    const reset = () => {
      setNoPosition({
        x: 0,
        y: 0,
      });
    };

    window.addEventListener(
      'resize',
      reset
    );

    return () => {
      window.removeEventListener(
        'resize',
        reset
      );
    };
  }, []);

  return (
    <div
      ref={areaRef}
      className="relative mx-auto h-[185px] w-full max-w-[320px] overflow-hidden sm:h-[210px] sm:max-w-[520px]"
    >
      <div className="absolute left-0 right-0 top-0 z-30 flex justify-center px-2">
        <motion.button
          onClick={onYes}
          whileTap={{
            scale: 0.95,
          }}
          animate={{
            width:
              isFinalStage
                ? '100%'
                : yesWidth,
            height:
              isFinalStage
                ? 60
                : 52,
          }}
          transition={{
            type: 'spring',
            stiffness: 280,
            damping: 20,
          }}
          style={{
            background:
              design?.proposal?.yesButtonBackground || '#e11d48',
            color:
              design?.proposal?.yesButtonText || '#ffffff',
            fontFamily:
              design?.fonts?.body || 'sans-serif',
          }}
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-[13px] font-bold shadow-lg sm:text-base"
        >
          <Heart
            className="h-4 w-4 shrink-0 fill-current"
          />

          <span className="truncate">
            {yesText}
          </span>
        </motion.button>
      </div>

      <motion.div
        animate={
          isFinalStage
            ? {
                x: 0,
                y: -72,
                rotate: 0,
              }
            : {
                x:
                  noPosition.x,
                y:
                  noPosition.y,
                rotate:
                  rejectCount %
                    2 ===
                  0
                    ? 0
                    : -3,
              }
        }
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 22,
        }}
        className={[
          'absolute left-1/2 top-[72px] z-10 w-[150px] -translate-x-1/2',
          isFinalStage
            ? 'pointer-events-none'
            : '',
        ].join(' ')}
      >
        <button
          onClick={
            moveNoButton
          }
          style={{
            background:
              design?.proposal?.noButtonBackground || '#ffffff',
            color:
              design?.proposal?.noButtonText || '#64748b',
            fontFamily:
              design?.fonts?.body || 'sans-serif',
          }}
          className="flex min-h-[42px] w-full items-center justify-center rounded-full border border-black/10 px-3 py-2 text-center text-[11px] font-semibold leading-[1.25] shadow-md"
        >
          {noText}
        </button>
      </motion.div>
    </div>
  );
};
