
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, LogOut, Check, X, Clock, Ticket, Plus, Trash2, Edit2, Camera, Shield, Package, MessageCircle, Mail, Phone, User } from 'lucide-react';
import { Language, PromoCode, Product } from '../App';
import { saveProduct, deleteProductFromDB, fetchContactMessages, deleteContactMessage, ContactMessage, fetchOrders, updateOrderStatus, deleteOrder, Order } from '../lib/firebase';

interface AdminConsoleProps {
  lang: Language;
  onLogout: () => void;
  promoCodes: PromoCode[];
  setPromoCodes: (codes: PromoCode[]) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({ lang, onLogout, promoCodes, setPromoCodes, products, setProducts }) => {
  const [activeTab, setActiveTab] = useState<'promocodes' | 'products' | 'orders' | 'messages'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Load orders from Firebase
  useEffect(() => {
    const loadOrders = async () => {
      setLoadingOrders(true);
      const fetchedOrders = await fetchOrders();
      setOrders(fetchedOrders);
      setLoadingOrders(false);
    };
    loadOrders();
  }, []);

  // Load messages from Firebase
  useEffect(() => {
    const loadMessages = async () => {
      setLoadingMessages(true);
      const fetchedMessages = await fetchContactMessages();
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    };
    loadMessages();
  }, []);
  
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
    img: '',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savedProduct, setSavedProduct] = useState<Product | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

    if (!productForm.title.en) {
      alert('Please enter a product title.');
      return;
    }

    if (!productForm.price || productForm.price <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    let newProducts: Product[];
    let productToSave: Product;

    if (editingProductId) {
      productToSave = { ...productForm, id: editingProductId };
      newProducts = products.map(p => p.id === editingProductId ? productToSave : p);
    } else {
      productToSave = { ...productForm, id: `p-${Date.now()}` };
      newProducts = [...products, productToSave];
    }

    // Save locally first (always works)
    setProducts(newProducts);
    localStorage.setItem('maxios_products', JSON.stringify(newProducts));

    // Save to Firebase and wait for result
    const result = await saveProduct(productToSave);

    // Show success confirmation with product image
    setSavedProduct(productToSave);
    setShowSuccess(true);

    if (result.error) {
      console.error('Firebase save failed:', result.error);
      // Product saved locally, will sync on next load
    }

    // Auto-close after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setSavedProduct(null);
    }, 3000);

    resetProductForm();
  };

  const deleteProduct = async (id: string) => {
    if (confirm("Permanently delete this unit from inventory?")) {
      // Delete locally first (always works)
      const newProducts = products.filter(p => p.id !== id);
      setProducts(newProducts);
      // Also save to localStorage as backup
      localStorage.setItem('maxios_products', JSON.stringify(newProducts));

      // Try to delete from Firebase
      const result = await deleteProductFromDB(id);
      if (result.error) {
        console.error('Firebase delete failed:', result.error);
      }
    }
  };

  const startEdit = (p: Product) => {
    setProductForm(p);
    setEditingProductId(p.id);
    // Combine main image with additional images for preview
    const allImages = [p.img, ...(p.images || [])].filter(Boolean);
    setImagePreviews(allImages);
    setIsAddingProduct(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Check file size (max 2MB for localStorage)
      if (file.size > 2 * 1024 * 1024) {
        alert(`Image "${file.name}" too large. Max 2MB allowed.`);
        continue;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreviews((prev: string[]) => [...prev, base64]);
        // First image becomes the main image
        setProductForm((prev: Omit<Product, 'id'>) => {
          if (!prev.img) {
            return { ...prev, img: base64 };
          } else {
            return { ...prev, images: [...(prev.images || []), base64] };
          }
        });
      };
      reader.readAsDataURL(file);
    }

    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev: string[]) => prev.filter((_: string, i: number) => i !== index));
    if (index === 0) {
      // Removing main image - promote first additional image to main
      const newImages = [...(productForm.images || [])];
      const newMainImg = newImages.shift() || '';
      setProductForm((prev: Omit<Product, 'id'>) => ({ ...prev, img: newMainImg, images: newImages }));
    } else {
      // Removing additional image
      setProductForm((prev: Omit<Product, 'id'>) => ({
        ...prev,
        images: (prev.images || []).filter((_: string, i: number) => i !== index - 1)
      }));
    }
  };

  const resetProductForm = () => {
    setIsAddingProduct(false);
    setEditingProductId(null);
    setImagePreviews([]);
    setProductForm({
      title: { en: '', ar: '', he: '' },
      series: { en: '', ar: '', he: '' },
      desc: { en: '', ar: '', he: '' },
      price: 0,
      img: '',
      images: []
    });
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
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'messages', label: 'Messages', icon: MessageCircle },
            { id: 'promocodes', label: 'Promo Codes', icon: Ticket },
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
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 relative z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">INCOMING ORDERS</h3>
                <span className="px-4 py-2 bg-orange-600 text-black font-black text-sm">{orders.length} ORDERS</span>
              </div>

              {loadingOrders ? (
                <div className="py-20 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"
                  />
                  <p className="text-white/40 mt-4 uppercase text-xs tracking-widest">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-20 text-center opacity-20 uppercase font-black tracking-widest text-xs border border-dashed border-white/10">
                  No Orders Yet
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice().reverse().map((order, idx) => (
                    <div key={order.orderNumber} className="border border-white/10 bg-white/5 hover:border-orange-500/30 transition-all">
                      {/* Order Header */}
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => setSelectedOrder(selectedOrder?.orderNumber === order.orderNumber ? null : order)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-600 flex items-center justify-center">
                              <Package size={24} className="text-black" />
                            </div>
                            <div>
                              <p className="text-lg font-black italic text-white uppercase">{order.orderNumber}</p>
                              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">
                                {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-orange-500">₪{order.total}</p>
                            <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase mt-2 ${
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              order.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                              order.status === 'shipped' ? 'bg-purple-500/20 text-purple-500' :
                              order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-6 text-[10px] text-white/60 font-bold uppercase">
                          <span>{order.customer.name}</span>
                          <span>{order.customer.phone}</span>
                          <span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'}</span>
                        </div>
                      </div>

                      {/* Order Details (Expandable) */}
                      <AnimatePresence>
                        {selectedOrder?.orderNumber === order.orderNumber && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-white/10"
                          >
                            <div className="p-6 space-y-6 bg-black/30">
                              {/* Customer Info */}
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-2">Customer</p>
                                  <p className="text-white font-bold">{order.customer.name}</p>
                                  <p className="text-white/60 text-sm">{order.customer.email}</p>
                                  <p className="text-white/60 text-sm">{order.customer.phone}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-2">Shipping Address</p>
                                  <p className="text-white font-bold">{order.customer.street}</p>
                                  <p className="text-white/60 text-sm">{order.customer.city} {order.customer.zip}</p>
                                </div>
                              </div>

                              {/* Items */}
                              <div>
                                <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-3">Items</p>
                                <div className="space-y-2">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-white/5">
                                      <span className="text-white font-medium">{item.name} <span className="text-white/40">x{item.qty}</span></span>
                                      <span className="text-white font-bold">{item.price}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Totals */}
                              <div className="border-t border-white/10 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-white/60">Subtotal</span>
                                  <span className="text-white">₪{order.subtotal}</span>
                                </div>
                                {order.promoCode && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-green-400">Discount ({order.promoCode})</span>
                                    <span className="text-green-400">-₪{order.discount}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-lg font-black">
                                  <span className="text-white">Total</span>
                                  <span className="text-orange-500">₪{order.total}</span>
                                </div>
                              </div>

                              {/* Status Update */}
                              <div className="flex gap-2 pt-4">
                                {['pending', 'processing', 'shipped', 'delivered'].map(status => (
                                  <button
                                    key={status}
                                    onClick={async () => {
                                      const updatedOrders = orders.map(o =>
                                        o.orderNumber === order.orderNumber ? {...o, status: status as Order['status']} : o
                                      );
                                      setOrders(updatedOrders);
                                      setSelectedOrder({...order, status: status as Order['status']});
                                      await updateOrderStatus(order.orderNumber, status as Order['status']);
                                    }}
                                    className={`px-4 py-2 text-[9px] font-black uppercase transition-all ${
                                      order.status === status
                                        ? 'bg-orange-600 text-black'
                                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>

                              {/* Delete Order */}
                              <div className="pt-4 border-t border-white/10 mt-4">
                                <button
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                                      const updatedOrders = orders.filter(o => o.orderNumber !== order.orderNumber);
                                      setOrders(updatedOrders);
                                      setSelectedOrder(null);
                                      await deleteOrder(order.orderNumber);
                                    }
                                  }}
                                  className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> DELETE ORDER
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
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

          {activeTab === 'messages' && (
            <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 relative z-10">
              <div className="flex justify-between items-center">
                <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">INCOMING TRANSMISSIONS</h3>
                <span className="px-4 py-2 bg-orange-600 text-black font-black text-sm">{messages.length} MESSAGES</span>
              </div>

              {loadingMessages ? (
                <div className="py-20 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"
                  />
                  <p className="text-white/40 mt-4 uppercase text-xs tracking-widest">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-20 text-center opacity-20 uppercase font-black tracking-widest text-xs border border-dashed border-white/10">
                  No Messages Yet
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="border border-white/10 bg-white/5 hover:border-orange-500/30 transition-all">
                      {/* Message Header */}
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-600 flex items-center justify-center">
                              <Mail size={24} className="text-black" />
                            </div>
                            <div>
                              <p className="text-lg font-black italic text-white uppercase">{msg.name}</p>
                              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">
                                {new Date(msg.created_at).toLocaleDateString()} • {new Date(msg.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white/60">{msg.email}</p>
                            {msg.phone && <p className="text-xs text-white/40">{msg.phone}</p>}
                          </div>
                        </div>
                        <p className="mt-4 text-white/60 text-sm line-clamp-2">{msg.message}</p>
                      </div>

                      {/* Message Details (Expandable) */}
                      <AnimatePresence>
                        {selectedMessage?.id === msg.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-white/10"
                          >
                            <div className="p-6 space-y-6 bg-black/30">
                              {/* Contact Info */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-center gap-3">
                                  <User size={18} className="text-orange-500" />
                                  <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Name</p>
                                    <p className="text-white font-bold">{msg.name}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Mail size={18} className="text-orange-500" />
                                  <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Email</p>
                                    <a href={`mailto:${msg.email}`} className="text-white font-bold hover:text-orange-500 transition-colors">{msg.email}</a>
                                  </div>
                                </div>
                                {msg.phone && (
                                  <div className="flex items-center gap-3">
                                    <Phone size={18} className="text-orange-500" />
                                    <div>
                                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Phone</p>
                                      <a href={`tel:${msg.phone}`} className="text-white font-bold hover:text-orange-500 transition-colors">{msg.phone}</a>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Full Message */}
                              <div>
                                <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mb-3">Message</p>
                                <div className="p-4 bg-white/5 border border-white/10">
                                  <p className="text-white whitespace-pre-wrap">{msg.message}</p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-4 pt-4 border-t border-white/10">
                                <a
                                  href={`mailto:${msg.email}?subject=Re: Your message to MAXIOS`}
                                  className="px-6 py-3 bg-orange-600 text-black font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-all flex items-center gap-2"
                                >
                                  <Mail size={14} /> REPLY VIA EMAIL
                                </a>
                                <button
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to delete this message?')) {
                                      await deleteContactMessage(msg.id);
                                      setMessages(messages.filter(m => m.id !== msg.id));
                                      setSelectedMessage(null);
                                    }
                                  }}
                                  className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> DELETE
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
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
                    <label className="text-[10px] font-black text-white/20 uppercase flex items-center gap-2"><Camera size={12}/> PRODUCT IMAGES (Multiple)</label>
                    <div className="flex flex-wrap gap-4 items-start">
                      {/* Existing Images */}
                      {imagePreviews.map((img, index) => (
                        <div key={index} className="relative w-32 h-32 border-2 border-white/20 overflow-hidden group">
                          <img src={img} className="w-full h-full object-cover" />
                          {index === 0 && (
                            <span className="absolute top-1 left-1 px-2 py-1 bg-orange-500 text-black text-[8px] font-black uppercase">Main</span>
                          )}
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14}/>
                          </button>
                        </div>
                      ))}
                      {/* Add New Image Button */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 border-2 border-dashed border-white/20 hover:border-orange-500 flex flex-col items-center justify-center cursor-pointer transition-all bg-black/50 group"
                      >
                        <Plus size={28} className="text-white/20 group-hover:text-orange-500 transition-colors mb-1" />
                        <span className="text-[8px] text-white/30 uppercase font-black">Add Image</span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="flex gap-4 text-[10px] text-white/40 uppercase tracking-wider">
                      <p>Supported: JPG, PNG, WebP</p>
                      <p>Max Size: 2MB per image</p>
                      <p>First image = Main display</p>
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

        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && savedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999]"
              onClick={() => setShowSuccess(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-black border-2 border-orange-500 p-8 max-w-md w-full mx-4 text-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <Check size={40} className="text-black" />
                </div>
                <h3 className="text-2xl font-black italic text-white uppercase mb-4">PRODUCT SAVED!</h3>
                <div className="w-48 h-48 mx-auto mb-4 border border-white/20 overflow-hidden">
                  <img src={savedProduct.img} alt={savedProduct.title.en} className="w-full h-full object-cover" />
                </div>
                <p className="text-lg font-bold text-orange-500">{savedProduct.title.en}</p>
                <p className="text-white/50 text-sm mt-1">₪{savedProduct.price}</p>
                <p className="text-white/30 text-xs mt-4 uppercase tracking-wider">Auto-closing in 3 seconds...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
