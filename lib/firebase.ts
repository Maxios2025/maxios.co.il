import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
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
        img: p.img
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
export const saveContactMessage = async (data: { name: string; email: string; phone?: string; message: string }) => {
  try {
    const messageRef = doc(db, 'contact_messages', `${Date.now()}_${data.email}`);
    await setDoc(messageRef, {
      ...data,
      created_at: new Date().toISOString()
    });
    return { error: null };
  } catch (error) {
    console.error('Error saving contact message:', error);
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
    const { getDoc } = await import('firebase/firestore');
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

// OTP Verification
export const storeVerificationCode = async (email: string, code: string) => {
  try {
    const codeRef = doc(db, 'verification_codes', `${email}_${Date.now()}`);
    await setDoc(codeRef, {
      email,
      code,
      verified: false,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min expiry
      created_at: new Date().toISOString()
    });
    return { error: null };
  } catch (error) {
    console.error('Error storing verification code:', error);
    return { error };
  }
};

export const verifyCode = async (email: string, code: string) => {
  try {
    const codesRef = collection(db, 'verification_codes');
    const q = query(codesRef, where('email', '==', email), where('code', '==', code), where('verified', '==', false));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { valid: false };
    }

    const docData = querySnapshot.docs[0];
    const data = docData.data();

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      return { valid: false };
    }

    // Mark as verified
    await setDoc(doc(db, 'verification_codes', docData.id), { ...data, verified: true }, { merge: true });

    return { valid: true };
  } catch (error) {
    console.error('Error verifying code:', error);
    return { valid: false };
  }
};
