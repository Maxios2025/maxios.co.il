import React from 'react';
import { motion } from 'framer-motion';
import { PrivacyPolicy } from '../components/PrivacyPolicy';
import { Language } from '../App';

interface PrivacyPageProps {
  lang: Language;
}

export default function PrivacyPage({ lang }: PrivacyPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32"
    >
      <PrivacyPolicy lang={lang} />
    </motion.div>
  );
}
