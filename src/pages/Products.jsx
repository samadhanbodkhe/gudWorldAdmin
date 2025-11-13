// src/pages/Products.jsx
import React, { useState } from "react";
import { 
  useGetProductsQuery, 
  useDeleteProductMutation,
  useGetLowStockAlertsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useAdjustStockMutation,
  useGetStockHistoryQuery
} from "../redux/api/productApi";
import { toast } from "react-toastify";
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiAlertTriangle, 
  FiPackage, 
  FiSearch,
  FiSave,
  FiX,
  FiUpload,
  FiArrowLeft,
  FiPlusCircle,
  FiMinusCircle,
  FiClock,
  FiPercent
} from "react-icons/fi";

const Products = () => {
  // State for main products list
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStock, setLowStock] = useState("");

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // State for forms
  const [productForm, setProductForm] = useState({
    name: "",
    productionDate: "",
    expiryDate: "",
    unit: "kg",
    unitPrice: "",
    gstRate: "18", // Default GST rate
    initialStock: "",
    description: "",
    location: "",
    minStockLevel: "10",
    category: "Traditional",
    hsnCode: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [stockForm, setStockForm] = useState({
    adjustmentType: "add",
    quantity: "",
    note: ""
  });

  // API calls
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    page,
    limit: 10,
    q: search,
    category,
    lowStock
  });

  const { data: lowStockData } = useGetLowStockAlertsQuery({ limit: 5 });
  const { data: stockHistory } = useGetStockHistoryQuery(
    { id: selectedProduct?._id, limit: 5 }, 
    { skip: !selectedProduct }
  );

  const [deleteProduct] = useDeleteProductMutation();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [adjustStock, { isLoading: adjusting }] = useAdjustStockMutation();

  // Products data
  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  // Calculate price with GST for display
  const calculatePriceWithGst = (unitPrice, gstRate) => {
    const price = parseFloat(unitPrice) || 0;
    const gst = parseFloat(gstRate) || 0;
    const gstAmount = (price * gst) / 100;
    return (price + gstAmount).toFixed(2);
  };

  // Handler functions
  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await deleteProduct(product._id).unwrap();
        toast.success("Product deleted successfully");
        refetch();
      } catch (error) {
        toast.error(error.data?.error || "Failed to delete product");
      }
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name || "",
      productionDate: product.productionDate ? new Date(product.productionDate).toISOString().split('T')[0] : "",
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : "",
      unit: product.unit || "kg",
      unitPrice: product.unitPrice || "",
      gstRate: product.gstRate?.toString() || "18",
      initialStock: product.initialStock || "",
      description: product.description || "",
      location: product.location || "",
      minStockLevel: product.minStockLevel || "10",
      category: product.category || "Traditional",
      hsnCode: product.hsnCode || "",
    });
    setImagePreviews(product.images || []);
    setImages([]);
    setShowEditModal(true);
  };

  const handleStockAdjust = (product) => {
    setSelectedProduct(product);
    setStockForm({
      adjustmentType: "add",
      quantity: "",
      note: ""
    });
    setShowStockModal(true);
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Validate GST rate
    const gstRate = parseFloat(productForm.gstRate);
    if (gstRate < 0 || gstRate > 100) {
      toast.error("GST rate must be between 0 and 100");
      return;
    }

    try {
      const submitData = new FormData();
      
      // Append form data
      Object.keys(productForm).forEach(key => {
        if (productForm[key] !== '') {
          submitData.append(key, productForm[key]);
        }
      });

      // Append images
      images.forEach(image => {
        submitData.append("images", image);
      });

      if (selectedProduct) {
        await updateProduct({ id: selectedProduct._id, formData: submitData }).unwrap();
        toast.success("Product updated successfully");
        setShowEditModal(false);
      } else {
        await createProduct(submitData).unwrap();
        toast.success("Product created successfully");
        setShowAddModal(false);
      }

      // Reset form
      setProductForm({
        name: "",
        productionDate: "",
        expiryDate: "",
        unit: "kg",
        unitPrice: "",
        gstRate: "18",
        initialStock: "",
        description: "",
        location: "",
        minStockLevel: "10",
        category: "Traditional",
        hsnCode: "",
      });
      setImages([]);
      setImagePreviews([]);
      setSelectedProduct(null);
      
      refetch();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.data?.error || "Something went wrong");
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    
    if (!stockForm.quantity || parseFloat(stockForm.quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    // FIX: Convert to number properly
    const qty = stockForm.adjustmentType === "add" 
      ? parseFloat(stockForm.quantity) 
      : -parseFloat(stockForm.quantity);

    try {
      await adjustStock({ 
        id: selectedProduct._id, 
        qty: qty, // This should now be a proper number
        note: stockForm.note 
      }).unwrap();
      
      toast.success("Stock adjusted successfully");
      setShowStockModal(false);
      setStockForm({
        adjustmentType: "add",
        quantity: "",
        note: ""
      });
      refetch();
    } catch (error) {
      console.error("Stock adjustment error:", error);
      toast.error(error.data?.error || "Failed to adjust stock");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setLowStock("");
    setPage(1);
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B97A57]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-lg">Error loading products</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#5C3A21]">Products Management</h1>
          <p className="text-gray-600 mt-2">Manage your inventory and products</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#B97A57] hover:bg-[#A86A47] text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockData?.lowStockProducts && lowStockData.lowStockProducts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FiAlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-800">Low Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {lowStockData.lowStockProducts.slice(0, 5).map((product) => (
              <div key={product._id} className="bg-white p-3 rounded border border-orange-200">
                <p className="font-medium text-sm text-gray-900">{product.name}</p>
                <p className="text-xs text-orange-600">
                  Stock: {product.availableStock} {product.unit}
                </p>
                <p className="text-xs text-gray-500">
                  Needed: {product.needed} {product.unit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="Khandeshi">Khandeshi</option>
            <option value="Organic">Organic</option>
            <option value="Traditional">Traditional</option>
            <option value="Jaggery">Jaggery</option>
            <option value="Premium">Premium</option>
            <option value="Other">Other</option>
          </select>

          {/* Low Stock Filter */}
          <select
            value={lowStock}
            onChange={(e) => setLowStock(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
          >
            <option value="">All Stock</option>
            <option value="true">Low Stock Only</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (with GST)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FiPackage className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.hsnCode || "No HSN"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.availableStock} {product.unit}
                    </div>
                    {product.isLowStock && (
                      <div className="text-xs text-orange-600 flex items-center">
                        <FiAlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-semibold">₹{product.priceWithGst}</div>
                      <div className="text-xs text-gray-500">
                        Base: ₹{product.unitPrice}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <FiPercent className="w-3 h-3 mr-1" />
                      {product.gstRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStockAdjust(product)}
                        className="text-green-600 hover:text-green-900 transition-colors text-sm"
                      >
                        Stock
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="mx-auto w-12 h-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-2 text-gray-500">
              Get started by creating your first product.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#5C3A21]">
                  {showEditModal ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedProduct(null);
                    setProductForm({
                      name: "",
                      productionDate: "",
                      expiryDate: "",
                      unit: "kg",
                      unitPrice: "",
                      gstRate: "18",
                      initialStock: "",
                      description: "",
                      location: "",
                      minStockLevel: "10",
                      category: "Traditional",
                      hsnCode: "",
                    });
                    setImages([]);
                    setImagePreviews([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        HSN Code
                      </label>
                      <input
                        type="text"
                        name="hsnCode"
                        value={productForm.hsnCode}
                        onChange={handleProductInputChange}
                        placeholder="Enter HSN code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={productForm.category}
                        onChange={handleProductInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      >
                        <option value="Khandeshi">Khandeshi</option>
                        <option value="Organic">Organic</option>
                        <option value="Traditional">Traditional</option>
                        <option value="Jaggery">Jaggery</option>
                        <option value="Premium">Premium</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit *
                      </label>
                      <select
                        name="unit"
                        value={productForm.unit}
                        onChange={handleProductInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      >
                        <option value="kg">Kilogram (kg)</option>
                        <option value="g">Gram (g)</option>
                        <option value="piece">Piece</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing & GST */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & GST</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="unitPrice"
                        value={productForm.unitPrice}
                        onChange={handleProductInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GST Rate (%) *
                      </label>
                      <input
                        type="number"
                        name="gstRate"
                        value={productForm.gstRate}
                        onChange={handleProductInputChange}
                        required
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Final Price (with GST)
                      </label>
                      <div className="text-lg font-semibold text-[#B97A57]">
                        ₹{calculatePriceWithGst(productForm.unitPrice, productForm.gstRate)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Base: ₹{productForm.unitPrice || '0'} + GST: ₹{((parseFloat(productForm.unitPrice || 0) * parseFloat(productForm.gstRate || 0)) / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial Stock *
                      </label>
                      <input
                        type="number"
                        name="initialStock"
                        value={productForm.initialStock}
                        onChange={handleProductInputChange}
                        required
                        min="0"
                        step="0.001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Stock Level
                      </label>
                      <input
                        type="number"
                        name="minStockLevel"
                        value={productForm.minStockLevel}
                        onChange={handleProductInputChange}
                        min="0"
                        step="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Production & Expiry</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Production Date *
                      </label>
                      <input
                        type="date"
                        name="productionDate"
                        value={productForm.productionDate}
                        onChange={handleProductInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="date"
                        name="expiryDate"
                        value={productForm.expiryDate}
                        onChange={handleProductInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={productForm.description}
                        onChange={handleProductInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={productForm.location}
                        onChange={handleProductInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FiUpload className="mx-auto w-8 h-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Upload product images (Max 10 images)
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="mt-4 mx-auto"
                      />
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedProduct(null);
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || updating}
                    className="bg-[#B97A57] hover:bg-[#A86A47] text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave className="w-4 h-4" />
                    <span>
                      {creating || updating 
                        ? "Saving..." 
                        : showEditModal 
                          ? "Update Product" 
                          : "Create Product"
                      }
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#5C3A21]">Adjust Stock</h2>
                <button
                  onClick={() => setShowStockModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Info */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-gray-900">{selectedProduct.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Current Stock</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedProduct.currentStock} {selectedProduct.unit}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Available Stock</label>
                        <p className={`text-lg font-semibold ${
                          selectedProduct.isLowStock ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {selectedProduct.availableStock} {selectedProduct.unit}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">GST Rate</label>
                        <p className="text-sm text-gray-900">
                          {selectedProduct.gstRate}%
                        </p>
                      </div>
                      {selectedProduct.isLowStock && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-3">
                          <p className="text-sm text-orange-800">
                            ⚠️ Low stock alert! Minimum level: {selectedProduct.minStockLevel} {selectedProduct.unit}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adjust Stock Form */}
                <div className="lg:col-span-2 space-y-6">
                  <form onSubmit={handleStockSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adjustment Type
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="add"
                              checked={stockForm.adjustmentType === "add"}
                              onChange={(e) => setStockForm(prev => ({...prev, adjustmentType: e.target.value}))}
                              className="mr-2"
                            />
                            <FiPlusCircle className="w-4 h-4 text-green-600 mr-1" />
                            <span>Add Stock</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="remove"
                              checked={stockForm.adjustmentType === "remove"}
                              onChange={(e) => setStockForm(prev => ({...prev, adjustmentType: e.target.value}))}
                              className="mr-2"
                            />
                            <FiMinusCircle className="w-4 h-4 text-red-600 mr-1" />
                            <span>Remove Stock</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity ({selectedProduct.unit}) *
                        </label>
                        <input
                          type="number"
                          value={stockForm.quantity}
                          onChange={(e) => setStockForm(prev => ({...prev, quantity: e.target.value}))}
                          required
                          min="0.001"
                          step="0.001"
                          placeholder="Enter quantity"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note (Optional)
                      </label>
                      <textarea
                        value={stockForm.note}
                        onChange={(e) => setStockForm(prev => ({...prev, note: e.target.value}))}
                        rows="3"
                        placeholder="Add a note for this adjustment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B97A57] focus:border-transparent"
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setShowStockModal(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={adjusting}
                        className="bg-[#B97A57] hover:bg-[#A86A47] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {adjusting ? "Adjusting..." : "Adjust Stock"}
                      </button>
                    </div>
                  </form>

                  {/* Stock History */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FiClock className="w-5 h-5 mr-2" />
                        Recent Stock History
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {stockHistory?.transactions?.map((transaction) => (
                        <div key={transaction._id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                          <div>
                            <p className="font-medium text-sm capitalize">{transaction.type.replace('_', ' ').toLowerCase()}</p>
                            <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                            {transaction.note && (
                              <p className="text-xs text-gray-600 mt-1">{transaction.note}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${
                              transaction.qty > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.qty > 0 ? '+' : ''}{transaction.qty} {selectedProduct.unit}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.afterQty} {selectedProduct.unit}
                            </p>
                          </div>
                        </div>
                      ))}

                      {(!stockHistory?.transactions || stockHistory.transactions.length === 0) && (
                        <p className="text-center text-gray-500 py-4">No stock history available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;