import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Search,
  Sparkles,
  TrendingUp,
  Package,
  ArrowLeft,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import ProductCard from "./ProductCard";
import LoadingGrid from "./LoadingGrid";
import ProductModal from "./ProductModal";
import { Product } from "../types/Product";

const API_BASE_URL = "http://localhost:5005";

interface SubCategoryInfo {
  subCategoryID: number;
  subCategoryName: string;
  categoryID: number;
  categoryName?: string;
}

export default function SubCategoryProducts() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const subCategoryId = searchParams.get("subcategory");

  const [products, setProducts] = useState<Product[]>([]);
  const [subCategoryInfo, setSubCategoryInfo] =
    useState<SubCategoryInfo | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("name");
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  useEffect(() => {
    if (subCategoryId) {
      fetchSubCategoryProducts();
      fetchSubCategoryInfo();
    } else {
      setError("No subcategory specified");
      setIsLoading(false);
    }
  }, [subCategoryId]);

  const fetchSubCategoryInfo = async () => {
    if (!subCategoryId) return;

    try {
      // First get all categories to find the subcategory info
      const categoriesResponse = await fetch(`${API_BASE_URL}/api/Categories`);
      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json();

        for (const category of categories) {
          const subResponse = await fetch(
            `${API_BASE_URL}/api/Categories/SubCategories/${category.categoryID}`
          );
          if (subResponse.ok) {
            const subCategories = await subResponse.json();
            const foundSub = subCategories.find(
              (sub: any) =>
                (
                  sub.subCategoryID ||
                  sub.SubCategoryID ||
                  sub.id ||
                  sub.Id
                )?.toString() === subCategoryId
            );

            if (foundSub) {
              setSubCategoryInfo({
                subCategoryID:
                  foundSub.subCategoryID ||
                  foundSub.SubCategoryID ||
                  foundSub.id ||
                  foundSub.Id,
                subCategoryName:
                  foundSub.subCategoryName ||
                  foundSub.SubCategoryName ||
                  foundSub.name ||
                  foundSub.Name,
                categoryID: category.categoryID,
                categoryName: category.categoryName,
              });
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching subcategory info:", error);
    }
  };

  const fetchSubCategoryProducts = async () => {
    if (!subCategoryId) return;

    try {
      setError(null);
      setIsLoading(true);

      console.log(`🔍 Fetching products for subcategory ID: ${subCategoryId}`);

      const response = await fetch(
        `${API_BASE_URL}/api/Product/GetBySubCategory/${subCategoryId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No products found for this subcategory");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any[] = await response.json();
      console.log(
        `✅ Found ${data.length} products for subcategory ${subCategoryId}:`,
        data
      );

      const normalized = data.map((p) => ({
        ProductID: p.productID || p.ProductID,
        name: p.name || p.Name,
        CategoryID: p.categoryID || p.CategoryID,
        SubCategoryID: p.subCategoryID || p.SubCategoryID,
        Stock: p.stock || p.Stock || 0,
        price: p.price || p.Price || 0,
        Colors: p.colors || p.Colors || [],
        Sizes: p.sizes || p.Sizes || [],
        images: p.images || p.Images || [],
      }));

      setProducts(normalized);
    } catch (error) {
      console.error("Error fetching subcategory products:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch products"
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    // Search filter
    const searchMatch =
      !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Price range filter
    let priceMatch = true;
    if (priceRange !== "all") {
      const price = p.price;
      switch (priceRange) {
        case "under-1000":
          priceMatch = price < 1000;
          break;
        case "1000-5000":
          priceMatch = price >= 1000 && price <= 5000;
          break;
        case "5000-10000":
          priceMatch = price >= 5000 && price <= 10000;
          break;
        case "over-10000":
          priceMatch = price > 10000;
          break;
      }
    }

    // Stock filter
    let stockMatch = true;
    if (stockFilter !== "all") {
      switch (stockFilter) {
        case "in-stock":
          stockMatch = p.Stock > 0;
          break;
        case "low-stock":
          stockMatch = p.Stock > 0 && p.Stock <= 5;
          break;
        case "out-of-stock":
          stockMatch = p.Stock === 0;
          break;
      }
    }

    return searchMatch && priceMatch && stockMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "stock":
        return b.Stock - a.Stock;
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const displayedProducts = showAll
    ? sortedProducts
    : sortedProducts.slice(0, 12);

  const retryFetch = () => {
    setIsLoading(true);
    setError(null);
    fetchSubCategoryProducts();
    fetchSubCategoryInfo();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange("all");
    setStockFilter("all");
    setSortBy("name");
  };

  const hasActiveFilters =
    searchQuery ||
    priceRange !== "all" ||
    stockFilter !== "all" ||
    sortBy !== "name";

  return (
    <>
      {/* Custom CSS for animations */}
      <style>
        {`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
            opacity: 0;
          }
        `}
      </style>

      <div className="bg-gradient-to-br from-slate-50 via-white to-emerald-50 min-h-screen pt-20">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              {/* Back Button */}
              <div className="flex items-center justify-start mb-6">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back</span>
                </button>
              </div>

              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-ping"></div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 ml-3 bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent">
                  {subCategoryInfo?.subCategoryName || "Products"}
                </h1>
              </div>

              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
                {subCategoryInfo
                  ? `Discover our ${subCategoryInfo.subCategoryName.toLowerCase()} collection from ${
                      subCategoryInfo.categoryName
                    }`
                  : "Discover our curated product collection"}
              </p>

              {/* Stats Bar */}
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 mb-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Latest Collection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-emerald-500" />
                  <span>Premium Quality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Curated Selection</span>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center space-x-3 mb-6">
                  <SlidersHorizontal className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters & Search
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Search Bar */}
                  <div className="relative md:col-span-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md w-full"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="stock">Stock Level</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Price Range Filter */}
                  <div className="relative">
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md w-full"
                    >
                      <option value="all">All Prices</option>
                      <option value="under-1000">Under Rs. 1,000</option>
                      <option value="1000-5000">Rs. 1,000 - 5,000</option>
                      <option value="5000-10000">Rs. 5,000 - 10,000</option>
                      <option value="over-10000">Over Rs. 10,000</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Stock Filter */}
                  <div className="relative">
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md w-full"
                    >
                      <option value="all">All Stock</option>
                      <option value="in-stock">In Stock</option>
                      <option value="low-stock">Low Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {displayedProducts.length} of{" "}
                  {filteredProducts.length} products
                  {searchQuery && (
                    <span className="ml-2 text-emerald-600 font-medium">
                      for "{searchQuery}"
                    </span>
                  )}
                </p>

                {hasActiveFilters && (
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-600 font-medium">
                      Filters Applied
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <LoadingGrid />
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Failed to load products
                </h3>
                <p className="text-gray-500 mb-6">
                  {error}. Please make sure the API server is running on
                  localhost:5005.
                </p>
                <button
                  onClick={retryFetch}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-12">
              {/* Enhanced Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {displayedProducts.map((product, index) => (
                  <div
                    key={product.ProductID}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard
                      product={product}
                      onQuickView={setSelectedProductId}
                    />
                  </div>
                ))}
              </div>

              {/* View All Button */}
              {!showAll && filteredProducts.length > 12 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="group inline-flex items-center px-8 py-4 border-2 border-emerald-600 text-emerald-600 font-bold rounded-2xl hover:bg-emerald-600 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span>View All {filteredProducts.length} Products</span>
                    <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  {hasActiveFilters
                    ? "No products match your current filter criteria. Try adjusting your filters."
                    : subCategoryInfo
                    ? `No products available in ${subCategoryInfo.subCategoryName} at the moment.`
                    : "No products available in this subcategory at the moment."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-200"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick View Modal */}
          {selectedProductId && (
            <ProductModal
              ProductID={selectedProductId}
              isOpen
              onClose={() => setSelectedProductId(null)}
            />
          )}
        </div>
      </div>
    </>
  );
}
