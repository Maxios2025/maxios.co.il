import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration - Replace these with your Firebase project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Database Types
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
}

export interface Order {
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    street: string;
    zip?: string;
  };
  items: { id: string; name: string; qty: number; price: string }[];
  subtotal: string;
  discount: string;
  promoCode: string | null;
  total: string;
  paymentMethod: 'cod' | 'card';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

// Product stored in database
export interface DBProduct {
  id: string;
  product_id: string;
  title_en: string;
  title_ar: string;
  title_he: string;
  series_en: string;
  series_ar: string;
  series_he: string;
  desc_en: string;
  desc_ar: string;
  desc_he: string;
  price: number;
  img: string;
  images?: string[]; // Additional product images
  created_at: string;
  updated_at: string;
}

// Helper functions for products
export const fetchProducts = async () => {
  try {
    const productsRef = collection(db, 'products');
    // Simple query without orderBy to avoid index requirement
    const querySnapshot = await getDocs(productsRef);

    const products = querySnapshot.docs.map(doc => {
      const p = doc.data() as DBProduct;
      return {
        id: p.product_id,
        title: { en: p.title_en, ar: p.title_ar, he: p.title_he },
        series: { en: p.series_en, ar: p.series_ar || p.series_en, he: p.series_he || p.series_en },
        desc: { en: p.desc_en, ar: p.desc_ar, he: p.desc_he },
        price: p.price,
        img: p.img,
        images: p.images || []
      };
    });

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return null;
  }
};

export const saveProduct = async (product: {
  id: string;
  title: { en: string; ar: string; he: string };
  series: { en: string; ar: string; he: string };
  desc: { en: string; ar: string; he: string };
  price: number;
  img: string;
  images?: string[];
}) => {
  try {
    const dbProduct = {
      product_id: product.id,
      title_en: product.title.en,
      title_ar: product.title.ar,
      title_he: product.title.he,
      series_en: product.series.en,
      series_ar: product.series.ar || product.series.en,
      series_he: product.series.he || product.series.en,
      desc_en: product.desc.en,
      desc_ar: product.desc.ar,
      desc_he: product.desc.he,
      price: product.price,
      img: product.img,
      images: product.images || [],
      updated_at: new Date().toISOString(),
    };

    // Use product_id as document ID for easy updates
    const productRef = doc(db, 'products', product.id);
    // Only set created_at on first creation, not on updates
    const fullDoc = { ...dbProduct, created_at: new Date().toISOString() };
    const existingDoc = await getDoc(productRef);
    await setDoc(productRef, existingDoc.exists() ? dbProduct : fullDoc, { merge: true });

    return { error: null };
  } catch (error) {
    console.error('Error saving product:', error);
    return { error };
  }
};

export const deleteProductFromDB = async (productId: string) => {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    return { error: null };
  } catch (error: any) {
    // Don't treat "not found" as an error - product might only exist locally
    if (error?.code === 'not-found' || error?.code === 'permission-denied') {
      console.log('Product not in Firebase, removing locally only');
      return { error: null };
    }
    console.error('Error deleting product:', error);
    return { error };
  }
};

// Auth functions
export const firebaseSignIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const firebaseSignUp = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Contact Messages
export const saveContactMessage = async (data: { name: string; email: string; phone?: string | null; message: string }) => {
  const messageId = `${Date.now()}_${data.email}`;
  const messageData: ContactMessage = {
    id: messageId,
    name: data.name,
    email: data.email,
    message: data.message,
    created_at: new Date().toISOString()
  };
  if (data.phone) {
    messageData.phone = data.phone;
  }

  // Always save to localStorage first
  const cached = localStorage.getItem('maxios_contact_messages');
  const messages: ContactMessage[] = cached ? JSON.parse(cached) : [];
  messages.unshift(messageData); // Add to beginning
  localStorage.setItem('maxios_contact_messages', JSON.stringify(messages));

  // Try Firebase (non-blocking)
  try {
    const messageRef = doc(db, 'contact_messages', messageId);
    await setDoc(messageRef, messageData);
    return { error: null };
  } catch (error) {
    console.error('Error saving contact message to Firebase:', error);
    return { error };
  }
};

// User Profiles
export const saveUserProfile = async (userId: string, data: { email: string; name?: string; phone?: string; city?: string; zip?: string; street?: string }) => {
  try {
    const profileRef = doc(db, 'user_profiles', userId);
    await setDoc(profileRef, {
      ...data,
      created_at: new Date().toISOString()
    });
    return { error: null };
  } catch (error) {
    console.error('Error saving user profile:', error);
    return { error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const profileRef = doc(db, 'user_profiles', userId);
    const docSnap = await getDoc(profileRef);

    if (docSnap.exists()) {
      return { data: docSnap.data(), error: null };
    }
    return { data: null, error: null };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { data: null, error };
  }
};

// Promo Codes
export const fetchPromoCodes = async () => {
  try {
    const codesRef = collection(db, 'promo_codes');
    const querySnapshot = await getDocs(codesRef);
    return querySnapshot.docs.map(doc => doc.data() as { code: string; percent: number; expiryHours: number; createdAt: string });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return null;
  }
};

export const savePromoCode = async (code: { code: string; percent: number; expiryHours: number; createdAt: string }) => {
  try {
    const codeRef = doc(db, 'promo_codes', code.code);
    await setDoc(codeRef, code);
    return { error: null };
  } catch (error) {
    console.error('Error saving promo code:', error);
    return { error };
  }
};

export const deletePromoCodeFromDB = async (codeStr: string) => {
  try {
    const codeRef = doc(db, 'promo_codes', codeStr);
    await deleteDoc(codeRef);
    return { error: null };
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return { error };
  }
};

// Orders
export const saveOrder = async (order: Order) => {
  // Always save to localStorage first
  const cached = localStorage.getItem('maxios_orders');
  const orders: Order[] = cached ? JSON.parse(cached) : [];
  const existingIndex = orders.findIndex(o => o.orderNumber === order.orderNumber);
  if (existingIndex >= 0) {
    orders[existingIndex] = order;
  } else {
    orders.push(order);
  }
  localStorage.setItem('maxios_orders', JSON.stringify(orders));

  // Try Firebase
  try {
    const orderRef = doc(db, 'orders', order.orderNumber);
    await setDoc(orderRef, order);
    return { error: null };
  } catch (error) {
    console.error('Error saving order to Firebase:', error);
    return { error };
  }
};