
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  ChevronDown,
  Sparkles,
  TrendingUp,
  Package,
  Filter,
  Grid,
  List,
  AlertCircle,
  Loader2,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import LoadingGrid from "../components/LoadingGrid";
import ProductModal from "../components/ProductModal";
import { Product } from "../types/Product";

interface Category {
  categoryID: number;
  categoryName: string;
}

interface SubCategory {
  subCategoryID: number;
  subCategoryName: string;
  categoryID: number;
}

const API_BASE_URL = "http://localhost:5005";

// Cache for API responses to avoid repeated calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data or fetch new data
const getCachedData = async (url: string): Promise<any> => {
  const now = Date.now();
  const cached = cache.get(url);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log(`📦 Using cached data for: ${url}`);
    return cached.data;
  }

  console.log(`🌐 Fetching fresh data from: ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  cache.set(url, { data, timestamp: now });
  return data;
};

// Helper function to normalize colors from different API response formats
const normalizeColors = (colors: any): any[] => {
  console.log("🎨 Normalizing colors:", colors);

  if (!colors) {
    console.log("❌ No colors provided");
    return [];
  }

  // If it's already an array, return as is
  if (Array.isArray(colors)) {
    console.log("✅ Colors is array:", colors);
    return colors;
  }

  // If it's a Set-like object (common in backend responses)
  if (colors && typeof colors === "object") {
    // Check if it's a Set-like object with values
    if ("size" in colors || Symbol.iterator in colors) {
      const colorArray = Array.from(colors as Iterable<any>);
      console.log("✅ Converted Set to array:", colorArray);
      return colorArray;
    }

    // If it's an object with values, get the values
    if (Object.keys(colors).length > 0) {
      const colorArray = Object.values(colors);
      console.log("✅ Converted object values to array:", colorArray);
      return colorArray;
    }
  }

  // If it's a single value, wrap in array
  if (typeof colors === "number" || typeof colors === "string") {
    console.log("✅ Single color wrapped in array:", [colors]);
    return [colors];
  }

  console.log("❌ Unable to normalize colors, returning empty array");
  return [];
};

// Helper function to normalize sizes from different API response formats
const normalizeSizes = (sizes: any): any[] => {
  console.log("📏 Normalizing sizes:", sizes);

  if (!sizes) {
    console.log("❌ No sizes provided");
    return [];
  }

  // If it's already an array, return as is
  if (Array.isArray(sizes)) {
    console.log("✅ Sizes is array:", sizes);
    return sizes;
  }

  // If it's a Set-like object (common in backend responses)
  if (sizes && typeof sizes === "object") {
    // Check if it's a Set-like object with values
    if ("size" in sizes || Symbol.iterator in sizes) {
      const sizeArray = Array.from(sizes as Iterable<any>);
      console.log("✅ Converted Set to array:", sizeArray);
      return sizeArray;
    }

    // If it's an object with values, get the values
    if (Object.keys(sizes).length > 0) {
      const sizeArray = Object.values(sizes);
      console.log("✅ Converted object values to array:", sizeArray);
      return sizeArray;
    }
  }

  // If it's a single value, wrap in array
  if (typeof sizes === "number" || typeof sizes === "string") {
    console.log("✅ Single size wrapped in array:", [sizes]);
    return [sizes];
  }

  console.log("❌ Unable to normalize sizes, returning empty array");
  return [];
};

// Helper function to normalize images from different API response formats
const normalizeImages = (images: any): any[] => {
  console.log("🖼️ Normalizing images:", images);

  if (!images) {
    console.log("❌ No images provided");
    return [];
  }

  // If it's already an array, return as is
  if (Array.isArray(images)) {
    console.log("✅ Images is array:", images);
    return images;
  }

  // If it's a Set-like object (common in backend responses)
  if (images && typeof images === "object") {
    // Check if it's a Set-like object with values
    if ("size" in images || Symbol.iterator in images) {
      const imageArray = Array.from(images as Iterable<any>);
      console.log("✅ Converted Set to array:", imageArray);
      return imageArray;
    }

    // If it's an object with values, get the values
    if (Object.keys(images).length > 0) {
      const imageArray = Object.values(images);
      console.log("✅ Converted object values to array:", imageArray);
      return imageArray;
    }
  }

  console.log("❌ Unable to normalize images, returning empty array");
  return [];
};

export default function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [currentSubCategory, setCurrentSubCategory] =
    useState<SubCategory | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("name");
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const location = useLocation();
  const { categoryName } = useParams();
useEffect(() => {
  // Scroll to top when component mounts or route changes
  window.scrollTo(0, 0);
}, [location.pathname, location.search]);
  // Parse URL parameters - memoized to avoid recalculation
  const urlParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const categoryId = urlParams.get("category");
  const subcategoryId = urlParams.get("subcategory");
  const subcategoryName = urlParams.get("subcategoryName");

  // Optimized category fetching with caching
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCachedData(`${API_BASE_URL}/api/Categories`);
      console.log("📋 Categories loaded:", data.length);
      setCategories(data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      return [];
    }
  }, []);

  // Optimized subcategory fetching with caching
  const fetchSubCategories = useCallback(async (catId: string) => {
    try {
      const data = await getCachedData(
        `${API_BASE_URL}/api/Categories/SubCategories/${catId}`
      );
      console.log(
        `📋 Subcategories loaded for category ${catId}:`,
        data.length
      );
      setSubCategories(data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching subcategories:", error);
      return [];
    }
  }, []);

  // Optimized subcategory by ID fetching
  const fetchSubCategoryById = useCallback(async (subcategoryId: string) => {
    try {
      console.log(`🔍 Fetching subcategory details for ID: ${subcategoryId}`);
      const data = await getCachedData(
        `${API_BASE_URL}/api/Categories/SubCategoryById/${subcategoryId}`
      );

      const normalizedSubCategory: SubCategory = {
        subCategoryID: data.subCategoryID || data.SubCategoryID || data.id,
        subCategoryName:
          data.subCategoryName || data.SubCategoryName || data.name,
        categoryID: data.categoryID || data.CategoryID,
      };

      setCurrentSubCategory(normalizedSubCategory);
      return normalizedSubCategory;
    } catch (error) {
      console.error("❌ Error fetching subcategory by ID:", error);
      return null;
    }
  }, []);

  // Memoized category ID determination
  const targetCategoryId = useMemo(() => {
    console.log("🔍 Determining target category ID...");

    // Method 1: Direct category ID from URL parameter
    if (categoryId) {
      console.log("✅ Using direct category ID from URL:", categoryId);
      return categoryId;
    }

    // Method 2: Find category ID by name from URL path
    if (categoryName && categories.length > 0) {
      console.log("🔍 Searching for category by name:", categoryName);

      // Try exact match first (case insensitive)
      let category = categories.find(
        (cat) =>
          cat.categoryName &&
          cat.categoryName.toLowerCase() === categoryName.toLowerCase()
      );

      // Try normalized match (remove spaces and special characters)
      if (!category) {
        const normalizedCategoryName = categoryName
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase();
        category = categories.find(
          (cat) =>
            cat.categoryName &&
            cat.categoryName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ===
              normalizedCategoryName
        );
      }

      // Try partial match
      if (!category) {
        category = categories.find(
          (cat) =>
            cat.categoryName &&
            (cat.categoryName
              .toLowerCase()
              .includes(categoryName.toLowerCase()) ||
              categoryName
                .toLowerCase()
                .includes(cat.categoryName.toLowerCase()))
        );
      }

      if (category) {
        console.log("✅ Found category by name:", category);
        return category.categoryID.toString();
      }
    }

    console.log("❌ Could not determine target category ID");
    return null;
  }, [categoryId, categoryName, categories]);

  // Optimized product fetching with better error handling and caching
  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      console.log("🚀 Starting optimized product fetch...");

      let apiUrl = "";
      let useCache = true;

      // Determine API endpoint based on priority
      if (subcategoryId) {
        // Priority 1: Direct subcategory ID
        apiUrl = `${API_BASE_URL}/api/Categories/SubCategoryById/${subcategoryId}`;
        console.log(`📦 Using SubCategory API with ID: ${subcategoryId}`);
      } else if (subcategoryName) {
        // Priority 2: Search by subcategory name
        const searchKeyword = decodeURIComponent(subcategoryName);
        apiUrl = `${API_BASE_URL}/api/Product/Search?keyword=${encodeURIComponent(
          searchKeyword
        )}`;
        console.log(`🔍 Using Search API with keyword: "${searchKeyword}"`);
        useCache = false; // Search results might change frequently
      } else if (targetCategoryId) {
        // Priority 3: Category products
        apiUrl = `${API_BASE_URL}/api/Product/Getproduct?categoryId=${targetCategoryId}`;
        console.log(`📂 Using Category API for ID: ${targetCategoryId}`);
      } else {
        throw new Error("No valid endpoint determined");
      }

      console.log(`🔗 API URL: ${apiUrl}`);

      // Fetch data with or without caching
      const data = useCache
        ? await getCachedData(apiUrl)
        : await (async () => {
            const response = await fetch(apiUrl);
            if (!response.ok)
              throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
          })();

      console.log("📊 Raw API Response:", data);

      let productsArray: any[] = [];

      // Handle different response structures efficiently
      if (subcategoryId && data.products) {
        productsArray = Array.isArray(data.products) ? data.products : [];
        console.log("📦 Using subcategory products:", productsArray.length);
      } else if (Array.isArray(data)) {
        productsArray = data;
        console.log("📦 Using array data:", productsArray.length);
      } else {
        console.warn("⚠️ Unexpected response format:", data);
        productsArray = [];
      }

      // Log raw product data for debugging
      if (productsArray.length > 0) {
        console.log("🔍 Sample raw product data:", productsArray[0]);
      }

      // Normalize product data with improved color/size handling
      const normalized = productsArray.map((p, index) => {
        console.log(`🔄 Normalizing product ${index + 1}:`, p);

        const normalizedProduct = {
          ProductID: p.id || p.productID || p.ProductID,
          name:
            p.name ||
            p.Name ||
            p.productName ||
            p.ProductName ||
            "Unknown Product",
          CategoryID: p.categoryID || p.CategoryID,
          SubCategoryID: p.subCategoryID || p.SubCategoryID,
          Stock: Number(p.stock || p.Stock) || 0,
          price: Number(p.price || p.Price) || 0,
          Colors: normalizeColors(p.colors || p.Colors),
          Sizes: normalizeSizes(p.sizes || p.Sizes),
          images: normalizeImages(p.images || p.Images),
          description: p.description || p.Description || "",
        };

        console.log(`✅ Normalized product ${index + 1}:`, normalizedProduct);
        return normalizedProduct;
      });

      // Filter by category if using search API
      let filteredProducts = normalized;
      if (subcategoryName && targetCategoryId) {
        console.log(
          `🔍 Filtering search results by category: ${targetCategoryId}`
        );
        filteredProducts = normalized.filter(
          (product) => product.CategoryID?.toString() === targetCategoryId
        );
        console.log(`📊 Filtered to ${filteredProducts.length} products`);
      }

      console.log(`✅ Successfully loaded ${filteredProducts.length} products`);

      // Log color/size data for debugging
      filteredProducts.forEach((product, index) => {
        console.log(`Product ${index + 1} (${product.name}):`, {
          colors: product.Colors,
          sizes: product.Sizes,
          images: product.images?.length || 0,
        });
      });

      setProducts(filteredProducts);

      // Fetch subcategories if needed (in background)
      if (targetCategoryId && subCategories.length === 0) {
        fetchSubCategories(targetCategoryId).catch(console.error);
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error);

      let errorMessage = "Failed to fetch products";
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage =
            "Unable to connect to the server. Please check your connection and try again.";
        } else if (error.message.includes("404")) {
          errorMessage = "No products found for the selected category.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [subcategoryId, subcategoryName, targetCategoryId, fetchSubCategories]);

  // Memoized sorted products for better performance
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
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
  }, [products, sortBy]);

  const displayedProducts = useMemo(() => {
    return showAll ? sortedProducts : sortedProducts.slice(0, 12);
  }, [sortedProducts, showAll]);

  // Memoized display names
  const categoryDisplayName = useMemo(() => {
    if (categoryName && categories.length > 0) {
      const category = categories.find(
        (cat) =>
          cat.categoryName &&
          cat.categoryName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() ===
            categoryName.toLowerCase()
      );
      return category?.categoryName || categoryName;
    }
    if (categoryId && categories.length > 0) {
      const category = categories.find(
        (cat) => cat.categoryID.toString() === categoryId
      );
      return category?.categoryName || "Products";
    }
    return "Products";
  }, [categoryName, categoryId, categories]);

  const subcategoryDisplayName = useMemo(() => {
    if (currentSubCategory?.subCategoryName) {
      return currentSubCategory.subCategoryName;
    }
    if (subcategoryName) {
      return decodeURIComponent(subcategoryName);
    }
    if (subcategoryId && subCategories.length > 0) {
      const subcategory = subCategories.find(
        (sub) => sub.subCategoryID.toString() === subcategoryId
      );
      return subcategory?.subCategoryName || "Products";
    }
    return null;
  }, [currentSubCategory, subcategoryName, subcategoryId, subCategories]);

  const displayName = subcategoryDisplayName || categoryDisplayName;
  const isSubcategoryView = !!subcategoryId || !!subcategoryName;

  // Optimized effects with proper dependencies
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (subcategoryId) {
      fetchSubCategoryById(subcategoryId);
    }
  }, [subcategoryId, fetchSubCategoryById]);

  useEffect(() => {
    // Only fetch products when we have enough information
    const shouldFetch =
      subcategoryId ||
      subcategoryName ||
      targetCategoryId ||
      categories.length > 0;

    if (shouldFetch) {
      // Add small delay to batch multiple rapid changes
      const timeoutId = setTimeout(() => {
        fetchProducts();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    subcategoryId,
    subcategoryName,
    targetCategoryId,
    categories.length,
    fetchProducts,
  ]);

  const retryFetch = useCallback(() => {
    // Clear cache for this specific request and retry
    const possibleUrls = [
      `${API_BASE_URL}/api/Categories/SubCategoryById/${subcategoryId}`,
      `${API_BASE_URL}/api/Product/Search?keyword=${encodeURIComponent(
        subcategoryName || ""
      )}`,
      `${API_BASE_URL}/api/Product/Getproduct?categoryId=${targetCategoryId}`,
    ];

    possibleUrls.forEach((url) => cache.delete(url));
    fetchProducts();
  }, [subcategoryId, subcategoryName, targetCategoryId, fetchProducts]);

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

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          .shimmer {
            position: relative;
            overflow: hidden;
          }

          .shimmer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 1.5s infinite;
          }

          /* Optimize image loading */
          img {
            content-visibility: auto;
            contain-intrinsic-size: 300px 400px;
          }
        `}
      </style>

      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen pt-20">
        {/* Enhanced Header */}
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              {/* Breadcrumb */}
              <div className="flex items-center justify-center mb-4 text-sm text-gray-500">
                <span>Home</span>
                <ChevronDown className="w-4 h-4 mx-2 rotate-[-90deg]" />
                <span className="text-gray-700 font-medium">
                  {categoryDisplayName}
                </span>
                {isSubcategoryView && (
                  <>
                    <ChevronDown className="w-4 h-4 mx-2 rotate-[-90deg]" />
                    <span className="text-black font-semibold">
                      {subcategoryDisplayName}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-gray-800 to-black rounded-2xl shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full animate-pulse shadow-lg"></div>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-black ml-4 tracking-tight">
                  {displayName}
                </h1>
              </div>

              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                {isSubcategoryView
                  ? `Explore our curated collection of ${displayName.toLowerCase()} with premium quality and style`
                  : `Discover our complete ${displayName.toLowerCase()} collection with something for everyone`}
              </p>

              {/* Stats Bar */}
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 mb-8">
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                  <TrendingUp className="w-4 h-4 text-black" />
                  <span>Trending Styles</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                  <Package className="w-4 h-4 text-black" />
                  <span>Premium Quality</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Latest Collection</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-6 py-3 pr-12 text-sm font-medium focus:border-black focus:ring-4 focus:ring-gray-200/50 transition-all duration-300 shadow-sm hover:shadow-md min-w-[200px]"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="stock">Stock Availability</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-black text-white shadow-sm"
                        : "text-gray-600 hover:text-black hover:bg-gray-50"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-black text-white shadow-sm"
                        : "text-gray-600 hover:text-black hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                  <span className="font-medium">
                    {displayedProducts.length}
                  </span>{" "}
                  of <span className="font-medium">{products.length}</span>{" "}
                  products
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="space-y-8">
              <div className="flex items-center justify-center space-x-3 text-gray-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg font-medium">
                  Loading amazing products...
                </span>
              </div>
              <LoadingGrid />
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  Failed to load products
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
                <button
                  onClick={retryFetch}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Retry Loading
                </button>
              </div>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-12">
              {/* Product Grid */}
              <div
                className={`grid gap-8 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 lg:grid-cols-2 gap-6"
                }`}
              >
                {displayedProducts.map((product, index) => (
                  <div
                    key={product.ProductID}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard
                      product={product}
                      onQuickView={setSelectedProductId}
                      viewMode={viewMode}
                    />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {!showAll && products.length > 12 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="group inline-flex items-center px-8 py-4 border-2 border-black text-black font-bold rounded-2xl hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl bg-white/90 backdrop-blur-sm"
                  >
                    <span>View All {products.length} Products</span>
                    <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
                  </button>
                </div>
              )}

              {/* Back to Top */}
              {showAll && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      setShowAll(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:text-black bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    <ChevronDown className="w-4 h-4 mr-2 rotate-180" />
                    Back to Top
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {isSubcategoryView
                    ? `No ${displayName.toLowerCase()} products are available at the moment.`
                    : `No products are available in the ${displayName.toLowerCase()} category at the moment.`}
                </p>
                <p className="text-sm text-gray-500">
                  Check back soon for new arrivals!
                </p>
              </div>
            </div>
          )}

          {/* Product Modal */}
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
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { useLocation, useParams } from "react-router-dom";
// import {
//   ChevronDown,
//   Sparkles,
//   Package,
//   AlertCircle,
//   Loader2,
// } from "lucide-react";
// import ProductCard from "../components/ProductCard";
// import LoadingGrid from "../components/LoadingGrid";
// import ProductModal from "../components/ProductModal";
// import { Product } from "../types/Product";

// interface Category {
//   categoryID: number;
//   categoryName: string;
// }

// interface SubCategory {
//   subCategoryID: number;
//   subCategoryName: string;
//   categoryID: number;
// }

// const API_BASE_URL = "http://localhost:5005";

// const cache = new Map<string, { data: any; timestamp: number }>();
// const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// const getCachedData = async (url: string): Promise<any> => {
//   const now = Date.now();
//   const cached = cache.get(url);

//   if (cached && now - cached.timestamp < CACHE_DURATION) {
//     return cached.data;
//   }

//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   const data = await response.json();
//   cache.set(url, { data, timestamp: now });
//   return data;
// };

// const normalizeColors = (colors: any): any[] => {
//   if (!colors) return [];
//   if (Array.isArray(colors)) return colors;

//   if (colors && typeof colors === "object") {
//     if ("size" in colors || Symbol.iterator in colors) {
//       return Array.from(colors as Iterable<any>);
//     }
//     if (Object.keys(colors).length > 0) {
//       return Object.values(colors);
//     }
//   }

//   if (typeof colors === "number" || typeof colors === "string") {
//     return [colors];
//   }

//   return [];
// };

// const normalizeSizes = (sizes: any): any[] => {
//   if (!sizes) return [];
//   if (Array.isArray(sizes)) return sizes;

//   if (sizes && typeof sizes === "object") {
//     if ("size" in sizes || Symbol.iterator in sizes) {
//       return Array.from(sizes as Iterable<any>);
//     }
//     if (Object.keys(sizes).length > 0) {
//       return Object.values(sizes);
//     }
//   }

//   if (typeof sizes === "number" || typeof sizes === "string") {
//     return [sizes];
//   }

//   return [];
// };

// const normalizeImages = (images: any): any[] => {
//   if (!images) return [];
//   if (Array.isArray(images)) return images;

//   if (images && typeof images === "object") {
//     if ("size" in images || Symbol.iterator in images) {
//       return Array.from(images as Iterable<any>);
//     }
//     if (Object.keys(images).length > 0) {
//       return Object.values(images);
//     }
//   }

//   return [];
// };

// export default function ProductListing() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
//   const [currentSubCategory, setCurrentSubCategory] =
//     useState<SubCategory | null>(null);
//   const [showAll, setShowAll] = useState(false);
//   const [selectedProductId, setSelectedProductId] = useState<number | null>(
//     null
//   );
//   const [isLoading, setIsLoading] = useState(true);
//   const [sortBy, setSortBy] = useState<string>("name");
//   const [error, setError] = useState<string | null>(null);

//   const location = useLocation();
//   const { categoryName } = useParams();
//   const urlParams = useMemo(
//     () => new URLSearchParams(location.search),
//     [location.search]
//   );
//   const categoryId = urlParams.get("category");
//   const subcategoryId = urlParams.get("subcategory");
//   const subcategoryName = urlParams.get("subcategoryName");

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [location.pathname, location.search]);

//   const fetchCategories = useCallback(async () => {
//     try {
//       const data = await getCachedData(`${API_BASE_URL}/api/Categories`);
//       setCategories(data);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   }, []);

//   const fetchSubCategories = useCallback(async (catId: string) => {
//     try {
//       const data = await getCachedData(
//         `${API_BASE_URL}/api/Categories/SubCategories/${catId}`
//       );
//       setSubCategories(data);
//     } catch (error) {
//       console.error("Error fetching subcategories:", error);
//     }
//   }, []);

//   const fetchSubCategoryById = useCallback(async (subcategoryId: string) => {
//     try {
//       const data = await getCachedData(
//         `${API_BASE_URL}/api/Categories/SubCategoryById/${subcategoryId}`
//       );

//       const normalizedSubCategory: SubCategory = {
//         subCategoryID: data.subCategoryID || data.SubCategoryID || data.id,
//         subCategoryName:
//           data.subCategoryName || data.SubCategoryName || data.name,
//         categoryID: data.categoryID || data.CategoryID,
//       };

//       setCurrentSubCategory(normalizedSubCategory);
//     } catch (error) {
//       console.error("Error fetching subcategory by ID:", error);
//     }
//   }, []);

//   const targetCategoryId = useMemo(() => {
//     if (categoryId) return categoryId;

//     if (categoryName && categories.length > 0) {
//       const category = categories.find(
//         (cat) =>
//           cat.categoryName &&
//           cat.categoryName.toLowerCase() === categoryName.toLowerCase()
//       );

//       return category?.categoryID.toString() || null;
//     }

//     return null;
//   }, [categoryId, categoryName, categories]);

//   const fetchProducts = useCallback(async () => {
//     try {
//       setError(null);
//       setIsLoading(true);

//       let apiUrl = "";
//       let useCache = true;

//       if (subcategoryId) {
//         apiUrl = `${API_BASE_URL}/api/Categories/SubCategoryById/${subcategoryId}`;
//       } else if (subcategoryName) {
//         const searchKeyword = decodeURIComponent(subcategoryName);
//         apiUrl = `${API_BASE_URL}/api/Product/Search?keyword=${encodeURIComponent(
//           searchKeyword
//         )}`;
//         useCache = false;
//       } else if (targetCategoryId) {
//         apiUrl = `${API_BASE_URL}/api/Product/Getproduct?categoryId=${targetCategoryId}`;
//       } else {
//         throw new Error("No valid endpoint determined");
//       }

//       const data = useCache
//         ? await getCachedData(apiUrl)
//         : await (async () => {
//             const response = await fetch(apiUrl);
//             if (!response.ok)
//               throw new Error(`HTTP error! status: ${response.status}`);
//             return response.json();
//           })();

//       let productsArray: any[] = [];

//       if (subcategoryId && data.products) {
//         productsArray = Array.isArray(data.products) ? data.products : [];
//       } else if (Array.isArray(data)) {
//         productsArray = data;
//       }

//       const normalized = productsArray.map((p) => ({
//         ProductID: p.id || p.productID || p.ProductID,
//         name:
//           p.name ||
//           p.Name ||
//           p.productName ||
//           p.ProductName ||
//           "Unknown Product",
//         CategoryID: p.categoryID || p.CategoryID,
//         SubCategoryID: p.subCategoryID || p.SubCategoryID,
//         Stock: Number(p.stock || p.Stock) || 0,
//         price: Number(p.price || p.Price) || 0,
//         Colors: normalizeColors(p.colors || p.Colors),
//         Sizes: normalizeSizes(p.sizes || p.Sizes),
//         images: normalizeImages(p.images || p.Images),
//         description: p.description || p.Description || "",
//       }));

//       let filteredProducts = normalized;
//       if (subcategoryName && targetCategoryId) {
//         filteredProducts = normalized.filter(
//           (product) => product.CategoryID?.toString() === targetCategoryId
//         );
//       }

//       setProducts(filteredProducts);

//       if (targetCategoryId && subCategories.length === 0) {
//         fetchSubCategories(targetCategoryId).catch(console.error);
//       }
//     } catch (error) {
//       let errorMessage = "Failed to fetch products";
//       if (error instanceof Error) {
//         if (error.message.includes("Failed to fetch")) {
//           errorMessage =
//             "Unable to connect to the server. Please check your connection and try again.";
//         } else if (error.message.includes("404")) {
//           errorMessage = "No products found for the selected category.";
//         } else {
//           errorMessage = error.message;
//         }
//       }

//       setError(errorMessage);
//       setProducts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [subcategoryId, subcategoryName, targetCategoryId, fetchSubCategories]);

//   const sortedProducts = useMemo(() => {
//     return [...products].sort((a, b) => {
//       switch (sortBy) {
//         case "price-low":
//           return a.price - b.price;
//         case "price-high":
//           return b.price - a.price;
//         case "stock":
//           return b.Stock - a.Stock;
//         case "name":
//         default:
//           return a.name.localeCompare(b.name);
//       }
//     });
//   }, [products, sortBy]);

//   const displayedProducts = useMemo(() => {
//     return showAll ? sortedProducts : sortedProducts.slice(0, 12);
//   }, [sortedProducts, showAll]);

//   const categoryDisplayName = useMemo(() => {
//     if (categoryName && categories.length > 0) {
//       const category = categories.find(
//         (cat) =>
//           cat.categoryName &&
//           cat.categoryName.toLowerCase() === categoryName.toLowerCase()
//       );
//       return category?.categoryName || categoryName;
//     }
//     if (categoryId && categories.length > 0) {
//       const category = categories.find(
//         (cat) => cat.categoryID.toString() === categoryId
//       );
//       return category?.categoryName || "Products";
//     }
//     return "Products";
//   }, [categoryName, categoryId, categories]);

//   const subcategoryDisplayName = useMemo(() => {
//     if (currentSubCategory?.subCategoryName) {
//       return currentSubCategory.subCategoryName;
//     }
//     if (subcategoryName) {
//       return decodeURIComponent(subcategoryName);
//     }
//     if (subcategoryId && subCategories.length > 0) {
//       const subcategory = subCategories.find(
//         (sub) => sub.subCategoryID.toString() === subcategoryId
//       );
//       return subcategory?.subCategoryName || "Products";
//     }
//     return null;
//   }, [currentSubCategory, subcategoryName, subcategoryId, subCategories]);

//   const displayName = subcategoryDisplayName || categoryDisplayName;
//   const isSubcategoryView = !!subcategoryId || !!subcategoryName;

//   useEffect(() => {
//     fetchCategories();
//   }, [fetchCategories]);

//   useEffect(() => {
//     if (subcategoryId) {
//       fetchSubCategoryById(subcategoryId);
//     }
//   }, [subcategoryId, fetchSubCategoryById]);

//   useEffect(() => {
//     const shouldFetch =
//       subcategoryId ||
//       subcategoryName ||
//       targetCategoryId ||
//       categories.length > 0;
//     if (shouldFetch) {
//       const timeoutId = setTimeout(() => {
//         fetchProducts();
//       }, 100);
//       return () => clearTimeout(timeoutId);
//     }
//   }, [
//     subcategoryId,
//     subcategoryName,
//     targetCategoryId,
//     categories.length,
//     fetchProducts,
//   ]);

//   const retryFetch = useCallback(() => {
//     const possibleUrls = [
//       `${API_BASE_URL}/api/Categories/SubCategoryById/${subcategoryId}`,
//       `${API_BASE_URL}/api/Product/Search?keyword=${encodeURIComponent(
//         subcategoryName || ""
//       )}`,
//       `${API_BASE_URL}/api/Product/Getproduct?categoryId=${targetCategoryId}`,
//     ];

//     possibleUrls.forEach((url) => cache.delete(url));
//     fetchProducts();
//   }, [subcategoryId, subcategoryName, targetCategoryId, fetchProducts]);

//   return (
//     <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen pt-20">
//       {/* Header */}
//       <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="text-center">
//             {/* Breadcrumb */}
//             <div className="flex items-center justify-center mb-4 text-sm text-gray-500">
//               <span>Home</span>
//               <ChevronDown className="w-4 h-4 mx-2 rotate-[-90deg]" />
//               <span className="text-gray-700 font-medium">
//                 {categoryDisplayName}
//               </span>
//               {isSubcategoryView && (
//                 <>
//                   <ChevronDown className="w-4 h-4 mx-2 rotate-[-90deg]" />
//                   <span className="text-black font-semibold">
//                     {subcategoryDisplayName}
//                   </span>
//                 </>
//               )}
//             </div>

//             <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4 tracking-tight">
//               {displayName}
//             </h1>

//             <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
//               {isSubcategoryView
//                 ? `Explore our curated collection of ${displayName.toLowerCase()} with premium quality and style`
//                 : `Discover our complete ${displayName.toLowerCase()} collection with something for everyone`}
//             </p>

//             {/* Controls */}
//             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
//               {/* Sort Dropdown */}
//               <div className="relative">
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="appearance-none bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl px-6 py-3 pr-12 text-sm font-medium focus:border-black focus:ring-4 focus:ring-gray-200/50 transition-all duration-300 shadow-sm hover:shadow-md min-w-[200px]"
//                 >
//                   <option value="name">Sort by Name</option>
//                   <option value="price-low">Price: Low to High</option>
//                   <option value="price-high">Price: High to Low</option>
//                   <option value="stock">Stock Availability</option>
//                 </select>
//                 <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
//               </div>

//               {/* Results Count */}
//               <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
//                 <span className="font-medium">{displayedProducts.length}</span>{" "}
//                 of <span className="font-medium">{products.length}</span>{" "}
//                 products
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         {isLoading ? (
//           <div className="space-y-8">
//             <div className="flex items-center justify-center space-x-3 text-gray-600">
//               <Loader2 className="w-6 h-6 animate-spin" />
//               <span className="text-lg font-medium">
//                 Loading amazing products...
//               </span>
//             </div>
//             <LoadingGrid />
//           </div>
//         ) : error ? (
//           <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50">
//             <div className="max-w-md mx-auto">
//               <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <AlertCircle className="w-12 h-12 text-red-500" />
//               </div>
//               <h3 className="text-xl font-semibold text-black mb-2">
//                 Failed to load products
//               </h3>
//               <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
//               <button
//                 onClick={retryFetch}
//                 className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
//               >
//                 <Package className="w-5 h-5 mr-2" />
//                 Retry Loading
//               </button>
//             </div>
//           </div>
//         ) : products.length > 0 ? (
//           <div className="space-y-12">
//             {/* Product Grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//               {displayedProducts.map((product, index) => (
//                 <div
//                   key={product.ProductID}
//                   className="animate-fade-in-up"
//                   style={{ animationDelay: `${index * 50}ms` }}
//                 >
//                   <ProductCard
//                     product={product}
//                     onQuickView={setSelectedProductId}
//                   />
//                 </div>
//               ))}
//             </div>

//             {/* Load More Button */}
//             {!showAll && products.length > 12 && (
//               <div className="text-center">
//                 <button
//                   onClick={() => setShowAll(true)}
//                   className="group inline-flex items-center px-8 py-4 border-2 border-black text-black font-bold rounded-2xl hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl bg-white/90 backdrop-blur-sm"
//                 >
//                   <span>View All {products.length} Products</span>
//                   <ChevronDown className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
//                 </button>
//               </div>
//             )}

//             {/* Back to Top */}
//             {showAll && (
//               <div className="text-center">
//                 <button
//                   onClick={() => {
//                     setShowAll(false);
//                     window.scrollTo({ top: 0, behavior: "smooth" });
//                   }}
//                   className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:text-black bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
//                 >
//                   <ChevronDown className="w-4 h-4 mr-2 rotate-180" />
//                   Back to Top
//                 </button>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50">
//             <div className="max-w-md mx-auto">
//               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <Package className="w-12 h-12 text-gray-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-black mb-2">
//                 No products found
//               </h3>
//               <p className="text-gray-600 mb-6 leading-relaxed">
//                 {isSubcategoryView
//                   ? `No ${displayName.toLowerCase()} products are available at the moment.`
//                   : `No products are available in the ${displayName.toLowerCase()} category at the moment.`}
//               </p>
//               <p className="text-sm text-gray-500">
//                 Check back soon for new arrivals!
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Product Modal */}
//         {selectedProductId && (
//           <ProductModal
//             ProductID={selectedProductId}
//             isOpen
//             onClose={() => setSelectedProductId(null)}
//           />
//         )}
//       </div>
//     </div>
//   );
// }