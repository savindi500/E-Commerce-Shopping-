
import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Eye,
  ShoppingCart,
  Heart,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";
import ProductCard from "./ProductCard";
import { addToCart } from "../types/CartItem";

interface ProductImage {
  ImageID: number;
  path: string;
}

interface BackendProduct {
  productID: number;
  name: string;
  categoryID: number;
  categoryName: string;
  subCategoryID: number;
  subCategoryName: string;
  stock: number;
  price: number;
  colors: Array<{ colorID: number; name: string }>;
  sizes: Array<{ sizeID: number; name: string }>;
  images: ProductImage[];
}

const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
useEffect(() => {
  // Scroll to top when component mounts or route changes
  window.scrollTo(0, 0);
}, [location.pathname, location.search]); 
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        const response = await fetch(
          "http://localhost:5005/api/Product/GetLatestProducts"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: BackendProduct[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch products"
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: BackendProduct) => {
    const imagePath = product.images?.[0]?.path;
    const imageUrl = imagePath
      ? `http://localhost:5005${
          imagePath.startsWith("/") ? "" : "/"
        }${imagePath}`
      : undefined;

    addToCart({
      ProductID: product.productID,
      Name: product.name,
      Price: product.price,
      Quantity: 1,
      ImageUrl: imageUrl,
      Size: product.sizes[0]?.name || "",
      Color: product.colors[0]?.name || "",
      Id: 0,
      UserID: 0,
    });
  };

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  const displayedProducts = showAll ? products : products.slice(0, 8);

  return (
    <section className="bg-white min-h-screen pt-20">
      {/* Hero Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Sparkles className="w-8 h-8 text-gray-900 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-800 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-4xl font-bold ml-3 text-gray-900">
                New Arrivals
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              Discover our latest collection of premium products, carefully
              curated for style and quality
            </p>

            {/* Stats Bar */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-900" />
                <span>Fresh Arrivals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-gray-900" />
                <span>Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-8">
            {/* Loading Header */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm border border-gray-200">
                <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 font-medium">
                  Loading latest arrivals...
                </span>
              </div>
            </div>

            {/* Loading Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse border border-gray-100"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
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
                Failed to load new arrivals
              </h3>
              <p className="text-gray-500 mb-6">
                {error}. Please make sure the API server is running on
                localhost:5005.
              </p>
              <button
                onClick={retryFetch}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Latest Products
                </h2>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {products.length} items
                </span>
              </div>

              {products.length > 8 && (
                <div className="text-sm text-gray-500">
                  Showing {displayedProducts.length} of {products.length}{" "}
                  products
                </div>
              )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={`product-${product.productID}`}
                  product={{
                    ProductID: product.productID,
                    name: product.name,
                    CategoryID: product.categoryID,
                    SubCategoryID: product.subCategoryID,
                    Stock: product.stock,
                    price: product.price,
                    Colors: product.colors.map((c) => c.colorID),
                    Sizes: product.sizes.map((s) => s.sizeID),
                    images: product.images.map((img) => img.path),
                    description: product.categoryName,
                  }}
                />
              ))}
            </div>

            {/* View All Button */}
            {!showAll && products.length > 8 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-sm"
                >
                  <span>View All {products.length} New Arrivals</span>
                  <Sparkles className="ml-2 w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No new arrivals yet
              </h3>
              <p className="text-gray-500 mb-6">
                Check back soon for the latest products and collections.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;