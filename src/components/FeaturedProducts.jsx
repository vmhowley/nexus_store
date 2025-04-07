import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Star, Heart, Cpu, MemoryStick, HardDrive, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { auth } from '../firebase/config';

function CustomArrow({ className, style, onClick, direction }) {
  const Icon = direction === 'next' ? ChevronRight : ChevronLeft;
  return (
    <button
      className={`${className} !bg-dark/80 !w-10 !h-10 rounded-full flex items-center justify-center hover:bg-dark transition-colors before:content-none`}
      style={{ ...style, display: 'flex' }}
      onClick={onClick}
    >
      <Icon className="w-6 h-6 text-white" />
    </button>
  );
}

function ConfigurationModal({ configurations, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-light rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-dark">All Configurations</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-accent" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-dark font-medium mb-2">Processors</h4>
            <div className="space-y-2">
              {configurations.processors?.map((processor, index) => (
                <div key={index} className="flex items-center text-dark bg-secondary/50 p-2 rounded-lg">
                  <Cpu className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  <span className="text-sm">{processor.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-dark font-medium mb-2">Graphics Cards</h4>
            <div className="space-y-2">
              {configurations.gpu?.map((gpu, index) => (
                <div key={index} className="flex items-center text-dark bg-secondary/50 p-2 rounded-lg">
                  <MemoryStick className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  <span className="text-sm">{gpu.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-dark font-medium mb-2">Memory</h4>
            <div className="space-y-2">
              {configurations.ram?.map((ram, index) => (
                <div key={index} className="flex items-center text-dark bg-secondary/50 p-2 rounded-lg">
                  <HardDrive className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  <span className="text-sm">{ram.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-primary font-medium mb-2">Storage</h4>
            <div className="space-y-2">
              {configurations.storage?.map((storage, index) => (
                <div key={index} className="flex items-center text-dark bg-secondary/50 p-2 rounded-lg">
                  <HardDrive className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  <span className="text-sm">{storage.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const navigate = useNavigate();
  const { products, loading, error, addToWishlist } = useFirebase();
  const [selectedConfig, setSelectedConfig] = useState(null);

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

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    nextArrow: <CustomArrow direction="next" />,
    prevArrow: <CustomArrow direction="prev" />,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    dotsClass: "slick-dots !bottom-4",
    customPaging: () => (
      <div className="w-2 h-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors" />
    )
  };

  if (loading) {
    return (
      <div className="bg-dark py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-light rounded-2xl p-4 animate-pulse">
                <div className="h-60 bg-gray-700 rounded-xl mb-4" />
                <div className="space-y-3">
                  <div className="h-6 bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-700 rounded w-1/2" />
                  <div className="h-4 bg-gray-700 rounded w-2/3" />
                  <div className="h-4 bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Products</h3>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark py-24 h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Featured Builds
          </h2>
          <p className="text-accent max-w-2xl mx-auto">
            Experience computing excellence with our carefully curated selection
            of premium pre-built systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-light rounded-2xl overflow-hidden border border-primary/20 hover:border-primary/40 transition-all  transform hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10"
              // onClick={() => handleProductClick(product.id)}
            >
              <div className="relative">
                <div
                  onClick={() => handleProductClick(product.id)}
                  className="aspect-[4/3]  cursor-pointer"
                >
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <button
                  className="absolute top-4 right-4 p-2 bg-dark/80 backdrop-blur-sm rounded-full hover:bg-dark z-10 transition-colors"
                  onClick={(e) => handleWishlist(e, product.id)}
                >
                  <Heart className="h-5 w-5 text-primary" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-dark line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 text-primary fill-current" />
                    <span className="ml-1 text-primary text-sm font-medium">
                      {product.rating}
                    </span>
                  </div>
                </div>
                <p className="text-dark mb-1 font-semibold line-clamp-3">
                  Basic Configuration:
                </p>
                
                  <div className="flex items-center text-dark">
                    <Cpu className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm truncate">
                      {product.specs.cpu}
                    </span>
                  </div>
                
                  <div className="flex items-center text-dark">
                    <MemoryStick className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm truncate">
                      {product.specs.gpu}
                    </span>
                  </div>
                <div className="flex items-center text-dark">
                    <HardDrive className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm truncate">
                      {product.specs.ram}
                    </span>
                  </div>
                
                {product.configurations && (
                  <div className="mb-6 ">
                    <button
                      className="mt-3 text-sm text-primary hovertext-secondarytransition-colors cursor-pointer font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConfig(product.configurations);
                      }}
                    >
                      Available Configurations
                      <span className="ml-1 text-secondary">
                        {product.configurations.length}
                      </span>
                      <span className="ml-1 text-secondary">
                        <ChevronRight className="h-4 w-4 inline" />
                      </span>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                  <button
                    className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
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
          ))}
        </div>
      </div>

      {selectedConfig && (
        <ConfigurationModal
          configurations={selectedConfig}
          onClose={() => setSelectedConfig(null)}
        />
      )}
    </div>
  );
}