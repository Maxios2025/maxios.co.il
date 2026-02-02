import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ContactSection } from '../components/ContactSection';
import { Language } from '../App';

interface ContactPageProps {
  lang: Language;
}

export default function ContactPage({ lang }: ContactPageProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32"
    >
      <ContactSection lang={lang} onNavigate={(section) => navigate(`/${section === 'home' ? '' : section}`)} />
    </motion.div>
  );
}
