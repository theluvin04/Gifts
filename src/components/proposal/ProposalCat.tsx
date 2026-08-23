import React from 'react';
import { motion } from 'motion/react';

interface ProposalCatProps {
  src: string;
}

export const ProposalCat: React.FC<ProposalCatProps> = ({ src }) => {
  return (
    <motion.img
      key={src}
      src={src}
      alt="Cute cat"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 22,
      }}
      className="
        block h-auto w-[118px]
        object-contain
        pointer-events-none
        sm:w-[210px]
      "
    />
  );
};