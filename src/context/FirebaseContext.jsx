import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';

const FirebaseContext = createContext();

export const useFirebase = () => useContext(FirebaseContext);

export function FirebaseProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Get a single product
  const getProduct = async (id) => {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Add a product to cart
  const addToCart = async (userId, productId, quantity = 1) => {
    try {
      const cartRef = collection(db, 'carts');
      const q = query(cartRef, where('userId', '==', userId), where('productId', '==', productId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(cartRef, {
          userId,
          productId,
          quantity
        });
      } else {
        const cartItem = querySnapshot.docs[0];
        await updateDoc(doc(db, 'carts', cartItem.id), {
          quantity: cartItem.data().quantity + quantity
        });
      }
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Add to wishlist
  const addToWishlist = async (userId, productId) => {
    try {
      const wishlistRef = collection(db, 'wishlists');
      await addDoc(wishlistRef, {
        userId,
        productId,
        createdAt: new Date()
      });
    } catch (err) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const value = {
    products,
    loading,
    error,
    getProduct,
    addToCart,
    addToWishlist,
    fetchProducts
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}