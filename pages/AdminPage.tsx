import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AdminConsole } from '../components/AdminConsole';
import { Language, UserProfile, PromoCode, Product } from '../App';

interface AdminPageProps {
  lang: Language;
  user: UserProfile | null;
  promoCodes: PromoCode[];
  setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  products: Product[];
  setProducts: (products: Product[]) => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export default function AdminPage({ lang, user, promoCodes, setPromoCodes, products, setProducts, setUser }: AdminPageProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user?.isAdmin) {
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
      <AdminConsole
        lang={lang}
        onLogout={handleLogout}
        promoCodes={promoCodes}
        setPromoCodes={setPromoCodes}
        products={products}
        setProducts={setProducts}
      />
    </motion.div>
  );
}
