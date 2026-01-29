import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Eye,
  Trash2,
  Package,
  AlertCircle,
  ArrowLeft,
  Star,
  RefreshCw,
} from "lucide-react";

interface WishlistItem {
  productID: number;
  name: string;
  price: number;
  stock: number;
  status?: string;
  imageUrls?: string[];
  colors?: string[]; // Changed from number[] to string[]
  description?: string;
  categoryID?: number; // Made optional
}

interface ProductDetails {
  productID: number;
  name: string;
  price: number;
  stock: number;
  images: string[];
  colors: string[]; // Changed from number[] to string[]
  categoryID: number; // Made non-optional in ProductDetails
  description?: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
}

interface Review {
  reviewID: number;
  productID: number;
  userName: string;
  reviewText: string;
  reviewDate: string;
  likes: number;
  dislikes: number;
  rating: number;
}



const API_BASE_URL = "http://localhost:5005";

export default function WishlistPage() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [productDetails, setProductDetails] = useState<
    Map<number, ProductDetails>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingItems, setRemovingItems] = useState<Set<number>>(new Set());
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        setError(null);

        const userID = localStorage.getItem("userID");
        if (!userID) {
          setError("Please login to view your wishlist");
          setLoading(false);
          return;
        }

        console.log(`🔍 Fetching wishlist for customer ID: ${userID}`);
        const response = await fetch(
          `${API_BASE_URL}/api/Wishlist/Get?customerId=${userID}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setWishlist([]);
            setLoading(false);
            return;
          }
          throw new Error(
            `Failed to fetch wishlist: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("✅ Wishlist data received:", data);
        const wishlistItems = Array.isArray(data) ? data : [];
        setWishlist(wishlistItems);

        // Fetch detailed product information for each wishlist item
        if (wishlistItems.length > 0) {
          await fetchProductDetails(wishlistItems);
        }
      } catch (err) {
        console.error("❌ Error fetching wishlist:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const fetchProductReviews = async (productId: number): Promise<Review[]> => {
    try {
      console.log(`🔍 Fetching reviews for product ID: ${productId}`);
      const response = await fetch(
        `${API_BASE_URL}/api/Product/GetReviews/${productId}`
      );

      if (!response.ok) {
        console.warn(
          `Failed to fetch reviews for product ${productId}: ${response.status}`
        );
        return [];
      }

      const reviews = await response.json();
      console.log(`✅ Reviews fetched for product ${productId}:`, reviews);

      return Array.isArray(reviews)
        ? reviews.map((review: any) => ({
            ...review,
            reviewDate: review.reviewDate || new Date().toISOString(),
          }))
        : [];
    } catch (error) {
      console.error(
        `❌ Error fetching reviews for product ${productId}:`,
        error
      );
      return [];
    }
  };

  const fetchProductDetails = async (wishlistItems: WishlistItem[]) => {
    try {
      setLoadingDetails(true);
      const detailsMap = new Map<number, ProductDetails>();

      for (const wishlistItem of wishlistItems) {
        try {
          const reviews = await fetchProductReviews(wishlistItem.productID);
          const averageRating =
            reviews.length > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                reviews.length
              : 0;

          // Provide default values for required fields
          detailsMap.set(wishlistItem.productID, {
            productID: wishlistItem.productID,
            name: wishlistItem.name,
            price: wishlistItem.price,
            stock: wishlistItem.stock,
            images: wishlistItem.imageUrls || [],
            colors: wishlistItem.colors || [],
            categoryID: wishlistItem.categoryID || 0, // Default value for required field
            description: wishlistItem.description,
            rating: averageRating,
            reviewCount: reviews.length,
            reviews: reviews,
          });
        } catch (err) {
          console.error(
            `Error processing product ${wishlistItem.productID}:`,
            err
          );
        }
      }

      setProductDetails(detailsMap);
    } catch (err) {
      console.error("Error in product details processing:", err);
    } finally {
      setLoadingDetails(false);
    }
  };
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      showNotification("error", "Please login first");
      return;
    }

    setRemovingItems((prev) => new Set(prev).add(productId));

    try {
      console.log(
        `🗑️ Removing product ${productId} from wishlist for customer ${userID}`
      );
      const response = await fetch(
        `${API_BASE_URL}/api/Wishlist/Remove?customerId=${userID}&productId=${productId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setWishlist((prev) =>
          prev.filter((item) => item.productID !== productId)
        );
        setProductDetails((prev) => {
          const newMap = new Map(prev);
          newMap.delete(productId);
          return newMap;
        });
        showNotification("success", "Product removed from wishlist!");
        console.log("✅ Product removed successfully");

        // Dispatch event to update wishlist count in navbar
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        const errorData = await response.text();
        throw new Error(`Failed to remove product: ${errorData}`);
      }
    } catch (err) {
      console.error("❌ Error removing from wishlist:", err);
      showNotification(
        "error",
        err instanceof Error ? err.message : "Failed to remove product"
      );
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleViewDetails = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (product: WishlistItem) => {
    if (product.stock <= 0) {
      showNotification("error", "Product is out of stock");
      return;
    }

    // Navigate to product page for proper cart addition with size/color selection
    navigate(`/product/${product.productID}`);
  };

  const handleBackToShopping = () => {
    navigate("/");
  };

  const refreshWishlist = async () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-gray-600 rounded-full animate-spin mx-auto"
              style={{ animationDelay: "0.3s" }}
            ></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Loading Wishlist
            </h3>
            <p className="text-gray-600">Fetching your saved items...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="max-w-md mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Error Loading Wishlist
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm border ${
            notification.type === "success"
              ? "bg-gray-900 text-white border-gray-700"
              : "bg-red-50 text-red-800 border-red-200"
          } transition-all duration-300 transform animate-pulse`}
        >
          <div className="flex items-center space-x-3">
            {notification.type === "success" ? (
              <Heart className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleBackToShopping}
              className="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <div className="p-2 rounded-lg group-hover:bg-gray-100 transition-colors duration-200">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Back to Shopping</span>
            </button>

            <div className="h-8 w-px bg-gray-300"></div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <span>My Wishlist</span>
              </h1>
              <p className="text-gray-600 mt-2 ml-16">
                {wishlist.length} {wishlist.length === 1 ? "item" : "items"}{" "}
                saved for later
              </p>
            </div>
          </div>

          <button
            onClick={refreshWishlist}
            className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span className="font-medium text-gray-700">Refresh</span>
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Heart className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 mb-10 leading-relaxed text-lg">
                Discover amazing products and save your favorites for later.
                Start exploring and add items to your wishlist!
              </p>
              <button
                onClick={handleBackToShopping}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Start Shopping</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Loading indicator for product details */}
            {loadingDetails && (
              <div className="mb-8 bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin"></div>
                  <span className="text-gray-700 font-medium">
                    Loading product details and reviews...
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlist.map((product) => {
                const details = productDetails.get(product.productID);
                const hasImage = details?.images && details.images.length > 0;

                return (
                  <div
                    key={product.productID}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-700 ease-out transform hover:-translate-y-3 border border-gray-100 group"
                  >
                    {/* Product Image */}
                    <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                      {hasImage ? (
                        <img
                          src={
                            details.images[0]?.startsWith("http")
                              ? details.images[0]
                              : `http://localhost:5005${
                                  details.images[0] || ""
                                }`
                          }
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onLoad={() => {
                            console.log("✅ Image loaded:", details.images[0]);
                          }}
                          onError={(e) => {
                            const brokenSrc = (e.target as HTMLImageElement)
                              .src;
                            console.error(
                              "❌ Failed to load image:",
                              brokenSrc
                            );
                            (e.target as HTMLImageElement).src =
                              "/placeholder-image.jpg";
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                              <Package className="w-10 h-10 text-gray-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">
                              No Image Available
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() =>
                          handleRemoveFromWishlist(product.productID)
                        }
                        disabled={removingItems.has(product.productID)}
                        className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 disabled:opacity-50"
                        aria-label="Remove from wishlist"
                      >
                        {removingItems.has(product.productID) ? (
                          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-500" />
                        )}
                      </button>

                      {/* Stock Badge */}
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1 ${
                            product.stock > 0
                              ? "bg-gray-800 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          <Star className="w-3 h-3" />
                          <span>
                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-gray-800 transition-colors duration-300">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex items-center space-x-1">
                            {details?.rating && details.rating > 0 ? (
                              [...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(details.rating)
                                      ? "text-gray-900 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">
                                No ratings yet
                              </span>
                            )}
                          </div>
                          {details?.rating && details.rating > 0 && (
                            <span className="text-sm text-gray-600">
                              ({details.rating.toFixed(1)}) •{" "}
                              {details.reviewCount} review
                              {details.reviewCount !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-gray-900">
                            Rs. {product.price.toLocaleString()}
                          </div>
                          {product.stock > 0 && (
                            <div className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                              <span>In Stock ({product.stock})</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Color Options */}
                      {details?.colors && details.colors.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-medium text-gray-500">
                            Colors:
                          </span>
                          <div className="flex items-center space-x-1">
                            {details.colors
                              .slice(0, 4)
                              .map((colorName, index) => {
                                // Updated color map to handle both string names and IDs
                                const colorMap: Record<string, string> = {
                                  // Mappings for string color names
                                  red: "#ef4444",
                                  blue: "#3b82f6",
                                  yellow: "#eab308",
                                  green: "#22c55e",
                                  black: "#1f2937",
                                  white: "#f9fafb",
                                  pink: "#ec4899",
                                  gray: "#6b7280",
                                  purple: "#8b5cf6",
                                  orange: "#f97316",
                                  brown: "#d6d3d1",
                                  silver: "#a3a3a3",
                                  navy: "#1e40af",
                                  maroon: "#991b1b",
                                  teal: "#14b8a6",
                                  gold: "#f59e0b",
                                  lightgray: "#9ca3af",

                                  // Keep numeric mappings for backward compatibility
                                  "1": "#ef4444",
                                  "2": "#ec4899",
                                  "3": "#3b82f6",
                                  "4": "#eab308",
                                  "5": "#22c55e",
                                  "6": "#1f2937",
                                  "7": "#f9fafb",
                                  "8": "#6b7280",
                                  "9": "#8b5cf6",
                                  "10": "#f97316",
                                  "11": "#d6d3d1",
                                  "12": "#a3a3a3",
                                  "13": "#1e40af",
                                  "14": "#991b1b",
                                  "15": "#14b8a6",
                                  "16": "#f59e0b",
                                  "17": "#9ca3af",
                                };

                                // Convert color name to lowercase for case-insensitive matching
                                const colorKey =
                                  typeof colorName === "string"
                                    ? colorName.toLowerCase()
                                    : String(colorName);

                                return (
                                  <div
                                    key={index}
                                    className="relative w-5 h-5 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200"
                                    style={{
                                      backgroundColor:
                                        colorMap[colorKey] || "#9ca3af",
                                    }}
                                  >
                                    {colorMap[colorKey] === "#f9fafb" && (
                                      <div className="absolute inset-0.5 border border-gray-300 rounded-full"></div>
                                    )}
                                  </div>
                                );
                              })}
                            {details.colors.length > 4 && (
                              <span className="text-xs text-gray-400 font-medium ml-1">
                                +{details.colors.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => handleViewDetails(product.productID)}
                          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 border-2 border-gray-300 hover:border-gray-400"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">View</span>
                        </button>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                          className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                            product.stock > 0
                              ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transform hover:scale-105"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="text-sm">
                            {product.stock > 0 ? "Add to Cart" : "Unavailable"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Summary Footer */}
        {wishlist.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">
                  Wishlist Summary
                </h3>
                <p className="text-gray-600">
                  {wishlist.length} items • Total value: Rs.{" "}
                  {wishlist
                    .reduce((sum, item) => sum + item.price, 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Save your favorite items and never miss out on great deals
                </p>
              </div>
              <button
                onClick={handleBackToShopping}
                className="flex items-center space-x-2 px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
