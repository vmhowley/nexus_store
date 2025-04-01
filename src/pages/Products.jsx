import React from 'react';
import FeaturedProducts from '../components/FeaturedProducts';

export default function Products() {
  return (
    <div className="pt-20 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Our Products</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Browse our selection of premium pre-built systems and custom configurations.
          </p>
        </div>
        <FeaturedProducts />
      </div>
    </div>
  );
}