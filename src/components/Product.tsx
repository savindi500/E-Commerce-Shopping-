import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  Filter, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Download,
  RefreshCw,
  MoreVertical,
  Tag,
  Layers,
  ShoppingCart,
  Archive,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Image as ImageIcon
} from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ProductItem {
  id: number;
  name: string;
  price: number;
  Category: string;
  Stock: number;
  Color: string[];
  Status: string;
  images?: any[];
  description?: string;
  createdAt?: string;
}

const Product: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const statusOptions = ["All", "Available", "Sold Out"];
  const priceRanges = ["All", "Under Rs. 1,000", "Rs. 1,000 - Rs. 5,000", "Rs. 5,000 - Rs. 10,000", "Over Rs. 10,000"];
  const stockOptions = ["All", "In Stock", "Out of Stock"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      setError("");
      
      const response = await axios.get(
        "http://localhost:5005/api/Product/GetAllProducts"
      );

      const formatted: ProductItem[] = response.data.map((product: any) => ({
        id: product.productID,
        name: product.name,
        price: product.price,
        Category: product.categoryName,
        Stock: product.stock,
        Status: product.status,
        images: product.images || [],
        description: product.description,
        createdAt: product.createdAt || new Date().toISOString(),
      }));

      // Sort so that highest ID (most recently added) comes first
      formatted.sort((a: ProductItem, b: ProductItem) => b.id - a.id);
      setProducts(formatted);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      setIsDeleting(productId);
      try {
        await axios.delete(
          `http://localhost:5005/api/Product/DeleteProduct/${productId}`
        );
        setProducts(products.filter((product) => product.id !== productId));
        toast.success(`Product "${product.name}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error(`Failed to delete "${product.name}". Please try again.`, {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleAddProduct = () => {
    navigate("/Addproduct");
  };

  const filteredProducts = products.filter((product) => {
    // Apply search term filter
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      product.Category.toLowerCase().includes(term) ||
      product.id.toString().includes(term);

    // Apply status filter
    const matchesStatus = statusFilter === "All" || product.Status === statusFilter;

    // Apply category filter
    const matchesCategory = categoryFilter === "All" || product.Category === categoryFilter;

    // Apply price range filter
    let matchesPrice = true;
    if (priceRange !== "All") {
      const price = product.price;
      switch (priceRange) {
        case "Under Rs. 1,000":
          matchesPrice = price < 1000;
          break;
        case "Rs. 1,000 - Rs. 5,000":
          matchesPrice = price >= 1000 && price <= 5000;
          break;
        case "Rs. 5,000 - Rs. 10,000":
          matchesPrice = price >= 5000 && price <= 10000;
          break;
        case "Over Rs. 10,000":
          matchesPrice = price > 10000;
          break;
      }
    }

    // Apply stock filter
    let matchesStock = true;
    if (stockFilter !== "All") {
      switch (stockFilter) {
        case "In Stock":
          matchesStock = product.Stock > 5;
          break;
        case "Low Stock":
          matchesStock = product.Stock > 0 && product.Stock <= 5;
          break;
        case "Out of Stock":
          matchesStock = product.Stock === 0;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesPrice && matchesStock;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "Sold Out":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "Low Stock":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Sold Out":
        return "bg-red-100 text-red-800 border-red-200";
      case "Low Stock":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "text-red-600" };
    if (stock <= 5) return { label: "Low Stock", color: "text-amber-600" };
    return { label: "In Stock", color: "text-emerald-600" };
  };

  const categories = Array.from(new Set(products.map(p => p.Category))).filter(Boolean);

  const productStats = {
    total: products.length,
    available: products.filter(p => p.Status === "Available").length,
    lowStock: products.filter(p => p.Stock <= 5 && p.Stock > 0).length,
    outOfStock: products.filter(p => p.Stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.Stock), 0),
  };

  // Skeleton loader for table rows
  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="hover:bg-gray-50">
          <td className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="flex justify-center gap-2">
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={setSidebarCollapsed} 
        />
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        } flex items-center justify-center`}>
          <div className="text-center space-y-4">
            <div className="relative">
              <RefreshCw className="animate-spin text-6xl text-indigo-500 mx-auto" />
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Loading Products</h3>
              <p className="text-gray-600">Fetching your inventory data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        } bg-gray-50`}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Product Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your product inventory and catalog
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Add Product Button */}
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center space-x-2 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Products
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {productStats.total}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {productStats.available}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {productStats.lowStock}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Out of Stock
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {productStats.outOfStock}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    Rs. {productStats.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Search & Filters
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search - No icon */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search by product ID, name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
              </div>

              {/* Status Filter - No icon */}
              <div>
                <select
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 appearance-none bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter - No icon */}
              <div>
                <select
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 appearance-none bg-white"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter - No icon */}
              <div>
                <select
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 appearance-none bg-white"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  {priceRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results Count - Simple version */}
              <div className="flex items-center justify-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-indigo-700">Showing</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {filteredProducts.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </div>
              {(searchTerm ||
                statusFilter !== "All" ||
                categoryFilter !== "All" ||
                priceRange !== "All") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                    setCategoryFilter("All");
                    setPriceRange("All");
                    setStockFilter("All");
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
          {/* Product Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Products Inventory
                  </h3>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredProducts.length} products
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <TableSkeleton />
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const stockStatus = getStockStatus(product.Stock);
                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50 transition-colors duration-200 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={`http://localhost:5005${product.images[0].path}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-gray-900 truncate">
                                  {product.name || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {product.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Tag className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {product.Category || "N/A"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-gray-900">
                                Rs.{" "}
                                {product.price?.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="text-sm font-semibold text-gray-900">
                                {product.Stock}
                              </div>
                              <div
                                className={`text-xs font-medium ${stockStatus.color}`}
                              >
                                {stockStatus.label}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border ${getStatusColor(
                                product.Status
                              )}`}
                            >
                              {getStatusIcon(product.Status)}
                              <span>{product.Status}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center items-center space-x-2">
                              <button
                                onClick={() =>
                                  navigate(`/ProductDetails/${product.id}`)
                                }
                                className="p-2 text-gray-400 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="View Product"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() =>
                                  navigate(`/EditProduct/${product.id}`)
                                }
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                                title="Edit Product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No products found
                            </h3>
                            <p className="text-gray-500">
                              {searchTerm ||
                              statusFilter !== "All" ||
                              categoryFilter !== "All" ||
                              priceRange !== "All"
                                ? "No products match your current filter criteria. Try adjusting your filters."
                                : "No products have been added yet. Start by adding your first product."}
                            </p>
                          </div>
                          {searchTerm ||
                          statusFilter !== "All" ||
                          categoryFilter !== "All" ||
                          priceRange !== "All" ? (
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("All");
                                setCategoryFilter("All");
                                setPriceRange("All");
                              }}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                            >
                              <Filter className="w-4 h-4" />
                              <span>Clear Filters</span>
                            </button>
                          ) : (
                            <button
                              onClick={handleAddProduct}
                              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Your First Product</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Error</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;