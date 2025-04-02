import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where 
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("User logged in:", currentUser.email);
        syncCartAfterLogin(currentUser.uid);
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
  
  const updateCartItem = async (cartItemId, newQuantity) => {
    try {
      const cartItemRef = doc(db, "carts", cartItemId);
      await updateDoc(cartItemRef, { quantity: newQuantity });
    } catch (err) {
      console.error("Error actualizando el producto en el carrito:", err);
    }
  };
  
  const removeFromCart = async (cartItemId) => {
    try {
      await deleteDoc(doc(db, "carts", cartItemId));
      console.log("Producto eliminado del carrito:", cartItemId);
      window.location.reload(); // Recargar la página para reflejar los cambios

      if (user) {
        const count = await getCartCount(user.uid);  // Actualiza el count del carrito
        setCartCount(count);
        window.location.reload(); // Recargar la página para reflejar los cambios
      }
    } catch (err) {
      console.error("Error eliminando el producto del carrito:", err);
    }
  };

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

  // Obtener la cantidad total de productos en el carrito
  const getCartCount = async (userId) => {
    try {
      const cartRef = collection(db, "carts");
      const q = query(cartRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
  
      let totalCount = 0;
      querySnapshot.forEach((doc) => {
        totalCount += doc.data().quantity; // Sumar la cantidad de cada producto
      });
  
      return totalCount;
    } catch (err) {
      console.error("Error al obtener el carrito:", err);
      return 0;
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
 // Registro de usuario
  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Inicio de sesión
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      throw new Error(err.message);
    }
  };
  
  const syncCartAfterLogin = async (userId) => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    for (const item of localCart) {
      await addToCart(userId, item.productId, item.quantity);
    }
    localStorage.removeItem("cart"); // Borrar el carrito local después de sincronizar
  };

  // Add a product to cart
  const addToCart = async (userId, productId, quantity = 1) => {
    try {
      if (userId) {
        // Usuario autenticado: Guardar en Firebase
        const cartRef = collection(db, 'carts');
        const q = query(cartRef, where('userId', '==', userId), where('productId', '==', productId));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          await addDoc(cartRef, { userId, productId, quantity });
          window.location.reload(); // Recargar la página para reflejar los cambios

        } else {
          const cartItem = querySnapshot.docs[0];
          await updateDoc(doc(db, 'carts', cartItem.id), {
            quantity: cartItem.data().quantity + quantity
          });
          window.location.reload(); // Recargar la página para reflejar los cambios

        }
      } else {
        // Usuario NO autenticado: Guardar en localStorage
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const itemIndex = cart.findIndex(item => item.productId === productId);
  
        if (itemIndex !== -1) {
          cart[itemIndex].quantity += quantity;
        } else {
          cart.push({ productId, quantity });
        }
  
        localStorage.setItem("cart", JSON.stringify(cart));
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
    user,
    register,
    login,
    logout,
    products,
    loading,
    error,
    getProduct,
    getCartCount,
    addToCart,
    getCart,
  updateCartItem,
  removeFromCart,
    clearCart,
    addToWishlist,
    fetchProducts
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}