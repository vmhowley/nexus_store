import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FirebaseProvider } from './context/FirebaseContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Products from './pages/Products';
import Enterprise from './pages/Enterprise';
import Login from './pages/Login';
import Login1 from './pages/Login1';
import Register from './pages/Register';
import Support from './pages/Support';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Cart1 from './pages/Cart1';
import ScrollToTop from "./ScrollToTop";
import { CartProvider } from './context/CartProvider';

function App() {
  return (
    <>
    <FirebaseProvider>
      <Router>
        <ScrollToTop/>
        <div className="min-h-screen bg-white">
          <CartProvider>
          <Navbar />
          </CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/cart1" element={<Cart1 />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/products" element={<Products />} />
            <Route path="/enterprise" element={<Enterprise />} />
            <Route path="/support" element={<Support />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
          <footer className="bg-dark text-accent py-12 border-t border-lime-500/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p>&copy; 2025 NEXUS Computing Solutions. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </Router>
    </FirebaseProvider>
    </>
  );
}

export default App;