import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, addDoc 
} from "firebase/firestore";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "firebase/auth";
import { db } from "../firebase/config";

const FirebaseContext = createContext();

export const useFirebase = () => useContext(FirebaseContext);

export function FirebaseProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("User logged in:", currentUser.email);
        await syncCartAfterLogin(currentUser.uid);
        const count = await getCartCount(currentUser.uid);
        setCartCount(count);
      }
    });
    return () => unsubscribe();
  }, []);

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

  // Add a new product
  const addProduct = async (productData) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), productData);
      const newProduct = { id: docRef.id, ...productData };
      setProducts(prevProducts => [...prevProducts, newProduct]);
      return newProduct;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Update a product
  const updateProduct = async (id, productData) => {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, productData);
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === id ? { ...product, ...productData } : product
        )
      );
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Delete a product
  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
    } catch (err) {
      throw new Error(err.message);
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

  // Get cart items
  const getCart = async (userId) => {
    try {
      const cartRef = collection(db, "carts");
      const q = query(cartRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      console.error("Error obteniendo el carrito:", err);
      return [];
    }
  };

  // Update cart item
  const updateCartItem = async (userId, cartItemId, newQuantity) => {
    try {
      const cartItemRef = doc(db, "carts", cartItemId);
      await updateDoc(cartItemRef, { quantity: newQuantity });
    } catch (err) {
      console.error("Error actualizando el producto en el carrito:", err);
    }
    const count = await getCartCount(userId);
    setCartCount(count);
  };

  // Clear cart
  const clearCart = async (userId) => {
    try {
      const cartRef = collection(db, "carts");
      const q = query(cartRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
  
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (err) {
      console.error("Error al limpiar el carrito:", err);
    }
  };

  // Get cart count
  const getCartCount = async (userId) => {
    try {
      const cartRef = collection(db, "carts");
      const q = query(cartRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      let totalCount = 0;
      querySnapshot.forEach((doc) => {
        totalCount += doc.data().quantity;
      });

      return totalCount;
    } catch (err) {
      console.error("Error al obtener el carrito:", err);
      return 0;
    }
  };

  // Add to cart
  const addToCart = async (userId, productId, selectedConfig, price, quantity = 1) => {
    try {
      if (userId) {
        const cartRef = collection(db, 'carts');
        const q = query(
          cartRef,
          where('userId', '==', userId),
          where('productId', '==', productId)
        );
        const querySnapshot = await getDocs(q);

        let existingCartItem = null;

        querySnapshot.forEach((doc) => {
          const itemData = doc.data();
          if (JSON.stringify(itemData.config) === JSON.stringify(selectedConfig)) {
            existingCartItem = { id: doc.id, ...itemData };
          }
        });

        if (existingCartItem) {
          await updateDoc(doc(db, 'carts', existingCartItem.id), {
            quantity: existingCartItem.quantity + quantity
          });
        } else {
          await addDoc(cartRef, {
            userId,
            productId,
            config: selectedConfig,
            quantity,
            price
          });
        }

        setCartCount(prevCount => prevCount + quantity);
      } else {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const itemIndex = cart.findIndex(
          item => item.productId === productId && JSON.stringify(item.config) === JSON.stringify(selectedConfig)
        );

        if (itemIndex !== -1) {
          cart[itemIndex].quantity += quantity;
        } else {
          cart.push({ productId, config: selectedConfig, quantity, price });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
      }
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
    }
  };

  // Remove from cart
  const removeFromCart = async (cartItemId) => {
    try {
      await deleteDoc(doc(db, "carts", cartItemId));
      console.log("Producto eliminado del carrito:", cartItemId);

      if (user) {
        const count = await getCartCount(user.uid);
        setCartCount(count);
      }
    } catch (err) {
      console.error("Error eliminando el producto del carrito:", err);
    }
  };

  // Authentication functions
  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Sync cart after login
  const syncCartAfterLogin = async (userId) => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    for (const item of localCart) {
      await addToCart(userId, item.productId, item.quantity);
    }
    localStorage.removeItem("cart");
    const count = await getCartCount(userId);
    setCartCount(count);
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
    user,
    register,
    login,
    logout,
    products,
    loading,
    error,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    getCartCount,
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    addToWishlist,
    cartCount,
    setCartCount,
    fetchProducts
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}