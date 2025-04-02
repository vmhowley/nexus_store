import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FirebaseProvider } from './context/FirebaseContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Products from './pages/Products';
import Enterprise from './pages/Enterprise';
import Login from './pages/Login';
import Register from './pages/Register';
import Support from './pages/Support';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import ScrollToTop from "./ScrollToTop";

function App() {
  return (
    <>
    <FirebaseProvider>
      <Router>
        <ScrollToTop/>
        <div className="min-h-screen bg-white">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/products" element={<Products />} />
            <Route path="/enterprise" element={<Enterprise />} />
            <Route path="/support" element={<Support />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
          <footer className="bg-gray-900 text-gray-400 py-12 border-t border-lime-500/20">
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