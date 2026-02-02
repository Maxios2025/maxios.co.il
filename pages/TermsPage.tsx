import React from 'react';
import { motion } from 'framer-motion';
import { TermsOfService } from '../components/TermsOfService';
import { Language } from '../App';

interface TermsPageProps {
  lang: Language;
}

export default function TermsPage({ lang }: TermsPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32"
    >
      <TermsOfService lang={lang} />
    </motion.div>
  );
}
