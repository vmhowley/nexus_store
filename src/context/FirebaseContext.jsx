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
  const [cartCount, setCartCount] = useState(0); // Nuevo estado para el badge


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("User logged in:", currentUser.email);
        await syncCartAfterLogin(currentUser.uid);
        const count = await getCartCount(currentUser.uid);
        setCartCount(count); // Actualiza el badge al iniciar sesión
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
  
  const updateCartItem = async (userId,cartItemId, newQuantity) => {
    try {
      const cartItemRef = doc(db, "carts", cartItemId);
      await updateDoc(cartItemRef, { quantity: newQuantity });

    } catch (err) {
      console.error("Error actualizando el producto en el carrito:", err);
    }
    const count = await getCartCount(userId);
    setCartCount(count);
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
      totalCount += doc.data().quantity;
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
  
   // Sincronizar carrito al iniciar sesión
   const syncCartAfterLogin = async (userId) => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    for (const item of localCart) {
      await addToCart(userId, item.productId, item.quantity);
    }
    localStorage.removeItem("cart"); 
    const count = await getCartCount(userId);
    setCartCount(count);
  };

    // Agregar producto al carrito y actualizar el badge sin recargar
    const addToCart = async (userId, productId, selectedConfig, quantity = 1) => {
      try {
        if (userId) {
          const cartRef = collection(db, 'carts');
          const q = query(
            cartRef,
            where('userId', '==', userId),
            where('productId', '==', productId),
            where('config', '==', selectedConfig) // Filtra por configuración
          );
          const querySnapshot = await getDocs(q);
    
          if (querySnapshot.empty) {
            await addDoc(cartRef, { userId, productId, config: selectedConfig, quantity });
          } else {
            const cartItem = querySnapshot.docs[0];
            await updateDoc(doc(db, 'carts', cartItem.id), {
              quantity: cartItem.data().quantity + quantity
            });
          }
    
          // Actualiza el contador del carrito
          const count = await getCartCount(userId);
          setCartCount(count);
        } else {
          // Si el usuario no está autenticado, guardar en localStorage
          const cart = JSON.parse(localStorage.getItem("cart")) || [];
          const itemIndex = cart.findIndex(item => item.productId === productId && item.config === selectedConfig);
    
          if (itemIndex !== -1) {
            cart[itemIndex].quantity += quantity;
          } else {
            cart.push({ productId, config: selectedConfig, quantity });
          }
    
          localStorage.setItem("cart", JSON.stringify(cart));
          setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
        }
      } catch (err) {
        console.error("Error al agregar al carrito:", err);
      }
    };
 // Eliminar producto del carrito y actualizar el badge sin recargar
 const removeFromCart = async (cartItemId) => {
  try {
    await deleteDoc(doc(db, "carts", cartItemId));
    console.log("Producto eliminado del carrito:", cartItemId);

    if (user) {
      const count = await getCartCount(user.uid);
      setCartCount(count); // Actualiza el badge después de eliminar
    }
  } catch (err) {
    console.error("Error eliminando el producto del carrito:", err);
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