
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Tag, MessageSquare, Mail, LogOut, Check, X, Bell, User, Clock, Percent, Target, Ticket, Plus, Trash2, Box, Edit2, Camera, Terminal, Shield, Upload, Image } from 'lucide-react';
import { Language, Promotion, PromoCode, Product } from '../App';
import { saveProduct, deleteProductFromDB } from '../lib/firebase';

interface AdminConsoleProps {
  lang: Language;
  onLogout: () => void;
  onUpdatePromo: (promo: Promotion) => void;
  promoCodes: PromoCode[];
  setPromoCodes: (codes: PromoCode[]) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ lang, onLogout, onUpdatePromo, promoCodes, setPromoCodes, products, setProducts }) => {
  const [activeTab, setActiveTab] = useState<'discounts' | 'promocodes' | 'products' | 'contacts' | 'support'>('discounts');
  
  // Promotion States
  const [promoText, setPromoText] = useState("");
  const [promoPercent, setPromoPercent] = useState(20);
  const [promoDuration, setPromoDuration] = useState(24);
  const [promoTargets, setPromoTargets] = useState<'all' | string[]>('all');
  const [isPromoActive, setIsPromoActive] = useState(false);
  
  // Promo Code States
  const [newCode, setNewCode] = useState("");
  const [newCodePercent, setNewCodePercent] = useState(10);
  const [newCodeDuration, setNewCodeDuration] = useState(48);

  // Product Management States
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    title: { en: '', ar: '', he: '' },
    series: { en: '', ar: '', he: '' },
    desc: { en: '', ar: '', he: '' },
    price: 0,
    img: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contacts, setContacts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const savedPromo = localStorage.getItem('maxios_promo');
    if (savedPromo) {
      const p = JSON.parse(savedPromo);
      setPromoText(p.text || "");
      setIsPromoActive(p.active || false);
      setPromoPercent(p.percent || 20);
      setPromoDuration(p.duration || 24);
      setPromoTargets(p.targets || 'all');
    }
    refreshData();
  }, []);

  const refreshData = () => {
    setContacts(JSON.parse(localStorage.getItem('maxios_contacts') || '[]').reverse());
    setLogs(JSON.parse(localStorage.getItem('maxios_support_logs') || '[]').reverse());
  };

  const handleUpdatePromotion = () => {
    const p: Promotion = { 
      active: isPromoActive, text: promoText, percent: promoPercent, duration: promoDuration, targets: promoTargets,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('maxios_promo', JSON.stringify(p));
    onUpdatePromo(p);
  };

  const handleAddPromoCode = () => {
    if (!newCode) return;
    const code: PromoCode = {
      code: newCode.toUpperCase(),
      percent: newCodePercent,
      expiryHours: newCodeDuration,
      createdAt: new Date().toISOString()
    };
    const updated = [...promoCodes, code];
    setPromoCodes(updated);
    localStorage.setItem('maxios_promo_codes', JSON.stringify(updated));
    setNewCode("");
  };

  const deletePromoCode = (codeStr: string) => {
    const updated = promoCodes.filter(c => c.code !== codeStr);
    setPromoCodes(updated);
    localStorage.setItem('maxios_promo_codes', JSON.stringify(updated));
  };

  const handleSaveProduct = async () => {
    if (!productForm.img) {
      alert('Please upload an image for the product.');
      return;
    }

    if (editingProductId) {
      const updatedProduct = { ...productForm, id: editingProductId };
      // Save locally first (always works)
      const updated = products.map(p => p.id === editingProductId ? updatedProduct : p);
      setProducts(updated);
      // Try to save to Firebase in background (don't block on failure)
      try {
        await saveProduct(updatedProduct);
      } catch (err) {
        console.log('Firebase save failed, saved locally:', err);
      }
    } else {
      const newProduct = { ...productForm, id: `p-${Date.now()}` };
      // Save locally first (always works)
      setProducts([...products, newProduct]);
      // Try to save to Firebase in background (don't block on failure)
      try {
        await saveProduct(newProduct);
      } catch (err) {
        console.log('Firebase save failed, saved locally:', err);
      }
    }
    resetProductForm();
  };

  const deleteProduct = async (id: string) => {
    if (confirm("Permanently delete this unit from inventory?")) {
      // Delete locally first (always works)
      setProducts(products.filter(p => p.id !== id));

      // Try to delete from Firebase (don't block on failure)
      try {
        await deleteProductFromDB(id);
      } catch (err) {
        console.log('Firebase delete failed, product removed locally:', err);
      }
    }
  };

  const startEdit = (p: Product) => {
    setProductForm(p);
    setEditingProductId(p.id);
    setImagePreview(p.img);
    setIsAddingProduct(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB for localStorage)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image too large. Max 2MB allowed.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProductForm({ ...productForm, img: base64 });
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetProductForm = () => {
    setIsAddingProduct(false);
    setEditingProductId(null);
    setImagePreview(null);
    setProductForm({
      title: { en: '', ar: '', he: '' },
      series: { en: '', ar: '', he: '' },
      desc: { en: '', ar: '', he: '' },
      price: 0,
      img: ''
    });
  };

  const clearLogs = (type: 'contacts' | 'support') => {
    if (confirm(`Clear all ${type} history?`)) {
      localStorage.setItem(`maxios_${type === 'contacts' ? 'contacts' : 'support_logs'}`, '[]');
      refreshData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 min-h-screen flex flex-col lg:flex-row gap-16 relative z-10">
      {/* Sidebar - Fixed on desktop */}
      <div className="w-full lg:w-72 space-y-8 lg:sticky lg:top-32 h-fit">
        <div className="flex items-center gap-4 text-orange-500 mb-12">
          <Shield size={40} className="animate-pulse" />
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">COMMAND OVERRIDE</h2>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'discounts', label: 'Broadcast Hub', icon: Tag },
            { id: 'promocodes', label: 'Promo Codes', icon: Ticket },
            { id: 'products', label: 'Units Catalog', icon: Box },
            { id: 'contacts', label: 'Sales Leads', icon: Mail },
            { id: 'support', label: 'Intelligence', icon: MessageSquare },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`w-full flex items-center gap-6 p-5 border text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${activeTab === tab.id ? 'bg-orange-600 text-black border-orange-600 shadow-[0_0_30px_rgba(234,88,12,0.3)]' : 'text-white/40 border-white/5 hover:border-orange-500/30 hover:text-white'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
          <button onClick={onLogout} className="w-full flex items-center gap-6 p-5 border border-red-500/20 text-red-500 text-[10px] font-black tracking-widest uppercase mt-20 hover:bg-red-500 hover:text-white transition-all"><LogOut size={16} /> TERMINATE SESSION</button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-black/40 backdrop-blur-3xl border border-orange-500/10 p-8 md:p-16 min-h-[700px] shadow-2xl relative overflow-hidden">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-600/5 blur-[120px] rounded-full" />
        </div>
        
        <AnimatePresence mode="wait">
          {activeTab === 'discounts' && (
            <motion.div key="promo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12 relative z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">BROADCAST SIGNAL</h3>
                <button onClick={() => setIsPromoActive(!isPromoActive)} className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border transition-all ${isPromoActive ? 'bg-orange-600 text-black border-orange-600' : 'border-white/10 text-white/40'}`}>
                  {isPromoActive ? "SYSTEM ARMED" : "SYSTEM STANDBY"}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Reduction Percent (%)</label>
                  <input type="number" value={promoPercent} onChange={e => setPromoPercent(parseInt(e.target.value))} className="w-full bg-black/50 border border-white/10 p-5 text-white font-black outline-none focus:border-orange-500 text-2xl" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Signal Duration (Hours)</label>
                  <input type="number" value={promoDuration} onChange={e => setPromoDuration(parseInt(e.target.value))} className="w-full bg-black/50 border border-white/10 p-5 text-white font-black outline-none focus:border-orange-500 text-2xl" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Signal Payload (Display Text)</label>
                <textarea value={promoText} onChange={e => setPromoText(e.target.value)} placeholder="GLOBAL DISCOUNT MESSAGE..." className="w-full bg-black/50 border border-white/10 p-8 text-white text-xl font-black italic tracking-tighter uppercase focus:border-orange-500 outline-none h-48" />
              </div>
              <button onClick={handleUpdatePromotion} className="w-full py-8 bg-white text-black font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-4 text-sm shadow-xl"><Bell size={20} /> PUBLISH BROADCAST</button>
            </motion.div>
          )}

          {activeTab === 'promocodes' && (
            <motion.div key="codes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12 relative z-10">
              <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">PROMO LOGIC ENGINE</h3>
              
              <div className="bg-white/5 border border-white/10 p-8 space-y-6">
                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Generate New Logic</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Code Identification</label>
                    <input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="e.g. ALPHA10" className="w-full bg-black border border-white/10 p-4 text-white font-black uppercase text-xs outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Reduction (%)</label>
                    <input type="number" value={newCodePercent} onChange={e => setNewCodePercent(parseInt(e.target.value))} placeholder="%" className="w-full bg-black border border-white/10 p-4 text-white font-black text-xs outline-none focus:border-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Duration (Hours)</label>
                    <input type="number" value={newCodeDuration} onChange={e => setNewCodeDuration(parseInt(e.target.value))} placeholder="H" className="w-full bg-black border border-white/10 p-4 text-white font-black text-xs outline-none focus:border-orange-500" />
                  </div>
                </div>
                <button onClick={handleAddPromoCode} className="w-full py-4 bg-orange-600 text-black font-black uppercase text-[10px] hover:bg-white transition-all flex items-center justify-center gap-2"><Plus size={14}/> INITIALIZE CODE</button>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest">Active Manifest</h4>
                {promoCodes.length === 0 ? (
                  <div className="py-20 text-center opacity-20 uppercase font-black tracking-widest text-xs border border-dashed border-white/10">No Codes Generated</div>
                ) : (
                  promoCodes.map((c, i) => (
                    <div key={i} className="p-6 border border-white/5 bg-white/5 flex justify-between items-center group hover:border-orange-500/30 transition-all">
                      <div className="flex items-center gap-6">
                        <Ticket className="text-orange-500" size={20} />
                        <div>
                          <div className="flex items-center gap-3">
                             <span className="text-xl font-black italic text-white uppercase">{c.code}</span>
                             <span className="px-2 py-1 bg-white text-black font-black text-[9px]">-{c.percent}%</span>
                          </div>
                          <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-1 flex items-center gap-2"><Clock size={10}/> {c.expiryHours}H REMAINING</p>
                        </div>
                      </div>
                      <button onClick={() => deletePromoCode(c.code)} className="p-3 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 relative z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">UNITS REPOSITORY</h3>
                {!isAddingProduct && (
                  <button onClick={() => setIsAddingProduct(true)} className="px-8 py-3 bg-orange-600 text-black font-black uppercase text-[10px] flex items-center gap-2 hover:bg-white transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)]"><Plus size={16}/> ADD NEW UNIT</button>
                )}
              </div>

              {isAddingProduct ? (
                <div className="bg-black/80 border-2 border-orange-500/30 p-10 space-y-10 animate-in fade-in slide-in-from-top-4 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <h4 className="text-2xl font-black italic text-white uppercase">{editingProductId ? 'RECONFIGURING UNIT' : 'NEW HARDWARE PROTOCOL'}</h4>
                    <button onClick={resetProductForm} className="text-white/20 hover:text-white transition-colors"><X size={24}/></button>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase flex items-center gap-2"><Camera size={12}/> PRODUCT IMAGE</label>
                    <div className="flex gap-6 items-start">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-40 h-40 border-2 border-dashed border-white/20 hover:border-orange-500 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/50 overflow-hidden group"
                      >
                        {imagePreview ? (
                          <img src={imagePreview} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload size={32} className="text-white/20 group-hover:text-orange-500 transition-colors mb-2" />
                            <span className="text-[9px] text-white/30 uppercase font-black">Click to Upload</span>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex-1 space-y-2">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Supported: JPG, PNG, WebP</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Max Size: 2MB</p>
                        {imagePreview && (
                          <button
                            onClick={() => { setImagePreview(null); setProductForm({...productForm, img: ''}); }}
                            className="text-[10px] text-red-500 uppercase font-black hover:text-red-400 flex items-center gap-1"
                          >
                            <Trash2 size={12}/> Remove Image
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/20 uppercase">Model Identification (EN / AR / HE)</label>
                      <input value={productForm.title.en} onChange={e => setProductForm({...productForm, title: {...productForm.title, en: e.target.value}})} placeholder="English Identity" className="w-full bg-black border border-white/10 p-4 text-white text-xs focus:border-orange-500 outline-none" />
                      <input value={productForm.title.ar} onChange={e => setProductForm({...productForm, title: {...productForm.title, ar: e.target.value}})} placeholder="Arabic Identity" dir="rtl" className="w-full bg-black border border-white/10 p-4 text-white text-xs font-arabic focus:border-orange-500 outline-none" />
                      <input value={productForm.title.he} onChange={e => setProductForm({...productForm, title: {...productForm.title, he: e.target.value}})} placeholder="Hebrew Identity" dir="rtl" className="w-full bg-black border border-white/10 p-4 text-white text-xs font-arabic focus:border-orange-500 outline-none" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/20 uppercase">Unit Series / Price (₪ ILS)</label>
                      <input value={productForm.series.en} onChange={e => setProductForm({...productForm, series: {...productForm.series, en: e.target.value}})} placeholder="Series Code" className="w-full bg-black border border-white/10 p-4 text-white text-xs focus:border-orange-500 outline-none" />
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-black">₪</span>
                        <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseInt(e.target.value) || 0})} placeholder="Unit Price" className="w-full bg-black border border-white/10 p-4 pl-10 text-white text-xs focus:border-orange-500 outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Description Fields */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase">Product Description (EN / AR / HE)</label>
                    <textarea
                      value={productForm.desc.en}
                      onChange={e => setProductForm({...productForm, desc: {...productForm.desc, en: e.target.value}})}
                      placeholder="English Description - features, specs, benefits..."
                      className="w-full bg-black border border-white/10 p-4 text-white text-xs focus:border-orange-500 outline-none h-24 resize-none"
                    />
                    <textarea
                      value={productForm.desc.ar}
                      onChange={e => setProductForm({...productForm, desc: {...productForm.desc, ar: e.target.value}})}
                      placeholder="Arabic Description"
                      dir="rtl"
                      className="w-full bg-black border border-white/10 p-4 text-white text-xs font-arabic focus:border-orange-500 outline-none h-24 resize-none"
                    />
                    <textarea
                      value={productForm.desc.he}
                      onChange={e => setProductForm({...productForm, desc: {...productForm.desc, he: e.target.value}})}
                      placeholder="Hebrew Description"
                      dir="rtl"
                      className="w-full bg-black border border-white/10 p-4 text-white text-xs font-arabic focus:border-orange-500 outline-none h-24 resize-none"
                    />
                  </div>

                  <button onClick={handleSaveProduct} className="w-full py-6 bg-orange-600 text-black font-black uppercase text-sm hover:bg-white transition-all shadow-xl">SAVE TO CATALOG</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map(p => (
                    <div key={p.id} className="group relative bg-white/5 border border-white/10 p-6 flex gap-6 items-center hover:border-orange-500/40 transition-all">
                       <div className="w-24 h-24 bg-black overflow-hidden flex-shrink-0">
                         <img src={p.img} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                       </div>
                       <div className="flex-1">
                         <h5 className="font-black italic text-white uppercase text-sm mb-1">{p.title[lang]}</h5>
                         <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{p.series[lang]} — ₪{p.price}</p>
                       </div>
                       <div className="flex flex-col gap-2">
                         <button onClick={() => startEdit(p)} className="p-3 bg-white/5 text-white/40 hover:text-orange-500 hover:bg-orange-500/10 transition-all border border-transparent hover:border-orange-500/20"><Edit2 size={16}/></button>
                         <button onClick={() => deleteProduct(p.id)} className="p-3 bg-white/5 text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"><Trash2 size={16}/></button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'contacts' && (
            <motion.div key="contacts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 relative z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">SALES LEADS</h3>
                <button onClick={() => clearLogs('contacts')} className="text-[10px] font-black text-white/20 hover:text-red-500 uppercase flex items-center gap-2"><Trash2 size={14}/> PURGE INBOX</button>
              </div>
              <div className="space-y-4">
                {contacts.length === 0 ? (
                  <div className="py-40 text-center opacity-20 uppercase font-black tracking-widest text-xs border border-dashed border-white/10">Zero Incoming Leads</div>
                ) : (
                  contacts.map((c, i) => (
                    <div key={i} className="p-8 border border-white/5 bg-white/5 space-y-4 hover:border-orange-500/20 transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-600 flex items-center justify-center text-black font-black">{c.name?.[0]}</div>
                          <div>
                            <p className="text-sm font-black text-white uppercase italic">{c.name}</p>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">{c.email}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-orange-500/60 uppercase">{new Date(c.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="p-4 bg-black/40 border-l-2 border-orange-600">
                        <p className="text-white/80 font-medium text-xs leading-relaxed">{c.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'support' && (
            <motion.div key="support" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 relative z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">INTELLIGENCE LOGS</h3>
                <button onClick={() => clearLogs('support')} className="text-[10px] font-black text-white/20 hover:text-red-500 uppercase flex items-center gap-2"><Trash2 size={14}/> ERASE HISTORY</button>
              </div>
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="py-40 text-center opacity-20 uppercase font-black tracking-widest text-xs border border-dashed border-white/10">No Neural Traffic Detected</div>
                ) : (
                  logs.map((l, i) => (
                    <div key={i} className={`p-6 border-l-2 transition-all ${l.role === 'assistant' ? 'bg-orange-600/5 border-orange-600' : 'bg-white/5 border-white/20'}`}>
                      <div className="flex justify-between text-[9px] font-black tracking-[0.2em] mb-3">
                        <span className={l.role === 'assistant' ? 'text-orange-500' : 'text-white/40'}>{l.role === 'assistant' ? 'MAXIOS AI NODE' : 'USER INPUT'}</span>
                        <span className="text-white/10 uppercase">{new Date(l.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className={`text-xs ${l.role === 'assistant' ? 'text-white' : 'text-white/60'} font-medium leading-relaxed italic`}>"{l.text}"</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
