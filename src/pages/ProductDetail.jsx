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

        // Inicializar selección con la primera opción de cada categoría
        const initialConfig = {};
        if (productData.configurations) {
          Object.keys(productData.configurations).forEach((key) => {
            initialConfig[key] = productData.configurations[key][0];
          });
        }

        setSelectedConfig(initialConfig);
        setFinalPrice(productData.price);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, getProduct]);

  const handleConfigChange = (category, option) => {
    setSelectedConfig((prev) => ({
      ...prev,
      [category]: option,
    }));

    // Recalcular precio sumando los valores de las selecciones
    const extraCost = Object.values({ ...selectedConfig, [category]: option }).reduce((acc, item) => acc + (item.price || 0), 0);
    setFinalPrice(product.price + extraCost);
  };

  const handleAddToCart = async () => {
    if (!auth.currentUser) {
      console.log('Please sign in to add items to cart');
      return;
    }
    try {
      await addToCart(auth.currentUser.uid, id, selectedConfig);
      console.log('Added to cart with configuration:', selectedConfig);
    } catch (error) {
      console.log('Failed to add to cart');
    }
  };

  if (loading) return <div className="pt-20 min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !product) return <div className="pt-20 min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="pt-20 bg-dark min-h-screen px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <Slider dots infinite speed={500} slidesToShow={1} slidesToScroll={1} arrows>
              {product.images.map((img, index) => (
                <div key={index}>
                  <img src={img} alt={product.name} className="w-full rounded-2xl shadow-2xl" />
                </div>
              ))}
            </Slider>
            <button 
              className="absolute top-4 right-4 p-3 bg-gray-900/80 backdrop-blur-xs rounded-full hover:bg-gray-900"
              onClick={() => addToWishlist(auth.currentUser?.uid, id)}
            >
              <Heart className="h-6 w-6 text-secondary" />
            </button>
          </div>

          <div>
            <h1 className="text-xl font-bold text-light mb-4">{product.name}</h1>
            
            {product.configurations && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-light mb-4">Customize your PC</h3>
                {Object.keys(product.configurations).map((category) => (
                  <div key={category} className="mb-4">
                    <label className="text-light font-semibold">{category}:</label>
                    <div className="flex flex-wrap mt-2 gap-2">
                      {product.configurations[category].map((option) => (
                        <button
                          key={option.name}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            selectedConfig[category]?.name === option.name
                              ? 'bg-primary text-white'
                              : 'bg-gray-800 text-light hover:bg-gray-700'
                          }`}
                          onClick={() => handleConfigChange(category, option)}
                        >
                          {option.name} (+${option.price || 0})
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between bg-light rounded-xl p-6 mb-8">
              <div>
                <span className="text-dark">Final Price</span>
                <div className="text-3xl font-bold text-dark">${finalPrice}</div>
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
