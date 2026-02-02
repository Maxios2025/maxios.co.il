import React from 'react';
import { motion } from 'framer-motion';
import { AboutUs } from '../components/AboutUs';
import { Language } from '../App';

interface AboutPageProps {
  lang: Language;
}

export default function AboutPage({ lang }: AboutPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32"
    >
      <AboutUs lang={lang} />
    </motion.div>
  );
}
