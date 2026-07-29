import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
