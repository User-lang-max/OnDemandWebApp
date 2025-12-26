// components/ui/HoverCard.jsx
'use client';
import { motion } from 'framer-motion';

export function HoverCard({ children, className = '', scale = 1.02 }) {
  return (
    <motion.div
      whileHover={{ scale, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
}