import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

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
export interface SavedProduct {
  id: string;
  user_id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  product_img: string;
  created_at: string;
}

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

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  created_at: string;
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
      created_at: new Date().toISOString()
    };

    // Use product_id as document ID for easy updates
    const productRef = doc(db, 'products', product.id);
    await setDoc(productRef, dbProduct, { merge: true });

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

// Saved Products (Favorites) functions
export const getSavedProducts = async (userId: string) => {
  try {
    const savedRef = collection(db, 'saved_products');
    const q = query(savedRef, where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data().product_id as string);
  } catch (error) {
    console.error('Error getting saved products:', error);
    return [];
  }
};

export const addSavedProduct = async (userId: string, product: { id: string; title: string; price: number; img: string }) => {
  try {
    const savedRef = doc(db, 'saved_products', `${userId}_${product.id}`);
    await setDoc(savedRef, {
      user_id: userId,
      product_id: product.id,
      product_title: product.title,
      product_price: product.price,
      product_img: product.img,
      created_at: new Date().toISOString()
    });
    return { error: null };
  } catch (error) {
    console.error('Error saving product:', error);
    return { error };
  }
};

export const removeSavedProduct = async (userId: string, productId: string) => {
  try {
    const savedRef = doc(db, 'saved_products', `${userId}_${productId}`);
    await deleteDoc(savedRef);
    return { error: null };
  } catch (error) {
    console.error('Error removing saved product:', error);
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

export const firebaseSignOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
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

export const fetchContactMessages = async (): Promise<ContactMessage[]> => {
  try {
    // Add timeout to prevent hanging (15 seconds)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase timeout')), 15000)
    );

    const fetchPromise = (async () => {
      const messagesRef = collection(db, 'contact_messages');
      const querySnapshot = await getDocs(messagesRef);

      const messages = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as ContactMessage[];

      // Sort by created_at descending (newest first)
      return messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    })();

    const messages = await Promise.race([fetchPromise, timeoutPromise]);

    // Save to localStorage as backup
    localStorage.setItem('maxios_contact_messages', JSON.stringify(messages));

    return messages;
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    // Try to load from localStorage backup
    const cached = localStorage.getItem('maxios_contact_messages');
    if (cached) {
      console.log('Using cached messages from localStorage');
      return JSON.parse(cached);
    }
    return [];
  }
};

export const deleteContactMessage = async (messageId: string) => {
  // Remove from localStorage
  const cached = localStorage.getItem('maxios_contact_messages');
  if (cached) {
    const messages: ContactMessage[] = JSON.parse(cached);
    const updated = messages.filter(m => m.id !== messageId);
    localStorage.setItem('maxios_contact_messages', JSON.stringify(updated));
  }

  // Try Firebase
  try {
    const messageRef = doc(db, 'contact_messages', messageId);
    await deleteDoc(messageRef);
    return { error: null };
  } catch (error) {
    console.error('Error deleting contact message from Firebase:', error);
    return { error: null }; // Don't report error since localStorage was updated
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

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    // Add timeout to prevent hanging (15 seconds)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase timeout')), 15000)
    );

    const fetchPromise = (async () => {
      const ordersRef = collection(db, 'orders');
      const querySnapshot = await getDocs(ordersRef);

      const orders = querySnapshot.docs.map(docSnap => docSnap.data()) as Order[];

      // Sort by createdAt descending (newest first)
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    })();

    const orders = await Promise.race([fetchPromise, timeoutPromise]);

    // Save to localStorage as backup
    localStorage.setItem('maxios_orders', JSON.stringify(orders));

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    // Try to load from localStorage backup
    const cached = localStorage.getItem('maxios_orders');
    if (cached) {
      console.log('Using cached orders from localStorage');
      return JSON.parse(cached);
    }
    return [];
  }
};

export const updateOrderStatus = async (orderNumber: string, status: Order['status']) => {
  // Update in localStorage
  const cached = localStorage.getItem('maxios_orders');
  if (cached) {
    const orders: Order[] = JSON.parse(cached);
    const updated = orders.map(o => o.orderNumber === orderNumber ? { ...o, status } : o);
    localStorage.setItem('maxios_orders', JSON.stringify(updated));
  }

  // Try Firebase
  try {
    const orderRef = doc(db, 'orders', orderNumber);
    await setDoc(orderRef, { status }, { merge: true });
    return { error: null };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { error: null };
  }
};

export const deleteOrder = async (orderNumber: string) => {
  // Remove from localStorage
  const cached = localStorage.getItem('maxios_orders');
  if (cached) {
    const orders: Order[] = JSON.parse(cached);
    const updated = orders.filter(o => o.orderNumber !== orderNumber);
    localStorage.setItem('maxios_orders', JSON.stringify(updated));
  }

  // Try Firebase
  try {
    const orderRef = doc(db, 'orders', orderNumber);
    await deleteDoc(orderRef);
    return { error: null };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { error: null };
  }
};

