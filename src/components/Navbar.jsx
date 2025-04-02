import React, { useEffect, useState } from "react";
import { Menu, Search, ShoppingCart, Cpu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useFirebase } from "../context/FirebaseContext";

export default function Navbar() {
  const location = useLocation();
  const { user, getCartCount } = useFirebase();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchCartCount = async () => {
        const count = await getCartCount(user.uid);
        setCartCount(count);
      };
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [user]);

  const isActive = (path) => {
    return location.pathname === path
      ? "text-lime-500"
      : "text-gray-300 hover:text-lime-500";
  };

  return (
    <nav className="bg-gray-900 fixed w-full top-0 z-50 border-b border-lime-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Cpu className="h-10 w-10 text-lime-500" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">
                NE
                <span className="text-lime-500 font-extrabold">
                X
                </span>
                US

              </span>
              <span className="text-xs text-gray-400">COMPUTING SOLUTIONS</span>
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
            <Search className="h-6 w-6 text-gray-400 hover:text-lime-500 cursor-pointer transition-colors" />
            <div className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-6 w-6 text-gray-400 hover:text-lime-500 cursor-pointer transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-lime-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
            <Menu className="h-6 w-6 text-gray-400 hover:text-lime-500 cursor-pointer transition-colors md:hidden" />
          </div>
        </div>
      </div>
    </nav>
  );
}
