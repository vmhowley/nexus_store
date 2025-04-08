import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function OrderSuccess() {
  const { ssid } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      console.log("Fetching order with ssid:", ssid); // Debugging line
      try {
        const orderRef = doc(db, "orders", ssid); // Assume 'userId' is the document ID
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          setOrder(orderDoc.data());
        } else {
          setError("Order not found");
        }
      } catch (err) {
        setError("Error fetching order: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [ssid]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 min-h-screen bg-dark flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-20 min-h-screen bg-dark flex items-center justify-center">
        <div className="text-light">Order not found</div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-light mb-8">Invoice</h1>

        <div className="bg-light rounded-xl p-6 border border-accent/20">
          <h2 className="text-xl font-semibold text-dark mb-4">Order Details</h2>

          <div className="space-y-4">
            <div className="flex justify-between text-dark">
              <span>Order ID:</span>
              <span>{ssid}</span>
            </div>
            <div className="flex justify-between text-dark">
              <span>Order Date:</span>
              <span>{new Date(order.createdAt.seconds * 1000).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-dark">
              <span>Status:</span>
              <span>{order.status}</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-dark mb-4">Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-dark"
                >
                  <span>{item.name} x {item.quantity}</span>
                  <span>${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-700 pt-4">
            <div className="flex justify-between text-dark font-semibold">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-dark font-semibold">
              <span>Tax (3%)</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-dark font-semibold border-t border-gray-700 pt-4">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-secondary text-dark px-8 py-3 rounded-full text-lg font-medium transition-colors"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
