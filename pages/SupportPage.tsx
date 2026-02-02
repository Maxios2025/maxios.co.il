import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SupportSection } from '../components/SupportSection';
import { Language } from '../App';

interface SupportPageProps {
  lang: Language;
}

export default function SupportPage({ lang }: SupportPageProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32"
    >
      <SupportSection lang={lang} onGoToContact={() => navigate('/contact')} />
    </motion.div>
  );
}
