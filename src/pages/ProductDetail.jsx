import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Heart, Cpu, MemoryStick, HardDrive, Shield, Clock, Truck } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { auth } from '../firebase/config';

export default function ProductDetail() {
  const { id } = useParams();
  const { getProduct, addToCart, addToWishlist } = useFirebase();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProduct(id);
        setProduct(productData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, getProduct]);

  const handleAddToCart = async () => {
    try {
      const userId = auth.currentUser ? auth.currentUser.uid : null;
      await addToCart(userId, id);
      alert('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!auth.currentUser) {
      alert('Please sign in to add items to wishlist');
      return;
    }
    try {
      await addToWishlist(auth.currentUser.uid, id);
      alert('Added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-lime-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-20 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Product not found</div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full rounded-2xl shadow-2xl"
            />
            <button 
              className="absolute top-4 right-4 p-3 bg-gray-900/80 backdrop-blur-sm rounded-full hover:bg-gray-900"
              onClick={handleAddToWishlist}
            >
              <Heart className="h-6 w-6 text-lime-500" />
            </button>
          </div>

          <div>
            <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="ml-1 text-gray-400">{product.rating}</span>
              </div>
              <span className="mx-2 text-gray-600">•</span>
              <span className="text-gray-400">{product.reviews} reviews</span>
            </div>
            
            <p className="text-gray-300 mb-8">{product.description}</p>

            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex items-center text-gray-300">
                    <span className="capitalize text-gray-400 w-24">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-300">
                    <Shield className="h-4 w-4 text-lime-500 mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-800 rounded-xl p-6 mb-8">
              <div>
                <span className="text-gray-400">Price</span>
                <div className="text-3xl font-bold text-white">${product.price}</div>
              </div>
              <button 
                className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-400">
                <Clock className="h-5 w-5 mr-2 text-lime-500" />
                <span>Ships in 3-5 days</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Truck className="h-5 w-5 mr-2 text-lime-500" />
                <span>Free shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}