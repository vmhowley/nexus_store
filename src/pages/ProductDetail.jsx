import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Star, Heart, Shield, Clock, Truck } from 'lucide-react';
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
      alert('Failed to add to wishlist');
    }
  };

  if (loading) {
    return <div className="pt-20 min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !product) {
    return <div className="pt-20 min-h-screen flex items-center justify-center">Product not found</div>;
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true
  };

  return (
    <div className="pt-20 bg-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative">
            <Slider {...sliderSettings} className="w-full">
              {product.images.map((img, index) => (
                <div key={index}>
                  <img src={img} alt={product.name} className="w-full rounded-2xl shadow-2xl" />
                </div>
              ))}
            </Slider>
            <button 
              className="absolute top-4 right-4 p-3 bg-gray-900/80 backdrop-blur-xs rounded-full hover:bg-gray-900"
              onClick={handleAddToWishlist}
            >
              <Heart className="h-6 w-6 text-secondary" />
            </button>
          </div>

          <div>
            <h1 className="text-xl font-bold text-light mb-4">{product.name}</h1>
            <div className="flex items-center mb-6">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="ml-1 text-gray-400">{product.rating}</span>
              <span className="mx-2 text-gray-600">•</span>
              <span className="text-primary">{product.reviews} reviews</span>
            </div>
            
            <p className="text-accent mb-8">{product.description}</p>

            <div className="bg-light rounded-xl p-6 ">
              <h3 className="text-xl font-bold text-dark mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex items-center text-dark">
                    <span className="capitalize text-dark font-bold w-24">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-dark mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-300">
                    <Shield className="h-4 w-4 text-secondary mr-2" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-light rounded-xl p-6 mb-8">
              <div>
                <span className="text-dark">Price</span>
                <div className="text-3xl font-bold text-dark">${product.price}</div>
              </div>
              <button 
                className="bg-primary hover:bg-secondary text-dark px-8 py-3 rounded-full text-lg font-medium"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-400">
                <Clock className="h-5 w-5 mr-2 text-secondary" />
                <span>Ships in 3-5 days</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Truck className="h-5 w-5 mr-2 text-secondary" />
                <span>Free shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
