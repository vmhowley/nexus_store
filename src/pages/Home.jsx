import React from 'react';
import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import Features from '../components/Features';

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <Features />
    </main>
  );
}