import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Star, Heart, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { auth } from '../firebase/config';

export default function FeaturedProducts() {
  const navigate = useNavigate();
  const { products, loading, error, addToWishlist } = useFirebase();

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleWishlist = async (e, productId) => {
    e.stopPropagation();
    if (!auth.currentUser) {
      alert('Please sign in to add items to your wishlist');
      return;
    }
    try {
      await addToWishlist(auth.currentUser.uid, productId);
      alert('Added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="bg-dark py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-lime-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">
            Error loading products: {error}
          </div>
        </div>
      </div>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <div className="bg-dark pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-light mb-4">
            Featured Builds
          </h2>
          <p className="text-accent max-w-2xl mx-auto">
            Experience computing excellence with our carefully curated selection
            of premium pre-built systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="p-4">
              <div
                className="bg-light shadow-md rounded-2xl overflow-hidden border border-secondary/20 hover:border-accent/40 transition-all cursor-pointer transform hover:scale-[1.02] hover:shadow-xl hover:shadow-lime-500/10"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="relative">
                  {product.images.length > 1 ? (
                    <Slider {...sliderSettings}>
                      {product.images.map((image, index) => (
                        <div key={index}>
                          <img src={image} alt={`${product.name} ${index}`} className="w-full h-56 object-center object-cover" />
                        </div>
                      ))}
                    </Slider>
                  ) : (
                    <img src={product.images[0]} alt={product.name} className="w-full h-56 object-center object-cover" />
                  )}
                  <button
                    className="absolute top-4 right-4 p-2 bg-gray-900/80 backdrop-blur-xs rounded-full hover:bg-gray-900"
                    onClick={(e) => handleWishlist(e, product.id)}
                  >
                    <Heart className="h-5 w-5 text-lime-500" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-dark">
                      {product.name}
                    </h3>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="ml-1 text-dark">{product.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-dark">
                      <Cpu className="h-4 w-4 mr-2" />
                      <span className="text-sm">{product.specs.cpu}</span>
                    </div>
                    <div className="flex items-center text-dark">
                      <MemoryStick className="h-4 w-4 mr-2" />
                      <span className="text-sm">{product.specs.gpu}</span>
                    </div>
                    <div className="flex items-center text-dark">
                      <HardDrive className="h-4 w-4 mr-2" />
                      <span className="text-sm">{product.specs.ram}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-dark">
                      ${product.price}
                    </span>
                    <button
                      className="bg-dark hover:bg-light text-white hover:text-dark cursor-pointer px-6 py-2 rounded-full text-sm font-medium transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.id);
                      }}
                    >
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
