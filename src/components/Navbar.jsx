import React, { useEffect, useState } from "react";
import { Menu, Search, ShoppingCart, Cpu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useFirebase } from "../context/FirebaseContext";

export default function Navbar() {
  const location = useLocation();
  const { user, getCartCount } = useFirebase();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = async () => {
      if (user) {
        const count = await getCartCount(user.uid);
        setCartCount(count);
      }
    };

    updateCartCount();
  }, [user]);

  const isActive = (path) => {
    return location.pathname === path
      ? "text-accent"
      : "text-light font-semibold hover:text-primary hover:underline";
  };

  return (
    <nav className="bg-dark fixed w-full top-0 z-50   shadow-lg ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Cpu className="size-10 text-primary" />
            <div className="flex flex-col  ">

  <svg width="200" height="150" viewBox="40 -4 350 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    
    <text x="50" y="80" font-family="Arial, sans-serif" font-size="50" font-weight="bold" fill="white">NE</text>
    
    <g transform="translate(120,40)">
        <path d="M10 0 L50 40" stroke="#2EAF7D" stroke-width="10" stroke-linecap="round"/>
        <path d="M50 0 L10 40" stroke="#2EAF7D" stroke-width="10" stroke-linecap="round"/>
    </g>
    
    <text x="180" y="80" font-family="Arial, sans-serif" font-size="50" font-weight="bold" fill="white">US</text>
    
    <text x="75" y="110" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" letter-spacing="2">NEXT-GEN COMPUTING</text>
</svg>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/discover"
              className={`${isActive(
                "/discover"
              )} transition-colors text-sm uppercase tracking-wider`}
            >
              Discover
            </Link>
            <Link
              to="/products"
              className={`${isActive(
                "/products"
              )} transition-colors text-sm uppercase tracking-wider`}
            >
              Products
            </Link>
            <Link
              to="/pre-build"
              className={`${isActive(
                "/pre-build"
              )} transition-colors text-sm uppercase tracking-wider`}
            >
              pre-build
            </Link>
            <Link
              to="/enterprise"
              className={`${isActive(
                "/enterprise"
              )} transition-colors text-sm uppercase tracking-wider`}
            >
              Enterprise
            </Link>
            <Link
              to="/support"
              className={`${isActive(
                "/support"
              )} transition-colors text-sm uppercase tracking-wider`}
            >
              Support
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Search className="h-6 w-6 text-gray-400 hover:text-accent cursor-pointer transition-colors" />
            <div className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-6 w-6 text-gray-400 hover:text-accent cursor-pointer transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-lime-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
            <Menu className="h-6 w-6 text-gray-400 hover:text-accent cursor-pointer transition-colors md:hidden" />
          </div>
        </div>
      </div>
    </nav>
  );
}
