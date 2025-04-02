import React, { useState, useEffect } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";

const Cart = () => {
  const { user, getCart, updateCartItem, removeFromCart, getProduct } =
    useFirebase();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    const cartData = await getCart(user.uid);
    const detailedCart = await Promise.all(cartData.map(async (item) => {
      const product = await getProduct(item.productId);
      return { ...item, ...product, cartId: item.id };  // Asegura que cada producto tenga su cartId correcto
    }));
    setCartItems(detailedCart);
  };

  const updateQuantity = async (id, change) => {
    const updatedItem = cartItems.find((item) => item.id === id);
    const newQuantity = Math.max(0, updatedItem.quantity + change);
    if (newQuantity === 0) {
      await removeFromCart(id);
    } else {
      await updateCartItem(id, newQuantity);
    }
    fetchCart();
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.21;
  const total = subtotal + tax;

  return (
    <div className="pt-20 bg-dark min-h-screen ">
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">Your cart is empty</p>
        </div>
      ) : (
        <div className="pt-20 min-h-screen text-white grid grid-cols-1 lg:grid-cols-3 gap-8  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="lg:col-span-2 ">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-light rounded-lg p-4 mb-4 flex items-center gap-4"
              >
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-24 h-24 object-fill object-center rounded-sm"
                />
                <div className="grow space-y-3">
                  <h3 className="text-lg text-dark font-semibold">{item.name}</h3>
                  <p className="text-dark font-bold">${item.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 text-dark hover:text-secondary"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-8 text-center  text-dark hover:text-secondary">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1  text-dark hover:text-secondary"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={async () => {
                      await removeFromCart(item.cartId);
                      setCartItems(
                        cartItems.filter(
                          (cartItem) => cartItem.cartId !== item.cartId
                        )
                      );
                    }}
                    className="ml-4 p-1 text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-light rounded-lg p-6 h-fit">
            <h2 className="text-xl font-bold mb-4 text-dark">Order Summary</h2>
            <div className="space-y-3 text-dark">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (21%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-600 pt-3 flex justify-between font-bold text-dark">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full bg-primary text-dark hover:text-light py-3 rounded-lg mt-6 font-semibold hover:bg-secondary  transition-colors">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
