import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Heart } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { auth } from '../firebase/config';

export default function ProductDetail() {
  const { id } = useParams();
  const { getProduct, addToCart, addToWishlist } = useFirebase();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState({});
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProduct(id);
        setProduct(productData);

        // ✅ Verifica si tiene configuraciones antes de acceder
        if (productData?.configurations) {
          const initialConfig = Object.keys(productData.configurations).reduce((acc, key) => {
            acc[key] = productData.configurations[key][0]; // Selecciona la primera opción
            return acc;
          }, {});

          setSelectedConfig(initialConfig);
        } 

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, getProduct]);

  // 📌 Recalcular el precio cuando cambie `selectedConfig`
  useEffect(() => {
    if (product) {
      const basePrice = product.price || 0;
      const extraCost = Object.values(selectedConfig).reduce((acc, item) => acc + (item.price || 0), 0);
      setFinalPrice(basePrice + extraCost);
    }
  }, [selectedConfig, product]);

  // 📌 Cambiar selección de configuración
  const handleConfigChange = (category, option) => {
    setSelectedConfig((prevConfig) => ({
      ...prevConfig,
      [category]: option,
    }));
  };

  // 📌 Agregar al carrito con la configuración y precio seleccionados
  const handleAddToCart = async () => {
    if (!auth.currentUser) {
      console.log('Please sign in to add items to cart');
      return;
    }
    try {
      await addToCart(auth.currentUser.uid, id, selectedConfig, finalPrice);
      console.log('Added to cart with configuration:', selectedConfig);
    } catch (error) {
      console.log('Failed to add to cart', error);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return <div className="pt-20 min-h-screen flex items-center justify-center">Product not found</div>;
  }
  const settings = {
    customPaging: function(i) {
      return (
        <a className=''>
          <img src={product.images[i]} alt={`Thumbnail ${i} `} />
        </a>
      );
    },
    dots: true,
    dotsClass: "slick-dots slick-thumb",
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <div className="pt-20 bg-dark min-h-screen px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative">
            {/* Product Images Slider */}

            {product.images.length > 1 && (
              <Slider {...settings} className="rounded-2xl ">
                {product.images.map((img, index) => (
                  <div
                    className='grid justify-center place content-center items-center bg-white rounded-2xl min-h-[600px] "
'
                    key={index}
                  >
                    <img
                      src={img}
                      alt={product.name}
                      className="rounded-2xl  p-4"
                    />
                  </div>
                ))}
              </Slider>
            )}

            {product.images.length === 1 && (
              <div className="grid justify-center place content-center items-center bg-white rounded-2xl min-h-[600px] ">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="rounded-2xl  p-4"
                />
              </div>
            )}
            {/* Wishlist button */}

            {auth.currentUser && (
              <button
                className="absolute top-4 right-18 p-3 bg-dark/80 backdrop-blur-xs rounded-full hover:bg-primary"
                onClick={() => addToWishlist(auth.currentUser.uid, id)}
              >
                <Heart className="h-6 w-6 text-secondary" />
              </button>
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-light mb-4">
              {product.name}
            </h1>

            {product.configurations.processors[0].name != "" && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-light mb-4">
                  Customize your PC
                </h3>
                {Object.keys(product.configurations).map((category) => (
                  <div key={category} className="mb-4">
                    <label className="text-light font-semibold capitalize">
                      {category}:
                    </label>
                    <div className="flex flex-wrap mt-2 gap-2">
                      {product.configurations[category].map((option) => (
                        <button
                          key={option.name}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            selectedConfig[category]?.name === option.name
                              ? "bg-primary text-white"
                              : "bg-light text-dark hover:bg-secondary hover:text-light"
                          }`}
                          onClick={() => handleConfigChange(category, option)}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Product Description */}
            {product.description && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-light mb-4">
                  Description
                </h3>
                <p className="text-light">{product.description}</p>
              </div>
            )}

            {/* Product Features */}
            {product.features && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-light mb-4">Features</h3>
                <ul className="list-disc list-inside space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-light">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Final Price and Add to Cart Button */}

            <div className="flex items-center justify-between bg-light rounded-xl p-6 mb-8">
              <div>
                <span className="text-dark">Final Price</span>
                <div className="text-3xl font-bold text-dark">
                  ${finalPrice.toFixed(2)}
                </div>
              </div>
              <button
                className="bg-primary hover:bg-secondary text-dark px-8 py-3 rounded-full text-lg font-medium"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

