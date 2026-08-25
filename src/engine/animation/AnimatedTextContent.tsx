import React from 'react';

import {
  motion,
} from 'motion/react';

import type {
  AnimationConfig,
  AnimationPreset,
} from './types';

const TEXT_REVEAL_PRESETS =
  new Set<
    AnimationPreset
  >([
    'typewriter',
    'word-reveal',
    'line-reveal',
  ]);

export const isTextRevealPreset =
  (
    preset:
      AnimationPreset |
      undefined
  ) => {
    return Boolean(
      preset &&
      TEXT_REVEAL_PRESETS.has(
        preset
      )
    );
  };

interface Props {
  text: string;

  animation?:
    Partial<
      AnimationConfig
    >;

  replayKey?:
    string |
    number;
}

export const AnimatedTextContent:
React.FC<Props> = ({
  text,
  animation,
  replayKey,
}) => {
  const preset =
    animation?.preset ||
    'none';

  if (
    !isTextRevealPreset(
      preset
    )
  ) {
    return (
      <>
        {text}
      </>
    );
  }

  const durationMs =
    Math.max(
      100,
      animation
        ?.durationMs ||
      (
        preset ===
        'typewriter'
          ? 1800
          : 900
      )
    );

  const delayMs =
    Math.max(
      0,
      animation
        ?.delayMs ||
      0
    );

  if (
    preset ===
    'typewriter'
  ) {
    const characters =
      Array.from(
        text
      );

    const step =
      characters.length >
      1
        ? durationMs /
          characters.length
        : durationMs;

    return (
      <span
        key={
          `typewriter-${replayKey}`
        }
        style={{
          whiteSpace:
            'pre-wrap',
        }}
      >
        {characters.map(
          (
            character,
            index
          ) => {
            if (
              character ===
              '\n'
            ) {
              return (
                <br
                  key={
                    `br-${index}`
                  }
                />
              );
            }

            return (
              <motion.span
                key={
                  `${index}-${character}`
                }
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  duration:
                    Math.min(
                      0.08,
                      Math.max(
                        0.015,
                        step /
                        1000 *
                        0.6
                      )
                    ),
                  delay:
                    (
                      delayMs +
                      index *
                        step
                    ) /
                    1000,
                  ease:
                    'linear',
                }}
              >
                {character ===
                ' '
                  ? '\u00A0'
                  : character}
              </motion.span>
            );
          }
        )}
      </span>
    );
  }

  if (
    preset ===
    'word-reveal'
  ) {
    const tokens =
      text.split(
        /(\s+)/
      );

    const words =
      tokens.filter(
        (
          token
        ) =>
          !/^\s+$/.test(
            token
          )
      );

    const step =
      words.length >
      1
        ? durationMs /
          words.length
        : durationMs;

    let wordIndex = 0;

    return (
      <span
        key={
          `word-${replayKey}`
        }
        style={{
          whiteSpace:
            'pre-wrap',
        }}
      >
        {tokens.map(
          (
            token,
            index
          ) => {
            if (
              /^\s+$/.test(
                token
              )
            ) {
              return token;
            }

            const current =
              wordIndex;

            wordIndex += 1;

            return (
              <motion.span
                key={
                  `${index}-${token}`
                }
                initial={{
                  opacity: 0,
                  y: 10,
                  filter:
                    'blur(5px)',
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter:
                    'blur(0px)',
                }}
                transition={{
                  duration:
                    Math.min(
                      0.45,
                      Math.max(
                        0.16,
                        step /
                        1000
                      )
                    ),
                  delay:
                    (
                      delayMs +
                      current *
                        step
                    ) /
                    1000,
                  ease:
                    'easeOut',
                }}
                style={{
                  display:
                    'inline-block',
                }}
              >
                {token}
              </motion.span>
            );
          }
        )}
      </span>
    );
  }

  const lines =
    text.split(
      '\n'
    );

  const step =
    lines.length >
    1
      ? durationMs /
        lines.length
      : durationMs;

  return (
    <span
      key={
        `line-${replayKey}`
      }
      style={{
        display:
          'block',
      }}
    >
      {lines.map(
        (
          line,
          index
        ) => (
          <motion.span
            key={
              `${index}-${line}`
            }
            initial={{
              opacity: 0,
              y: 18,
              clipPath:
                'inset(100% 0 0 0)',
            }}
            animate={{
              opacity: 1,
              y: 0,
              clipPath:
                'inset(0% 0 0 0)',
            }}
            transition={{
              duration:
                Math.min(
                  0.55,
                  Math.max(
                    0.2,
                    step /
                    1000
                  )
                ),
              delay:
                (
                  delayMs +
                  index *
                    step
                ) /
                1000,
              ease:
                'easeOut',
            }}
            style={{
              display:
                'block',
            }}
          >
            {line ||
              '\u00A0'}
          </motion.span>
        )
      )}
    </span>
  );
};
