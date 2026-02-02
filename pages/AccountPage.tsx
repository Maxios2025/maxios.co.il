import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AccountSection } from '../components/AccountSection';
import { Language, UserProfile } from '../App';

interface AccountPageProps {
  lang: Language;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export default function AccountPage({ lang, user, setUser }: AccountPageProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user || user.isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32"
    >
      <AccountSection lang={lang} user={user} setUser={setUser} onLogout={handleLogout} />
    </motion.div>
  );
}
