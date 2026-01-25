
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, CreditCard, LogOut, Plus, Shield, MapPin, Phone, Mail, Edit2, Check, X, Trash2, Banknote } from 'lucide-react';
import { Language, UserProfile } from '../App';

interface PaymentMethod {
  id: string;
  type: 'card' | 'cod';
  last4?: string;
  brand?: string;
  isDefault?: boolean;
}

interface AccountSectionProps {
  lang: Language;
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  onLogout: () => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({ lang, user, setUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'billing'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserProfile>({ ...user });
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardName, setNewCardName] = useState('');

  // Mock saved payment methods (in real app, this would come from user profile/database)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'cod', isDefault: false }
  ]);

  const handleSave = () => {
    setUser(editData);
    setIsEditing(false);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const detectCardBrand = (number: string): string => {
    const num = number.replace(/\s/g, '');
    if (/^4/.test(num)) return 'VISA';
    if (/^5[1-5]/.test(num)) return 'MASTERCARD';
    if (/^3[47]/.test(num)) return 'AMEX';
    if (/^6(?:011|5)/.test(num)) return 'DISCOVER';
    return 'CARD';
  };

  const addPaymentMethod = () => {
    if (newCardNumber.replace(/\s/g, '').length < 16) return;

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      last4: newCardNumber.replace(/\s/g, '').slice(-4),
      brand: detectCardBrand(newCardNumber),
      isDefault: paymentMethods.length === 0
    };

    setPaymentMethods([...paymentMethods, newMethod]);
    setIsAddingPayment(false);
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardName('');
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(m => m.id !== id));
  };

  const setDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(m => ({ ...m, isDefault: m.id === id })));
  };

  const t = {
    en: {
      title: "IDENTITY NODE", profile: "PROFILE INFO", orders: "LOGISTICS HISTORY", billing: "PAYMENT VAULT",
      logout: "TERMINATE SESSION", addPayment: "ADD NEW PROTOCOL", noOrders: "NO DEPLOYMENTS RECORDED",
      verified: "AUTHENTICATED USER", shipTo: "SHIPPING HUB", edit: "RECONFIGURE IDENTITY", save: "SAVE CHANGES",
      cardNumber: "CARD NUMBER", cardName: "CARDHOLDER NAME", expiry: "EXPIRY DATE", addCard: "ADD CARD",
      cancel: "CANCEL", default: "DEFAULT", setDefault: "SET AS DEFAULT", remove: "REMOVE",
      cashOnDelivery: "CASH ON DELIVERY", cardEnding: "CARD ENDING IN"
    },
    ar: {
      title: "عقدة الهوية", profile: "معلومات الملف", orders: "سجل اللوجستيات", billing: "خزنة الدفع",
      logout: "خروج", edit: "تعديل", save: "حفظ", addPayment: "إضافة طريقة دفع", noOrders: "لا توجد طلبات",
      verified: "مستخدم موثق", shipTo: "عنوان الشحن", cardNumber: "رقم البطاقة", cardName: "اسم حامل البطاقة",
      expiry: "تاريخ الانتهاء", addCard: "إضافة بطاقة", cancel: "إلغاء", default: "افتراضي",
      setDefault: "تعيين كافتراضي", remove: "حذف", cashOnDelivery: "الدفع عند الاستلام", cardEnding: "بطاقة تنتهي بـ"
    },
    he: {
      title: "צומת זהות", profile: "מידע פרופיל", orders: "היסטוריה", billing: "כספת תשלום",
      logout: "יציאה", edit: "ערוך", save: "שמור", addPayment: "הוסף אמצעי תשלום", noOrders: "אין הזמנות",
      verified: "משתמש מאומת", shipTo: "כתובת משלוח", cardNumber: "מספר כרטיס", cardName: "שם בעל הכרטיס",
      expiry: "תוקף", addCard: "הוסף כרטיס", cancel: "ביטול", default: "ברירת מחדל",
      setDefault: "הגדר כברירת מחדל", remove: "הסר", cashOnDelivery: "תשלום במזומן בעת המסירה", cardEnding: "כרטיס המסתיים ב"
    }
  }[lang];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 min-h-screen">
      <div className="flex flex-col md:flex-row gap-20 items-start">
        <div className="w-full md:w-72 space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">{t.title}</h2>
            <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black tracking-widest uppercase"><Shield size={12} /> {t.verified}</div>
          </div>
          <nav className="space-y-4">
            {[ { id: 'profile', label: t.profile, icon: User }, { id: 'orders', label: t.orders, icon: Package }, { id: 'billing', label: (t as any).billing, icon: CreditCard } ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-6 p-6 border transition-all uppercase tracking-widest text-xs font-black ${activeTab === tab.id ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/5 hover:border-white/20'}`}>
                <tab.icon size={20} />{tab.label}
              </button>
            ))}
            <button onClick={onLogout} className="w-full flex items-center gap-6 p-6 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest text-xs font-black mt-12"><LogOut size={20} />{t.logout}</button>
          </nav>
        </div>

        <div className="flex-1 w-full bg-zinc-950 border border-white/5 p-8 md:p-16 min-h-[600px] relative">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                <div className="flex justify-between items-center">
                   <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">{t.profile}</h3>
                   <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="flex items-center gap-2 text-[10px] font-black tracking-widest text-orange-500 hover:text-white transition-colors">
                     {isEditing ? <><Check size={14}/> {t.save}</> : <><Edit2 size={14}/> {t.edit}</>}
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {[
                    { label: "Operator Name", field: "name", value: isEditing ? editData.name : user.name },
                    { label: "Signal ID (Email)", field: "email", value: isEditing ? editData.email : user.email },
                    { label: "Comm Line (Phone)", field: "phone", value: isEditing ? editData.phone : user.phone }
                  ].map((item) => (
                    <div key={item.field} className="space-y-2">
                      <p className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">{item.label}</p>
                      {isEditing ? (
                        <input value={item.value} onChange={e => setEditData({...editData, [item.field]: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-white font-black italic uppercase outline-none focus:border-orange-500" />
                      ) : (
                        <p className="text-2xl font-black italic text-white uppercase">{item.value}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-12 border-t border-white/5 space-y-8">
                  <div className="flex items-center gap-4"><MapPin className="text-orange-500" size={20} /><h4 className="text-lg font-black italic text-white uppercase tracking-tighter">{t.shipTo}</h4></div>
                  <div className="bg-white/5 p-8 border border-white/5 space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <input placeholder="STREET" value={editData.address.street} onChange={e => setEditData({...editData, address: {...editData.address, street: e.target.value}})} className="w-full bg-black/40 border border-white/10 p-4 text-white text-xs" />
                        <div className="flex gap-4">
                          <input placeholder="CITY" value={editData.address.city} onChange={e => setEditData({...editData, address: {...editData.address, city: e.target.value}})} className="w-full bg-black/40 border border-white/10 p-4 text-white text-xs" />
                          <input placeholder="ZIP" value={editData.address.zip} onChange={e => setEditData({...editData, address: {...editData.address, zip: e.target.value}})} className="w-full bg-black/40 border border-white/10 p-4 text-white text-xs" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-white font-medium uppercase tracking-widest text-sm">{user.address.street}</p>
                        <p className="text-white/40 uppercase tracking-widest text-xs">{user.address.city}, ISRAEL {user.address.zip}</p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center justify-center h-full opacity-20"><Package size={64}/><p className="mt-8 font-black tracking-widest text-sm uppercase">{(t as any).noOrders}</p></motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div key="billing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">{(t as any).billing}</h3>
                  {!isAddingPayment && (
                    <button onClick={() => setIsAddingPayment(true)} className="flex items-center gap-2 text-[10px] font-black tracking-widest text-orange-500 hover:text-white transition-colors">
                      <Plus size={14}/> {(t as any).addPayment}
                    </button>
                  )}
                </div>

                {/* Add New Card Form */}
                <AnimatePresence>
                  {isAddingPayment && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/5 border border-white/10 p-6 space-y-4 overflow-hidden">
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block mb-2">{(t as any).cardName}</label>
                        <input
                          value={newCardName}
                          onChange={e => setNewCardName(e.target.value.toUpperCase())}
                          placeholder="JOHN DOE"
                          className="w-full bg-black/40 border border-white/10 p-4 text-white text-sm outline-none focus:border-orange-500 uppercase font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block mb-2">{(t as any).cardNumber}</label>
                        <input
                          value={newCardNumber}
                          onChange={e => setNewCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full bg-black/40 border border-white/10 p-4 text-white text-sm outline-none focus:border-orange-500 font-mono tracking-widest"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-widest text-white/40 uppercase block mb-2">{(t as any).expiry}</label>
                        <input
                          value={newCardExpiry}
                          onChange={e => setNewCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full bg-black/40 border border-white/10 p-4 text-white text-sm outline-none focus:border-orange-500 font-mono"
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button onClick={addPaymentMethod} className="flex-1 py-4 bg-orange-600 text-black font-black uppercase text-xs hover:bg-orange-500 transition-all">
                          {(t as any).addCard}
                        </button>
                        <button onClick={() => { setIsAddingPayment(false); setNewCardNumber(''); setNewCardExpiry(''); setNewCardName(''); }} className="px-8 py-4 border border-white/20 text-white font-black uppercase text-xs hover:bg-white/10 transition-all">
                          {(t as any).cancel}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Payment Methods List */}
                <div className="space-y-4">
                  {paymentMethods.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20">
                      <CreditCard size={64}/>
                      <p className="mt-8 font-black tracking-widest text-sm uppercase">VAULT EMPTY</p>
                    </div>
                  ) : (
                    paymentMethods.map((method) => (
                      <motion.div
                        key={method.id}
                        layout
                        className={`p-6 border ${method.isDefault ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'} flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-4">
                          {method.type === 'card' ? (
                            <CreditCard className={method.isDefault ? 'text-orange-500' : 'text-white/60'} size={28} />
                          ) : (
                            <Banknote className={method.isDefault ? 'text-orange-500' : 'text-white/60'} size={28} />
                          )}
                          <div>
                            {method.type === 'card' ? (
                              <>
                                <p className="text-white font-black uppercase tracking-wider">{method.brand} •••• {method.last4}</p>
                                <p className="text-white/40 text-xs uppercase tracking-widest">{(t as any).cardEnding} {method.last4}</p>
                              </>
                            ) : (
                              <>
                                <p className="text-white font-black uppercase tracking-wider">{(t as any).cashOnDelivery}</p>
                                <p className="text-white/40 text-xs uppercase tracking-widest">PAY ON ARRIVAL</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {method.isDefault ? (
                            <span className="text-orange-500 text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                              <Check size={12}/> {(t as any).default}
                            </span>
                          ) : (
                            <button onClick={() => setDefaultPayment(method.id)} className="text-white/40 text-[10px] font-black tracking-widest uppercase hover:text-white transition-colors">
                              {(t as any).setDefault}
                            </button>
                          )}
                          {method.type === 'card' && (
                            <button onClick={() => removePaymentMethod(method.id)} className="text-white/20 hover:text-red-500 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
