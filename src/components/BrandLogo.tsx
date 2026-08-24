import React from 'react';

import {
  BRAND,
} from '../config/brand';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  onClick?: () => void;
}

export const BrandLogo:
React.FC<
  BrandLogoProps
> = ({
  className = '',
  imageClassName =
    'h-11 w-auto',
  onClick,
}) => {
  const content = (
    <img
      src={BRAND.logoPath}
      alt={BRAND.name}
      className={
        imageClassName
      }
    />
  );

  if (!onClick) {
    return (
      <div
        className={
          className
        }
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className
      }
      aria-label="Về Dearly"
    >
      {content}
    </button>
  );
};
