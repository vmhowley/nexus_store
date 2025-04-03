import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, MinusCircle, PlusCircle, CreditCard, ShoppingCart } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { auth } from '../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Cart() {
  const navigate = useNavigate();
  const { getProduct } = useFirebase();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCartItems = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const cartRef = collection(db, 'carts');
      const q = query(cartRef, where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const items = [];
      for (const doc of querySnapshot.docs) {
        const cartItem = doc.data();
        const product = await getProduct(cartItem.productId);
        items.push({
          id: doc.id,
          quantity: cartItem.quantity,
          product
        });
      }
      
      setCartItems(items);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const cartRef = doc(db, 'carts', cartItemId);
      await updateDoc(cartRef, { quantity: newQuantity });
      await fetchCartItems();
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const cartRef = doc(db, 'carts', cartItemId);
      await deleteDoc(cartRef);
      setCartItems(cartItems.filter(item => item.id !== cartItemId));
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.21; // 21% tax as in your original code
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-purple-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Waiting</h1>
            <p className="text-gray-400 mb-8">Please sign in to view your cart and complete your purchase.</p>
            <button 
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors"
              onClick={() => navigate('/login')}
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
      <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">Error loading cart: {error}</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-purple-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-8">Start adding some awesome products to your cart!</p>
            <button 
              className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-xl p-6 border border-purple-500/20">
                  <div className="flex items-center gap-6">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{item.product.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{item.product.specs.cpu}</p>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-400 hover:text-purple-500 transition-colors"
                        >
                          <MinusCircle className="h-5 w-5" />
                        </button>
                        <span className="text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-400 hover:text-purple-500 transition-colors"
                        >
                          <PlusCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white mb-2">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/20 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax (21%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-700 pt-4 flex justify-between text-white">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-2">
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