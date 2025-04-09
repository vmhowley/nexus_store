import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X,
  Save,
  AlertCircle,
  Bell,
  ShoppingBag,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { auth, db } from '../firebase/config';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function Admin() {
  const { products, addProduct, updateProduct, deleteProduct, updateOrderStatus } = useFirebase();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    category: '',
    price: '',
    description: '',
    images: [],
    rating: '',
    features: [''],
    specs: {
      cpu: '',
      gpu: '',
      ram: '',
      disk: ''
    },
    configurations: {
      processors: [{ name: '', price: 0 }],
      gpu: [{ name: '', price: 0 }],
      ram: [{ name: '', price: 0 }],
      storage: [{ name: '', price: 0 }]
    }
  });
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  

  const handleCanvas = (e) => {
    e.preventDefault();
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext("2d");

    canvas.style.background = "#02353C"
    const baselinesAboveAlphabetic = [
      "fontBoundingBoxAscent",
      "actualBoundingBoxAscent",
      "emHeightAscent",
      "hangingBaseline",
    ];
    const baselinesBelowAlphabetic = [
      "ideographicBaseline",
      "emHeightDescent",
      "actualBoundingBoxDescent",
      "fontBoundingBoxDescent",
    ];
    const baselines = [...baselinesAboveAlphabetic, ...baselinesBelowAlphabetic];
    ctx.font = "25px serif";
    ctx.strokeStyle = "red";
    
    baselines.forEach((baseline, index) => {
      const text = 'NEXUS';
      ctx.fillStyle = "white";
      // const textMetrics = ctx.measureText(text);
      
      const x = 20 +index * 20;
      const y = 50 + index * 50;
      ctx.beginPath();
      ctx.font = "30px serif";
      ctx.fillText(text, x, y-5);
      let pos = products[0].model.search(" ")
      console.log(pos)
      const model = products[0].model.slice(0, pos);
      const model2 = products[0].model.slice(pos);
      console.log(model)
      const text1 = model;
      ctx.font = "40px serif";
      ctx.fillText(text1, x, y+60);
      
      ctx.fillStyle = "red";
      ctx.fillRect(x, y+85, 100, parseInt("40px serif", 10));
      ctx.font = "30px serif";
      ctx.fillStyle = "white";
      const text2 = model2;
      ctx.fillText(text2, x, y+118);
      ctx.fillRect(0, y+150, 500, parseInt("200px serif", 10));
      
      const baselineMetricValue = textMetrics[baseline];
      if (baselineMetricValue === undefined) {
        return;
      }

  
    });
  }


   // Listen for new orders
   useEffect(() => {
    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const newOrders = [];
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const order = {
            id: change.doc.id,
            ...change.doc.data(),
            createdAt: change.doc.data().createdAt?.toDate(),
            completedAt: change.doc.data().completedAt?.toDate()
          };
          
          if (change.type === "added") {
            newOrders.push(order);
            
            // Show alert for new pending orders only
            if (order.status === 'pending') {
              setNewOrderAlert(order);
            }
          }
        }
      });

   // Update orders list, maintaining the existing order for modified documents
   setOrders(prevOrders => {
    const updatedOrders = [...prevOrders];
    newOrders.forEach(newOrder => {
      const index = updatedOrders.findIndex(o => o.id === newOrder.id);
      if (index >= 0) {
        updatedOrders[index] = newOrder;
      } else {
        updatedOrders.unshift(newOrder);
      }
    });
    return updatedOrders;
  });
});

return () => unsubscribe();
}, []);

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, newStatus);
      // The orders list will be automatically updated by the snapshot listener
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [field]: value
      }
    }));
  };

  const handleConfigChange = (type, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      configurations: {
        ...prev.configurations,
        [type]: prev.configurations[type].map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const handleFeatureChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addConfigOption = (type) => {
    setFormData(prev => ({
      ...prev,
      configurations: {
        ...prev.configurations,
        [type]: [...prev.configurations[type], { name: '', price: 0 }]
      }
    }));
  };

  const removeConfigOption = (type, index) => {
    setFormData(prev => ({
      ...prev,
      configurations: {
        ...prev.configurations,
        [type]: prev.configurations[type].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        features: formData.features.filter(f => f.trim() !== '')
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }

      setIsModalOpen(false);
      setFormData({
        name: '',
        brand: '',
        model: '',
        category: '',
        price: '',
        description: '',
        images: [],
        rating: '',
        features: [''],
        specs: {
          cpu: '',
          gpu: '',
          ram: '',
          disk: ''
        },
        configurations: {
          processors: [{ name: '', price: 0 }],
          gpu: [{ name: '', price: 0 }],
          ram: [{ name: '', price: 0 }],
          storage: [{ name: '', price: 0 }]
        }
      });
      setEditingProduct(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      model: product.model || '',
      category: product.category || '',
      price: product.price?.toString() || '',
      description: product.description || '',
      images: product.images || [],
      rating: product.rating || '',
      features: product.features || [''],
      specs: product.specs || {
        cpu: '',
        gpu: '',
        ram: '',
        disk: ''
      },
      configurations: product.configurations || {
        processors: [{ name: '', price: 0 }],
        gpu: [{ name: '', price: 0 }],
        ram: [{ name: '', price: 0 }],
        storage: [{ name: '', price: 0 }]
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
   
    <div className="min-h-screen pt-20 bg-dark">
      {/* Order Alert */}
      {newOrderAlert && (
        <div className="fixed top-4 right-4 bg-primary text-white p-4 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-6 w-6" />
            <div>
              <h3 className="font-bold">New Order Received!</h3>
              <p className="text-sm">Order #{newOrderAlert.id.slice(0, 8)} - ${newOrderAlert.total.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => setNewOrderAlert(null)}
              className="ml-4 text-white/80 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Orders Panel Toggle */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => setShowOrdersPanel(!showOrdersPanel)}
          className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center relative"
        >
          <Bell className="h-6 w-6" />
          {orders.filter(o => o.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {orders.filter(o => o.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* Orders Panel */}
      {showOrdersPanel && (
        <div className="fixed right-4 top-20 bg-gray-800 rounded-lg shadow-xl p-4 w-96 max-h-[80vh] overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Orders</h2>
            <button 
              onClick={() => setShowOrdersPanel(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            {orders.map(order => (
              <div 
                key={order.id} 
                className={`bg-gray-700 rounded-lg p-4 border-l-4 ${
                  order.status === 'done' ? 'border-green-500' : 'border-yellow-500'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-medium">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {order.createdAt?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <span className={`text-sm ${
                      order.status === 'done' ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {order.status === 'done' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-white font-medium">
                    Total: ${order.total.toFixed(2)}
                  </p>
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">Items:</p>
                    <ul className="space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${item.total.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {order.status === 'pending' && (
                  <button
                    onClick={() => handleOrderStatusUpdate(order.id, 'done')}
                    disabled={updatingOrderId === order.id}
                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updatingOrderId === order.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Mark as Complete
                      </>
                    )}
                  </button>
                )}

                {order.status === 'done' && order.completedAt && (
                  <p className="mt-2 text-sm text-gray-400">
                    Completed on: {order.completedAt.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-gray-400 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-dark">Product Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-secondary text-dark px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </button>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-light text-dark pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="bg-light rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-light">
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-light">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover mr-3"
                      />
                      <div className="text-sm text-dark">{product.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark">{product.brand}</td>
                  <td className="px-6 py-4 text-sm text-dark">{product.model}</td>
                  <td className="px-6 py-4 text-sm text-dark">{product.category}</td>
                  <td className="px-6 py-4 text-sm text-dark">${product.price}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Product Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-dark rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                    setError(null);
                  }}
                  className="text-gray-400 hover:text-dark"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      className="w-full bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Rating
                    </label>
                    <input
                      type="text"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      className="w-full bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Images (URLs)
                  </label>
                  <div className="space-y-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const newImages = [...formData.images];
                            newImages[index] = e.target.value;
                            setFormData(prev => ({ ...prev, images: newImages }));
                          }}
                          className="flex-1 bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, images: [...prev.images, ''] }))}
                      className="text-accent hover:text-accent flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Image URL
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Features
                  </label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          className="flex-1 bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                          placeholder="Enter a feature"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-accent hover:text-accent flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Feature
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Specifications
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        value={formData.specs.cpu}
                        onChange={(e) => handleSpecsChange('cpu', e.target.value)}
                        placeholder="CPU"
                        className="w-full bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.specs.gpu}
                        onChange={(e) => handleSpecsChange('gpu', e.target.value)}
                        placeholder="GPU"
                        className="w-full bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.specs.ram}
                        onChange={(e) => handleSpecsChange('ram', e.target.value)}
                        placeholder="RAM"
                        className="w-full bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.specs.disk}
                        onChange={(e) => handleSpecsChange('disk', e.target.value)}
                        placeholder="Storage"
                        className="w-full bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Configurations */}
                <div className="space-y-6">
                  {Object.entries(formData.configurations).map(([type, options]) => (
                    <div key={type}>
                      <label className="block text-sm font-medium text-dark mb-2 capitalize">
                        {type}
                      </label>
                      <div className="space-y-2">
                        {options.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={option.name}
                              onChange={(e) => handleConfigChange(type, index, 'name', e.target.value)}
                              placeholder="Name"
                              className="flex-1 bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                            />
                            <input
                              type="number"
                              value={option.price}
                              onChange={(e) => handleConfigChange(type, index, 'price', parseFloat(e.target.value))}
                              placeholder="Price"
                              className="w-32 bg-light text-dark px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => removeConfigOption(type, index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addConfigOption(type)}
                          className="text-accent hover:text-accent flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add {type} Option
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 text-dark hover:text-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-secondary text-dark px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center justify-center mt-10 p-8 bg-light">
          <button onClick={handleCanvas} >Generate canvas</button>
          <canvas id='canvas' height="500" width="500"></canvas>
        </div>
      </div>
    </div>
  );
}