import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  MinusCircle,
  PlusCircle,
  CreditCard,
  ShoppingCart,
} from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";
import { auth } from "../firebase/config";
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Cart() {
  const navigate = useNavigate();
  const { getCart, updateCartItem, removeFromCart, getProduct } = useFirebase();
  const [cartItems, setCartItems] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docRef, setDocRef] = useState();
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const cartData = await getCart(auth.currentUser.uid);
      const detailedCart = await Promise.all(
        cartData.map(async (item) => {
          const product = await getProduct(item.productId);
          console.log(cartData);
          return {
            ...item,
            ...product,
            cartId: item.id,
            selectedConfigs: item.selectedConfigs || {},
          };
        })
      );
      setCartItems(detailedCart);
      setCartData(cartData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchCart();
    }
    setLoading(false);

  }, [auth.currentUser]);

  const calculateItemTotal = (item) => {
    let configTotal = 0;

    // Calculate additional costs from selected configurations
    if (item.config) {
      // Add processor cost if selected
      if (item.config.processors) {
        const processor = item.config.processors;
        configTotal += processor.price;
      }

      // Add GPU cost if selected
      if (item.config.gpu) {
        const gpu = item.config.gpu;
        if (gpu) configTotal += gpu.price;
      }

      // Add RAM cost if selected
      if (item.config.ram) {
        const ram = item.config.ram;
        if (ram) configTotal += ram.price;
      }

      // Add storage cost if selected
      if (item.config.storage) {
        const storage = item.config.storage;
        if (storage) configTotal += storage.price;
      }
    }

    // Base price + configuration costs * quantity
    return (item.price + configTotal) * item.quantity;
  };

  const updateQuantity = async (cartId, change) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.cartId === cartId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
    const updatedItem = cartItems.find((item) => item.cartId === cartId);
    if (updatedItem) {
      const newQuantity = Math.max(1, updatedItem.quantity + change);
      await updateCartItem(auth.currentUser.uid, cartId, newQuantity);
    }
  };

  const handleRemoveItem = async (cartId) => {
    try {
      await removeFromCart(cartId);
      setCartItems(cartItems.filter((item) => item.cartId !== cartId));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  );
  const tax = subtotal * 0.03;
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-500"></div>
      </div>
    );
  }
  const handleCheckout = async () => {
    if (!auth.currentUser) return;

    try {
      // Guardar orden en Firestore
     const docRef = await addDoc(collection(db, "orders"), {
        userId: auth.currentUser.uid,
        items: cartItems.map((item) => ({
          productId: item.cartId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          selectedConfigs: item.config,
          total: calculateItemTotal(item),
        })),
        subtotal,
        tax,
        total,
        status: "pending",
        createdAt: new Date(),
      });
      setDocRef(docRef.id); // Guardar referencia del documento
      // Limpiar carrito
      for (const item of cartItems) {
        await removeFromCart(item.cartId);
      }
      setCartItems([]);

      // Redirigir
      navigate(`/order-success/${docRef.id}`);
    } catch (error) {
      console.error("Error al hacer checkout:", error);
      alert("Hubo un problema al procesar tu orden. Intenta de nuevo.");
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="pt-20 min-h-screen bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-light mb-4">
              Your Cart is Waiting
            </h1>
            <p className="text-accent mb-8">
              Please sign in to view your cart and complete your purchase.
            </p>
            <button
              className="bg-primary hover:bg-secondary text-dark px-8 py-3 rounded-full text-lg font-medium transition-colors"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen bg-dark flex items-center justify-center">
        <div className="text-red-500">Error loading cart: {error}</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-light mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-dark mb-8">
              Start adding some awesome products to your cart!
            </p>
            <button
              className="bg-primary hover:bg-secondary text-dark px-8 py-3 rounded-full text-lg font-medium transition-colors"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-light mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const itemTotal = calculateItemTotal(item);
                if (!itemTotal) return null; // Skip if itemTotal is undefined or null

                return (
                  <div
                    key={item.cartId}
                    className="bg-light rounded-xl p-6 border border-accent/20"
                  >
                    <div className="flex items-center gap-6">
                      <img
                        src={item.images && item.images[0] }
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-dark mb-2">
                          {item.name}
                        </h3>
                        {/* <p className="text-dark text-sm mb-2">
                          Base price: ${item.price}
                        
                        </p> */}
                        {item.config && (
                          <div className="text-dark font-semibold text-xs mb-2 flex  line-clamp-1 gap-1">
                            <p>
                              {item.config.processors
                                ? item.config.processors.name
                                : "None"}
                            </p>
                            |
                            <p>
                              {item.config.gpu ? item.config.gpu.name : "None"}
                            </p>
                            |
                            <p>
                              {item.config.ram ? item.config.ram.name : "None"}
                            </p>
                            |
                            <p>
                              {item.config.storage
                                ? item.config.storage.name
                                : "None"}
                            </p>
                          </div>
                        )}
                        <p className="text-dark text-sm mb-2">
                          Quantity: {item.quantity}
                        </p>

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateQuantity(item.cartId, -1)}
                            className="text-dark hover:text-purple-500 transition-colors"
                          >
                            <MinusCircle className="h-5 w-5" />
                          </button>
                          <span className="text-dark">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartId, 1)}
                            className="text-dark hover:text-purple-500 transition-colors"
                          >
                            <PlusCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-dark mb-2">
                          ${itemTotal.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.cartId)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-light rounded-xl p-6 border border-accent/20 sticky top-24">
              <h2 className="text-xl font-bold text-dark mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-dark">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-dark">
                  <span>Tax (3%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-700 pt-4 flex justify-between text-dark">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
              </div>

              <button 
  onClick={handleCheckout}
  className="w-full bg-primary hover:bg-secondary text-dark hover:text-light py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-2"
>
  <CreditCard className="h-5 w-5" />
  Proceed to Checkout
</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
