import React, { useState, useEffect } from "react";
import { ShoppingCart, Eye, Heart, Star, Zap, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Product,
  COLOR_MAP,
  COLOR_NAME_TO_ID,
  SIZE_MAP,
  Review
} from "../types/Product";

interface ProductCardProps {
  product: Product;
  onQuickView?: (productId: number) => void;
  viewMode?: "grid" | "list";
}



const API_BASE_URL = "http://localhost:5005";

export default function ProductCard({
  product,
  onQuickView,
  viewMode = "grid",
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");
  const isLoggedIn = !!localStorage.getItem("token");
   const getNormalizedColor = (color: number | string): number => {
    if (typeof color === 'number') return color;
    return COLOR_NAME_TO_ID[color.toLowerCase()] || 0; // 0 or some default if not found
  };

  // Helper function to safely get product images
//  const getProductImages = (): { url: string }[] => {
//    console.log("product.images:", product.images); // debug log

//    return (product.images || [])
//      .map((img: any): { url: string } | null => {
//        const path = img?.path?.trim(); // use .path, not imagePath

//        if (path) {
//          return {
//            url: `http://localhost:5005${
//              path.startsWith("/") ? "" : "/"
//            }${path}`,
//          };
//        }
//        return null;
//      })
//      .filter((img): img is { url: string } => img !== null);
//  };
// First, define a type for possible image formats
type ProductImage = string | { path?: string; url?: string; image?: string };

const getProductImages = (): { url: string }[] => {
  if (!product.images) {
    return [];
  }

  // Handle string array case
  if (Array.isArray(product.images)) {
    const validImages: { url: string }[] = [];
    
    for (const img of product.images) {
      if (typeof img === 'string' && img.trim().length > 0) {
        validImages.push({
          url: img.startsWith('http') ? img : `${API_BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`
        });
      } else if (typeof img === 'object' && img !== null) {
        const path = (img as { path?: string }).path;
        const url = (img as { url?: string }).url;
        const image = (img as { image?: string }).image;
        const imageSrc = path || url || image;
        
        if (typeof imageSrc === 'string' && imageSrc.trim().length > 0) {
          validImages.push({
            url: imageSrc.startsWith('http') ? imageSrc : `${API_BASE_URL}${imageSrc.startsWith('/') ? '' : '/'}${imageSrc}`
          });
        }
      }
    }
    return validImages;
  }

  // Handle single string case
  if (typeof product.images === 'string') {
    const trimmed = product.images.trim();
    if (trimmed.length > 0) {
      return [{
        url: trimmed.startsWith('http') ? trimmed : `${API_BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`
      }];
    }
    return [];
  }

  // Handle single object case
  if (typeof product.images === 'object' && product.images !== null) {
    const path = (product.images as { path?: string }).path;
    const url = (product.images as { url?: string }).url;
    const image = (product.images as { image?: string }).image;
    const imageSrc = path || url || image;
    
    if (typeof imageSrc === 'string' && imageSrc.trim().length > 0) {
      return [{
        url: imageSrc.startsWith('http') ? imageSrc : `${API_BASE_URL}${imageSrc.startsWith('/') ? '' : '/'}${imageSrc}`
      }];
    }
  }

  return [];
};


  // Helper function to safely get product colors
  const getProductColors = () => {
    console.log("🎨 ProductCard - Product colors data:", product.Colors);

    if (!product.Colors) {
      console.log("❌ ProductCard - No colors found");
      return [];
    }

    // Handle array of colors (either IDs or names)
    if (Array.isArray(product.Colors)) {
      return product.Colors.map((color) => {
        if (typeof color === "number") return color;
        if (typeof color === "string") {
          const normalized = getNormalizedColor(color);
          return normalized !== 0 ? normalized : color;
        }
        return color;
      }).filter((color) => color !== 0); // Filter out invalid colors
    }

    // Handle single color value
    if (
      typeof product.Colors === "number" ||
      typeof product.Colors === "string"
    ) {
      const normalized = getNormalizedColor(product.Colors);
      return normalized !== 0 ? [normalized] : [];
    }

    // Handle object cases (if needed)
    if (typeof product.Colors === "object") {
      const colorsArray = Object.values(product.Colors);
      return colorsArray
        .map((color) => {
          if (typeof color === "number") return color;
          if (typeof color === "string") {
            const normalized = getNormalizedColor(color);
            return normalized !== 0 ? normalized : color;
          }
          return color;
        })
        .filter((color) => color !== 0);
    }

    return [];
  };

  // Helper function to safely get product sizes
  const getProductSizes = () => {
    console.log("📏 ProductCard - Product sizes data:", product.Sizes);

    if (!product.Sizes) {
      console.log("❌ ProductCard - No sizes found");
      return [];
    }

    // Since sizes are now normalized in ProductListing, they should be an array
    if (Array.isArray(product.Sizes)) {
      console.log("✅ ProductCard - Sizes is array:", product.Sizes);
      return product.Sizes;
    }

    // Fallback handling for edge cases
    if (product.Sizes && typeof product.Sizes === "object") {
      // Check if it's a Set-like object with values
      if ("size" in product.Sizes || Symbol.iterator in product.Sizes) {
        const sizeArray = Array.from(product.Sizes as Iterable<any>);
        console.log("✅ ProductCard - Converted Set to array:", sizeArray);
        return sizeArray;
      }
      // If it's an object with values, get the values
      const sizeArray = Object.values(product.Sizes);
      console.log(
        "✅ ProductCard - Converted object values to array:",
        sizeArray
      );
      return sizeArray;
    }

    // If it's a single value, wrap in array
    if (
      typeof product.Sizes === "number" ||
      typeof product.Sizes === "string"
    ) {
      console.log("✅ ProductCard - Single size wrapped in array:", [
        product.Sizes,
      ]);
      return [product.Sizes];
    }

    console.log(
      "❌ ProductCard - Unable to process sizes, returning empty array"
    );
    return [];
  };

  const productImages = getProductImages();
  const productColors = getProductColors();
  const productSizes = getProductSizes();

  useEffect(() => {
    console.log("🔍 ProductCard - Received product:", {
      id: product.ProductID,
      name: product.name,
      rawImages: product.images,
      rawColors: product.Colors,
      rawSizes: product.Sizes,
      processedImages: productImages,
      processedColors: productColors,
      processedSizes: productSizes,
    });

    // Enhanced debug color processing
    if (productColors.length > 0) {
      console.log("🎨 ProductCard - Color processing debug:", {
        rawColors: product.Colors,
        processedColors: productColors,
        colorMappings: productColors.map((color, index) => {
          const colorId =
            typeof color === "number" ? color : parseInt(String(color), 10);
          const colorInfo = COLOR_MAP[colorId];
          return {
            index,
            original: color,
            colorId,
            mapping: colorInfo,
            isValidId: !isNaN(colorId) && colorInfo !== undefined,
            hex: colorInfo?.hex || "#9ca3af",
            name: colorInfo?.name || `Color ${colorId}`,
          };
        }),
      });
    }

    // Enhanced debug size processing
    if (productSizes.length > 0) {
      console.log("📏 ProductCard - Size processing debug:", {
        rawSizes: product.Sizes,
        processedSizes: productSizes,
        sizeMappings: productSizes.map((size, index) => {
          const sizeId =
            typeof size === "number" ? size : parseInt(String(size), 10);
          const sizeInfo = SIZE_MAP[sizeId];
          return {
            index,
            original: size,
            sizeId,
            mapping: sizeInfo,
            isValidId: !isNaN(sizeId) && sizeInfo !== undefined,
            displayName: sizeInfo || String(size),
          };
        }),
      });
    }
  }, [product, productColors, productSizes, productImages]);

  useEffect(() => {
    if (isLoggedIn && userID) {
      checkWishlistStatus();
    }
    fetchProductRating();
  }, [product.ProductID, userID, isLoggedIn]);

  const checkWishlistStatus = async () => {
    if (!userID) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Wishlist/Get?customerId=${userID}`
      );
      if (response.ok) {
        const wishlist = await response.json();
        setIsInWishlist(
          wishlist.some((item: any) => item.productID === product.ProductID)
        );
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const fetchProductRating = async () => {
    setRatingsLoading(true);
    try {
      console.log(`🔍 Fetching reviews for product ID: ${product.ProductID}`);
      const response = await fetch(
        `${API_BASE_URL}/api/Product/GetReviews/${product.ProductID}`
      );

      if (response.ok) {
        const reviews: Review[] = await response.json();
        console.log("✅ Reviews fetched:", reviews);

        if (reviews.length > 0) {
          const averageRating =
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length;
          setRating(averageRating);
          setReviewCount(reviews.length);
        } else {
          setRating(0);
          setReviewCount(0);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching reviews:", error);
      setRating(0);
      setReviewCount(0);
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn || !userID) {
      showNotification("error", "Please login to manage wishlist");
      return;
    }

    setWishlistLoading(true);

    try {
      const endpoint = isInWishlist ? "Remove" : "Add";
      const method = isInWishlist ? "DELETE" : "POST";

      console.log(
        `${
          isInWishlist ? "🗑️ Removing from" : "➕ Adding to"
        } wishlist: Product ${product.ProductID}`
      );

      const response = await fetch(
        `${API_BASE_URL}/api/Wishlist/${endpoint}?customerId=${userID}&productId=${product.ProductID}`,
        { method }
      );

      if (response.ok) {
        setIsInWishlist(!isInWishlist);
        showNotification(
          "success",
          isInWishlist ? "Removed from wishlist!" : "Added to wishlist!"
        );

        // Dispatch event to update wishlist count in navbar
        window.dispatchEvent(new Event("wishlistUpdated"));
        console.log(
          `✅ Wishlist ${isInWishlist ? "removal" : "addition"} successful`
        );
      } else {
        const errorData = await response.text();
        throw new Error(
          `Failed to ${
            isInWishlist ? "remove from" : "add to"
          } wishlist: ${errorData}`
        );
      }
    } catch (error) {
      console.error("❌ Wishlist error:", error);
      showNotification(
        "error",
        error instanceof Error ? error.message : "Error updating wishlist"
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleProductClick = () => {
    navigate(`/product/${product.ProductID}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product.ProductID);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      showNotification("error", "Please login to add items to cart");
      return;
    }

    if (product.Stock === 0) {
      showNotification("error", "Product is out of stock");
      return;
    }

    showNotification(
      "success",
      "Click 'View Product' to select size and color before adding to cart"
    );
  };

  if (viewMode === "list") {
    return (
      <>
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === "success" ? (
                <Heart className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="font-medium text-sm">
                {notification.message}
              </span>
            </div>
          </div>
        )}

        <div className="group relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-300">
          <div className="flex">
            {/* Product Image */}
            <div
              className="relative w-48 h-48 bg-gray-50 cursor-pointer flex-shrink-0"
              onClick={handleProductClick}
            >
              {productImages.length > 0 && productImages[0]?.url ? (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img
                    src={productImages[0].url}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                  />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-xs">No Image</span>
                  </div>
                </div>
              )}

              {/* Product Badge */}
              <div className="absolute top-3 left-3">
                {product.Stock < 5 && product.Stock > 0 ? (
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Only {product.Stock} left!</span>
                  </div>
                ) : product.Stock === 0 ? (
                  <div className="bg-black text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                    Out of Stock
                  </div>
                ) : (
                  <div className="bg-gray-800 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>In Stock</span>
                  </div>
                )}
              </div>

              {/* Wishlist Button */}
              {isLoggedIn && (
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 disabled:opacity-50"
                >
                  {wishlistLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Heart
                      className={`w-4 h-4 transition-colors duration-200 ${
                        isInWishlist
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600 hover:text-red-500"
                      }`}
                    />
                  )}
                </button>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-black text-lg mb-2 group-hover:text-gray-800 transition-colors duration-300">
                  {product.name}
                </h3>

                {/* Rating Stars */}
                <div className="flex items-center space-x-1 mb-3">
                  {ratingsLoading ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : rating > 0 ? (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        ({rating.toFixed(1)}) {reviewCount} review
                        {reviewCount !== 1 ? "s" : ""}
                      </span>
                    </>
                  ) : (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gray-300" />
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        No reviews yet
                      </span>
                    </>
                  )}
                </div>

                {/* Color Options */}
                {productColors.length > 0 && (
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      Colors:
                    </span>
                    <div className="flex items-center space-x-1">
                      {productColors.slice(0, 5).map((color, index) => {
                        // Convert color to number for COLOR_MAP lookup
                        const colorId =
                          typeof color === "number"
                            ? color
                            : parseInt(String(color), 10);
                        const colorInfo = COLOR_MAP[colorId] || {
                          hex: "#9ca3af",
                          name: `Color ${colorId}`,
                        };

                        return (
                          <div
                            key={index}
                            className="relative w-5 h-5 rounded-full border-2 border-gray-300 shadow-sm hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: colorInfo.hex }}
                            title={colorInfo.name}
                          >
                            {colorInfo.hex === "#f9fafb" && (
                              <div className="absolute inset-0.5 border border-gray-400 rounded-full"></div>
                            )}
                          </div>
                        );
                      })}
                      {productColors.length > 5 && (
                        <span className="text-sm text-gray-500 font-medium ml-1">
                          +{productColors.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Size Info */}
                {productSizes.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm font-medium text-gray-600">
                      Sizes:
                    </span>
                    <div className="flex items-center space-x-1">
                      {productSizes.slice(0, 4).map((size, index) => (
                        <span
                          key={index}
                          className="text-sm bg-gray-100 text-black px-2 py-1 rounded-md font-medium border border-gray-200"
                        >
                          {SIZE_MAP[
                            typeof size === "number"
                              ? size
                              : parseInt(String(size), 10)
                          ] || String(size)}
                        </span>
                      ))}

                      {productSizes.length > 4 && (
                        <span className="text-sm text-gray-500 font-medium">
                          +{productSizes.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-black">
                    Rs. {product.price.toLocaleString()}
                  </div>
                  {product.Stock > 0 && (
                    <div className="text-sm text-gray-600 font-medium flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>In Stock ({product.Stock})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleProductClick}
                    className="bg-white border-2 border-black text-black px-4 py-2 rounded-lg font-semibold hover:bg-black hover:text-white transition-all duration-300"
                  >
                    View Product
                  </button>

                  {onQuickView && (
                    <button
                      onClick={handleQuickView}
                      className="bg-gray-200 text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                    >
                      Quick View
                    </button>
                  )}

                  <button
                    disabled={product.Stock === 0}
                    onClick={handleAddToCart}
                    className="bg-black text-white p-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === "success" ? (
              <Heart className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      <div
        className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-2 border border-gray-200 hover:border-gray-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Badge */}
        <div className="absolute top-4 left-4 z-20">
          {product.Stock < 5 && product.Stock > 0 ? (
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Only {product.Stock} left!</span>
            </div>
          ) : product.Stock === 0 ? (
            <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Out of Stock
            </div>
          ) : (
            <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>In Stock</span>
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        {isLoggedIn && (
          <button
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 disabled:opacity-50"
          >
            {wishlistLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Heart
                className={`w-4 h-4 transition-colors duration-200 ${
                  isInWishlist
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600 hover:text-red-500"
                }`}
              />
            )}
          </button>
        )}

        {/* Product Image */}
        <div
          className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer"
          onClick={handleProductClick}
        >
          <div className="aspect-square relative">
            {productImages.length > 0 && productImages[0]?.url ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={productImages[0].url}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  <span className="text-sm font-medium">
                    No Image Available
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Overlay with Actions */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {/* <button
                onClick={handleProductClick}
                className="bg-white/95 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-white transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Eye className="w-4 h-4" />
                <span>View Product</span>
              </button> */}

              {onQuickView && (
                <button
                  onClick={handleQuickView}
                  className="bg-black text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Eye className="w-4 h-4" />
                  <span>Quick View</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-4">
          {/* Product Name */}
          <div>
            <h3 className="font-bold text-black text-base line-clamp-2 mb-2 group-hover:text-gray-800 transition-colors duration-300">
              {product.name}
            </h3>

            {/* Color Options */}
            {productColors.length > 0 && (
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xs font-medium text-gray-600">
                  Colors:
                </span>
                <div className="flex items-center space-x-1">
                  {productColors.slice(0, 4).map((color, index) => {
                    // Convert color to number for COLOR_MAP lookup
                    const colorId =
                      typeof color === "number"
                        ? color
                        : parseInt(String(color), 10);
                    const colorInfo = COLOR_MAP[colorId] || {
                      hex: "#9ca3af",
                      name: `Color ${colorId}`,
                    };

                    return (
                      <div
                        key={index}
                        className="relative w-5 h-5 rounded-full border-2 border-gray-300 shadow-md hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: colorInfo.hex }}
                        title={colorInfo.name}
                      >
                        {colorInfo.hex === "#f9fafb" && (
                          <div className="absolute inset-0.5 border border-gray-400 rounded-full"></div>
                        )}
                      </div>
                    );
                  })}
                  {productColors.length > 4 && (
                    <span className="text-xs text-gray-500 font-medium ml-1">
                      +{productColors.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Size Info */}
            {productSizes.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-600">
                  Sizes:
                </span>
                <div className="flex items-center space-x-1">
                  {productSizes.slice(0, 3).map((size, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-black px-2 py-1 rounded-md font-medium border border-gray-200"
                    >
                      {SIZE_MAP[
                        typeof size === "number"
                          ? size
                          : parseInt(String(size), 10)
                      ] || String(size)}
                    </span>
                  ))}
                  {productSizes.length > 3 && (
                    <span className="text-xs text-gray-500 font-medium">
                      +{productSizes.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-black">
                Rs. {product.price.toLocaleString()}
              </div>
              {product.Stock > 0 && (
                <div className="text-xs text-gray-600 font-semibold flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>In Stock ({product.Stock})</span>
                </div>
              )}
            </div>

            {/* <button
              disabled={product.Stock === 0}
              onClick={handleAddToCart}
              className="group/btn relative bg-black text-white p-3 rounded-xl font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              <ShoppingCart className="w-5 h-5" />
              <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 rounded-xl transition-opacity duration-300"></div>
            </button> */}
          </div>

          {/* Rating Stars */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              {ratingsLoading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500">Loading...</span>
                </div>
              ) : rating > 0 ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-gray-600 ml-1">
                    ({rating.toFixed(1)}) {reviewCount} review
                    {reviewCount !== 1 ? "s" : ""}
                  </span>
                </>
              ) : (
                <>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-gray-300" />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    No reviews yet
                  </span>
                </>
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              Premium Quality
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
// import React, { useState, useEffect } from "react";
// import { Eye, Heart, Star, AlertCircle } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import {
//   Product,
//   COLOR_MAP,
//   COLOR_NAME_TO_ID,
//   SIZE_MAP,
//   Review,
// } from "../types/Product";

// interface ProductCardProps {
//   product: Product;
//   onQuickView?: (productId: number) => void;
// }

// const API_BASE_URL = "http://localhost:5005";

// export default function ProductCard({
//   product,
//   onQuickView,
// }: ProductCardProps) {
//   const [isHovered, setIsHovered] = useState(false);
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [isInWishlist, setIsInWishlist] = useState(false);
//   const [wishlistLoading, setWishlistLoading] = useState(false);
//   const [rating, setRating] = useState(0);
//   const [reviewCount, setReviewCount] = useState(0);
//   const [notification, setNotification] = useState<{
//     type: "success" | "error";
//     message: string;
//   } | null>(null);

//   const navigate = useNavigate();
//   const userID = localStorage.getItem("userID");
//   const isLoggedIn = !!localStorage.getItem("token");

//   const getNormalizedColor = (color: number | string): number => {
//     if (typeof color === "number") return color;
//     return COLOR_NAME_TO_ID[color.toLowerCase()] || 0;
//   };

//   const getProductImages = (): { url: string }[] => {
//     if (!product.images) return [];

//     if (Array.isArray(product.images)) {
//       const validImages: { url: string }[] = [];

//       for (const img of product.images) {
//         if (typeof img === "string" && img.trim().length > 0) {
//           validImages.push({
//             url: img.startsWith("http")
//               ? img
//               : `${API_BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`,
//           });
//         } else if (typeof img === "object" && img !== null) {
//           const path = (img as { path?: string }).path;
//           const url = (img as { url?: string }).url;
//           const image = (img as { image?: string }).image;
//           const imageSrc = path || url || image;

//           if (typeof imageSrc === "string" && imageSrc.trim().length > 0) {
//             validImages.push({
//               url: imageSrc.startsWith("http")
//                 ? imageSrc
//                 : `${API_BASE_URL}${
//                     imageSrc.startsWith("/") ? "" : "/"
//                   }${imageSrc}`,
//             });
//           }
//         }
//       }
//       return validImages;
//     }

//     if (typeof product.images === "string") {
//       const trimmed = product.images.trim();
//       if (trimmed.length > 0) {
//         return [
//           {
//             url: trimmed.startsWith("http")
//               ? trimmed
//               : `${API_BASE_URL}${
//                   trimmed.startsWith("/") ? "" : "/"
//                 }${trimmed}`,
//           },
//         ];
//       }
//       return [];
//     }

//     if (typeof product.images === "object" && product.images !== null) {
//       const path = (product.images as { path?: string }).path;
//       const url = (product.images as { url?: string }).url;
//       const image = (product.images as { image?: string }).image;
//       const imageSrc = path || url || image;

//       if (typeof imageSrc === "string" && imageSrc.trim().length > 0) {
//         return [
//           {
//             url: imageSrc.startsWith("http")
//               ? imageSrc
//               : `${API_BASE_URL}${
//                   imageSrc.startsWith("/") ? "" : "/"
//                 }${imageSrc}`,
//           },
//         ];
//       }
//     }

//     return [];
//   };

//   const getProductColors = () => {
//     if (!product.Colors) return [];

//     if (Array.isArray(product.Colors)) {
//       return product.Colors.map((color) => {
//         if (typeof color === "number") return color;
//         if (typeof color === "string") {
//           const normalized = getNormalizedColor(color);
//           return normalized !== 0 ? normalized : color;
//         }
//         return color;
//       }).filter((color) => color !== 0);
//     }

//     if (
//       typeof product.Colors === "number" ||
//       typeof product.Colors === "string"
//     ) {
//       const normalized = getNormalizedColor(product.Colors);
//       return normalized !== 0 ? [normalized] : [];
//     }

//     if (typeof product.Colors === "object") {
//       const colorsArray = Object.values(product.Colors);
//       return colorsArray
//         .map((color) => {
//           if (typeof color === "number") return color;
//           if (typeof color === "string") {
//             const normalized = getNormalizedColor(color);
//             return normalized !== 0 ? normalized : color;
//           }
//           return color;
//         })
//         .filter((color) => color !== 0);
//     }

//     return [];
//   };

//   const getProductSizes = () => {
//     if (!product.Sizes) return [];

//     if (Array.isArray(product.Sizes)) {
//       return product.Sizes;
//     }

//     if (product.Sizes && typeof product.Sizes === "object") {
//       if ("size" in product.Sizes || Symbol.iterator in product.Sizes) {
//         return Array.from(product.Sizes as Iterable<any>);
//       }
//       return Object.values(product.Sizes);
//     }

//     if (
//       typeof product.Sizes === "number" ||
//       typeof product.Sizes === "string"
//     ) {
//       return [product.Sizes];
//     }

//     return [];
//   };

//   const productImages = getProductImages();
//   const productColors = getProductColors();
//   const productSizes = getProductSizes();

//   useEffect(() => {
//     if (isLoggedIn && userID) {
//       checkWishlistStatus();
//     }
//     fetchProductRating();
//   }, [product.ProductID, userID, isLoggedIn]);

//   const checkWishlistStatus = async () => {
//     if (!userID) return;

//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/api/Wishlist/Get?customerId=${userID}`
//       );
//       if (response.ok) {
//         const wishlist = await response.json();
//         setIsInWishlist(
//           wishlist.some((item: any) => item.productID === product.ProductID)
//         );
//       }
//     } catch (error) {
//       console.error("Error checking wishlist:", error);
//     }
//   };

//   const fetchProductRating = async () => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/api/Product/GetReviews/${product.ProductID}`
//       );

//       if (response.ok) {
//         const reviews: Review[] = await response.json();
//         if (reviews.length > 0) {
//           const averageRating =
//             reviews.reduce((sum, review) => sum + review.rating, 0) /
//             reviews.length;
//           setRating(averageRating);
//           setReviewCount(reviews.length);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching reviews:", error);
//     }
//   };

//   const handleWishlistToggle = async (e: React.MouseEvent) => {
//     e.stopPropagation();

//     if (!isLoggedIn || !userID) {
//       showNotification("error", "Please login to manage wishlist");
//       return;
//     }

//     setWishlistLoading(true);

//     try {
//       const endpoint = isInWishlist ? "Remove" : "Add";
//       const method = isInWishlist ? "DELETE" : "POST";

//       const response = await fetch(
//         `${API_BASE_URL}/api/Wishlist/${endpoint}?customerId=${userID}&productId=${product.ProductID}`,
//         { method }
//       );

//       if (response.ok) {
//         setIsInWishlist(!isInWishlist);
//         showNotification(
//           "success",
//           isInWishlist ? "Removed from wishlist!" : "Added to wishlist!"
//         );
//         window.dispatchEvent(new Event("wishlistUpdated"));
//       }
//     } catch (error) {
//       console.error("Wishlist error:", error);
//       showNotification(
//         "error",
//         error instanceof Error ? error.message : "Error updating wishlist"
//       );
//     } finally {
//       setWishlistLoading(false);
//     }
//   };

//   const showNotification = (type: "success" | "error", message: string) => {
//     setNotification({ type, message });
//     setTimeout(() => setNotification(null), 3000);
//   };

//   const handleProductClick = () => {
//     if (product.Stock > 0) {
//       navigate(`/product/${product.ProductID}`);
//     }
//   };

//   const handleQuickView = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (onQuickView && product.Stock > 0) {
//       onQuickView(product.ProductID);
//     }
//   };

//   return (
//     <>
//       {notification && (
//         <div
//           className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
//             notification.type === "success"
//               ? "bg-green-500 text-white"
//               : "bg-red-500 text-white"
//           }`}
//         >
//           <div className="flex items-center space-x-2">
//             {notification.type === "success" ? (
//               <Heart className="w-4 h-4" />
//             ) : (
//               <AlertCircle className="w-4 h-4" />
//             )}
//             <span className="font-medium text-sm">{notification.message}</span>
//           </div>
//         </div>
//       )}

//       <div
//         className={`group relative bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 border ${
//           product.Stock === 0 ? "border-gray-200" : "border-gray-100"
//         }`}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         {/* Product Badge */}
//         {product.Stock === 0 ? (
//           <div className="absolute top-3 left-3 z-20 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
//             Out of Stock
//           </div>
//         ) : product.Stock < 5 ? (
//           <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold shadow">
//             Only {product.Stock} left
//           </div>
//         ) : null}

//         {/* Wishlist Button */}
//         {isLoggedIn && (
//           <button
//             onClick={handleWishlistToggle}
//             disabled={wishlistLoading || product.Stock === 0}
//             className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow hover:scale-110 transition-all duration-200 disabled:opacity-50 ${
//               product.Stock === 0
//                 ? "bg-gray-100"
//                 : "bg-white/90 backdrop-blur-sm"
//             }`}
//           >
//             {wishlistLoading ? (
//               <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
//             ) : (
//               <Heart
//                 className={`w-4 h-4 transition-colors duration-200 ${
//                   isInWishlist
//                     ? "fill-red-500 text-red-500"
//                     : product.Stock === 0
//                     ? "text-gray-400"
//                     : "text-gray-600 hover:text-red-500"
//                 }`}
//               />
//             )}
//           </button>
//         )}

//         {/* Product Image */}
//         <div
//           className="relative overflow-hidden bg-gray-50"
//           onClick={handleProductClick}
//         >
//           <div className="w-full h-80">
//             {productImages.length > 0 && productImages[0]?.url ? (
//               <>
//                 {!imageLoaded && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
//                   </div>
//                 )}
//                 <img
//                   src={productImages[0].url}
//                   alt={product.name}
//                   className={`w-full h-full object-cover transition-all duration-500 ${
//                     imageLoaded ? "opacity-100" : "opacity-0"
//                   } ${product.Stock === 0 ? "opacity-70" : ""}`}
//                   loading="lazy"
//                   onLoad={() => setImageLoaded(true)}
//                 />
//               </>
//             ) : (
//               <div className="w-full h-full flex items-center justify-center text-gray-400">
//                 <div className="text-center">
//                   <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
//                     <Eye className="w-6 h-6 text-gray-400" />
//                   </div>
//                   <span className="text-sm">No Image</span>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Quick View Button */}
//           {product.Stock > 0 && (
//             <div
//               className={`absolute bottom-0 left-0 right-0 bg-black/80 text-white py-2 text-center transition-opacity duration-300 ${
//                 isHovered ? "opacity-100" : "opacity-0"
//               }`}
//             >
//               <button
//                 onClick={handleQuickView}
//                 className="text-sm font-medium hover:underline"
//               >
//                 Quick View
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Product Info */}
//         <div className="p-4">
//           <h3
//             className={`font-medium text-base mb-1 line-clamp-1 ${
//               product.Stock === 0 ? "text-gray-500" : "text-gray-900"
//             }`}
//           >
//             {product.name}
//           </h3>

//           {/* Color and Size Indicators */}
//           <div className="flex items-center justify-between mb-2">
//             {/* Color Dots */}
//             {productColors.length > 0 && (
//               <div className="flex items-center space-x-1">
//                 {productColors.slice(0, 3).map((color, index) => {
//                   const colorId =
//                     typeof color === "number"
//                       ? color
//                       : parseInt(String(color), 10);
//                   const colorInfo = COLOR_MAP[colorId] || { hex: "#9ca3af" };
//                   return (
//                     <div
//                       key={index}
//                       className="w-3 h-3 rounded-full border border-gray-200"
//                       style={{
//                         backgroundColor: colorInfo.hex,
//                         opacity: product.Stock === 0 ? 0.5 : 1,
//                       }}
//                     />
//                   );
//                 })}
//                 {productColors.length > 3 && (
//                   <span className="text-xs text-gray-400">
//                     +{productColors.length - 3}
//                   </span>
//                 )}
//               </div>
//             )}

//             {/* Size Indicators */}
//             {productSizes.length > 0 && (
//               <div className="flex items-center space-x-1">
//                 {productSizes.slice(0, 2).map((size, index) => (
//                   <span
//                     key={index}
//                     className={`text-xs px-1.5 py-0.5 rounded ${
//                       product.Stock === 0
//                         ? "bg-gray-100 text-gray-400"
//                         : "bg-gray-100 text-gray-800"
//                     }`}
//                   >
//                     {SIZE_MAP[
//                       typeof size === "number"
//                         ? size
//                         : parseInt(String(size), 10)
//                     ] || String(size)}
//                   </span>
//                 ))}
//                 {productSizes.length > 2 && (
//                   <span className="text-xs text-gray-400">
//                     +{productSizes.length - 2}
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Price and Rating */}
//           <div className="flex items-center justify-between">
//             <div
//               className={`text-lg font-bold ${
//                 product.Stock === 0 ? "text-gray-400" : "text-gray-900"
//               }`}
//             >
//               Rs. {product.price.toLocaleString()}
//             </div>

//             {/* Rating */}
//             {rating > 0 && (
//               <div className="flex items-center space-x-1">
//                 <Star
//                   className={`w-3 h-3 ${
//                     product.Stock === 0 ? "text-gray-300" : "text-yellow-400"
//                   } fill-current`}
//                 />
//                 <span
//                   className={`text-xs ${
//                     product.Stock === 0 ? "text-gray-400" : "text-gray-600"
//                   }`}
//                 >
//                   {rating.toFixed(1)}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }