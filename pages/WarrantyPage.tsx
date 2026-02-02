import React from 'react';
import { motion } from 'framer-motion';
import { Warranty } from '../components/Warranty';
import { Language } from '../App';

interface WarrantyPageProps {
  lang: Language;
}

export default function WarrantyPage({ lang }: WarrantyPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32"
    >
      <Warranty lang={lang} />
    </motion.div>
  );
}
