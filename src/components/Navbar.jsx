import React, { useEffect, useState } from "react";
import { Menu, Search, ShoppingCart, Cpu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useFirebase } from "../context/FirebaseContext";

export default function Navbar() {
  const location = useLocation();
  const { user, getCartCount } = useFirebase();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <nav className="bg-dark fixed w-full top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Cpu className="size-10 text-primary" />
            <span className="text-white text-xl font-bold">NEXUS</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/discover" className={isActive("/discover")}>
              Discover
            </Link>
            <Link to="/products" className={isActive("/products")}>
              Products
            </Link>
            <Link to="/pre-build" className={isActive("/pre-build")}>
              Pre-build
            </Link>
            <Link to="/enterprise" className={isActive("/enterprise")}>
              Enterprise
            </Link>
            <Link to="/support" className={isActive("/support")}>
              Support
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <Search className="h-6 w-6 text-gray-400 hover:text-accent cursor-pointer transition-colors" />
            <div className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-6 w-6 text-gray-400 hover:text-accent cursor-pointer transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-light text-dark text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
              {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-dark absolute w-full top-20 left-0 right-0 shadow-lg py-4 px-6 flex flex-col space-y-4">
          <Link to="/discover" className={isActive("/discover")} onClick={() => setIsMenuOpen(false)}>
            Discover
          </Link>
          <Link to="/products" className={isActive("/products")} onClick={() => setIsMenuOpen(false)}>
            Products
          </Link>
          <Link to="/pre-build" className={isActive("/pre-build")} onClick={() => setIsMenuOpen(false)}>
            Pre-build
          </Link>
          <Link to="/enterprise" className={isActive("/enterprise")} onClick={() => setIsMenuOpen(false)}>
            Enterprise
          </Link>
          <Link to="/support" className={isActive("/support")} onClick={() => setIsMenuOpen(false)}>
            Support
          </Link>
        </div>
      )}
    </nav>
  );
}
