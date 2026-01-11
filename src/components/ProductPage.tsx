import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Zap,
  Award,
  Clock,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Share2,
  Info,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  User,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Package,
  Sparkles,
  Gift,
  Timer,
  TrendingUp,
} from "lucide-react";
import { addToCart as addToLocalCart } from "../types/CartItem";
import SizeChart from "./SizeChart";
import { COLOR_MAP, SIZE_MAP, COLOR_NAME_TO_ID } from "../types/Product";

interface Color {
  productID: number;
  colorID: number;
  product: any;
  color: string | null;
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

interface Product {
  id: number;
  name: string;
  price: number;
  color: Color[];
  sizes: { sizeId: number; sizeName: string }[];
  images: string[];
  rating: number;
  reviews: Review[];
  reviewCount: number;
  description?: string;
  Stock: number;
  categoryName: string;
}

interface SizeChartProps {
  onClose: () => void;
  category: string;
}

const API_BASE_URL = "http://localhost:5005";

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/products");
    }
  };

  const ProductID = productId ? parseInt(productId) : null;

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [userReactionLoading, setUserReactionLoading] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (ProductID) {
      fetchProduct();
      checkWishlistStatus();
    }
  }, [ProductID]);

  const checkWishlistStatus = async () => {
    const userID = localStorage.getItem("userID");
    if (!userID || !ProductID) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Wishlist/Get?customerId=${userID}`
      );
      if (response.ok) {
        const wishlist = await response.json();
        setIsInWishlist(
          wishlist.some((item: any) => item.productID === ProductID)
        );
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  const fetchProductReviews = async (productId: number) => {
    if (!productId) return [];

    setReviewsLoading(true);
    setReviewError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Product/GetReviews/${productId}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch reviews: ${response.status} - ${response.statusText}`
        );
      }

      const reviews = await response.json();
      const processedReviews = Array.isArray(reviews)
        ? reviews.map((review: any) => ({
            ...review,
            reviewDate: review.reviewDate || new Date().toISOString(),
          }))
        : [];

      return processedReviews;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviewError(
        error instanceof Error ? error.message : "Failed to load reviews"
      );
      return [];
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!ProductID) {
        throw new Error("Product ID is missing");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/Product/GetProductDetails/${ProductID}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const found = await response.json();

      if (!found) {
        throw new Error("Product not found");
      }

      const reviews = await fetchProductReviews(ProductID);
      const averageRating =
        reviews.length > 0
          ? reviews.reduce(
              (sum: number, review: Review) => sum + review.rating,
              0
            ) / reviews.length
          : 0;

      // Updated color handling - map color names to IDs
      const sanitizedColors = (found.colors || [])
        .map((colorName: string) => {
          const lowerColorName = colorName.toLowerCase();
          const colorID = COLOR_NAME_TO_ID[lowerColorName] || 0;
          return {
            productID: ProductID,
            colorID: colorID,
            product: null,
            color: colorName,
          };
        })
        .filter((color: Color) => color.colorID !== 0);

      const availableSizes = (found.sizes || []).map((sizeId: number) => ({
        sizeId,
        sizeName: SIZE_MAP[sizeId] || `Size ${sizeId}`,
      }));

      const images = (found.images || [])
        .map((img: string | { imagePath: string }) => {
          if (typeof img === "object" && img !== null && "imagePath" in img) {
            return `http://localhost:5005${
              img.imagePath.startsWith("/") ? "" : "/"
            }${img.imagePath}`;
          } else if (typeof img === "string") {
            return `http://localhost:5005${
              img.startsWith("/") ? "" : "/"
            }${img}`;
          }
          return "";
        })
        .filter((img: string) => img);

      setProduct({
        id: found.productID,
        name: found.name,
        price: found.price,
        rating: averageRating,
        reviews,
        reviewCount: reviews.length,
        color: sanitizedColors,
        sizes: availableSizes,
        images: images,
        description:
          found.description ||
          "Premium quality product with excellent craftsmanship and attention to detail.",
        Stock: typeof found.stock === "number" ? found.stock : 10,
        categoryName: found.categoryName,
      });

      setSelectedImageIndex(0);
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch product"
      );
    } finally {
      setLoading(false);
    }
  };

  const addProductReview = async (review: {
    productID: number;
    userName: string;
    reviewText: string;
    rating: number;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Product/AddReview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...review,
          reviewDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to add review: ${response.status} - ${errorData}`
        );
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error adding review:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to submit review",
      };
    }
  };

  const updateReviewReaction = async (reviewId: number, isLike: boolean) => {
    setUserReactionLoading((prev) => ({ ...prev, [reviewId]: true }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Product/ReactToReview/${reviewId}?like=${isLike}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update reaction: ${response.status}`);
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error updating reaction:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update reaction",
      };
    } finally {
      setUserReactionLoading((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleSubmitReview = async () => {
    const userID = localStorage.getItem("userID");
    const userName = localStorage.getItem("userName");

    if (!userID) {
      showNotification("warning", "Please login to submit a review");
      return;
    }

    if (!product) return;

    if (!newReviewText.trim()) {
      showNotification("warning", "Please write a review");
      return;
    }

    if (newReviewRating === 0) {
      showNotification("warning", "Please select a rating");
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    const result = await addProductReview({
      productID: product.id,
      userName: userName || `User${userID}`,
      reviewText: newReviewText.trim(),
      rating: newReviewRating,
    });

    if (result.success) {
      showNotification("success", "Review submitted successfully!");
      setNewReviewText("");
      setNewReviewRating(0);

      const reviews = await fetchProductReviews(product.id);
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              reviews,
              reviewCount: reviews.length,
              rating:
                reviews.length > 0
                  ? reviews.reduce(
                      (sum: number, review: Review) => sum + review.rating,
                      0
                    ) / reviews.length
                  : 0,
            }
          : null
      );
    } else {
      setReviewError(result.error || "Failed to submit review");
      showNotification("error", result.error || "Failed to submit review");
    }

    setSubmittingReview(false);
  };

  const handleReactionClick = async (reviewId: number, isLike: boolean) => {
    const result = await updateReviewReaction(reviewId, isLike);

    if (result.success && product) {
      const updatedReviews = await fetchProductReviews(product.id);
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              reviews: updatedReviews,
            }
          : null
      );
    } else {
      showNotification("error", result.error || "Failed to update reaction");
    }
  };

  const handleAddToWishlist = async () => {
    const userID = localStorage.getItem("userID");
    if (!userID || !ProductID) {
      showNotification("warning", "Please login first");
      return;
    }

    setWishlistLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Wishlist/Add?customerId=${userID}&productId=${ProductID}`,
        { method: "POST" }
      );

      if (response.ok) {
        setIsInWishlist(true);
        showNotification("success", "Added to wishlist!");
      } else {
        const errorData = await response.text();
        showNotification("error", `Failed to add to wishlist: ${errorData}`);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      showNotification("error", "Error updating wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async () => {
    const userID = localStorage.getItem("userID");
    if (!userID || !ProductID) return;

    setWishlistLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Wishlist/Remove?customerId=${userID}&productId=${ProductID}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setIsInWishlist(false);
        showNotification("success", "Removed from wishlist!");
      } else {
        const errorData = await response.text();
        showNotification(
          "error",
          `Failed to remove from wishlist: ${errorData}`
        );
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      showNotification("error", "Error updating wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const showNotification = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const validateSelection = () => {
    if (!product) return false;

    if (product.Stock === 0) {
      showNotification("error", "This product is currently out of stock");
      return false;
    }

    if (!selectedColor) {
      showNotification("warning", "Please select a color");
      return false;
    }
    if (!selectedSize.length) {
      showNotification("warning", "Please select a size");
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    const UserID = localStorage.getItem("userID");

    if (!UserID) {
      showNotification("warning", "Please login first");
      return;
    }

    if (!validateSelection() || !product) return;

    setAddingToCart(true);

    const selectedImageObj = product.images?.[selectedImageIndex];
    const selectedImage =
      typeof selectedImageObj === "string"
        ? selectedImageObj
        : selectedImageObj &&
          typeof selectedImageObj === "object" &&
          "path" in selectedImageObj
        ? `http://localhost:5005${(selectedImageObj as { path: string }).path}`
        : "";

    const item = {
      Id: Math.floor(Date.now() % 1000000000),
      UserID: parseInt(UserID) || 0,
      ProductID: product.id,
      Name: product.name,
      ImageUrl: selectedImage,
      Size: selectedSize.join(", "),
      Color: selectedColor ?? "N/A",
      Quantity: quantity,
      Price: product.price,
    };

    try {
      addToLocalCart(item);
      showNotification("success", "Added to cart successfully!");
    } catch (err) {
      console.error("Failed to add to local cart:", err);
      showNotification("error", "Could not add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    const UserID = localStorage.getItem("userID");

    if (!UserID) {
      showNotification("warning", "Please login first");
      return;
    }

    if (!validateSelection() || !product) return;

    const selectedImageObj = product.images?.[selectedImageIndex];
    const selectedImage =
      typeof selectedImageObj === "string"
        ? selectedImageObj
        : selectedImageObj &&
          typeof selectedImageObj === "object" &&
          "path" in selectedImageObj
        ? `http://localhost:5005${(selectedImageObj as { path: string }).path}`
        : "";

    const item = {
      ProductID: product.id,
      Name: product.name,
      ImageUrl: selectedImage,
      Quantity: quantity,
      Price: product.price,
      Size: selectedSize.join(", "),
      Color: selectedColor ?? undefined,
    };

    const subtotal = item.Price * item.Quantity;
    const shipping = subtotal >= 5000 ? 0 : 250;

    navigate("/checkout", {
      state: {
        cartItems: [item],
        subtotal,
        shippingFee: shipping,
        finalTotal: subtotal + shipping,
      },
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleColorSelect = (color: Color) => {
    setSelectedColor(color.color);
    setSelectedColorId(color.colorID);
  };

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setSelectedImageIndex(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  const refreshReviews = async () => {
    if (!product) return;

    const reviews = await fetchProductReviews(product.id);
    setProduct((prev) =>
      prev
        ? {
            ...prev,
            reviews,
            reviewCount: reviews.length,
            rating:
              reviews.length > 0
                ? reviews.reduce(
                    (sum: number, review: Review) => sum + review.rating,
                    0
                  ) / reviews.length
                : 0,
          }
        : null
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-12 h-12 border-3 border-transparent border-t-gray-600 rounded-full animate-spin mx-auto"
              style={{ animationDelay: "0.3s" }}
            ></div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Loading Product
            </h3>
            <p className="text-gray-600 text-sm">Fetching product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              Product Not Found
            </h3>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.scrollTo(0, 0);
              navigate(-1);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-xl backdrop-blur-sm border ${
            notification.type === "success"
              ? "bg-gray-900 text-white border-gray-700"
              : notification.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          } transition-all duration-300 transform animate-pulse`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === "success" && <Check className="w-4 h-4" />}
            {notification.type === "error" && (
              <AlertCircle className="w-4 h-4" />
            )}
            {notification.type === "warning" && <Info className="w-4 h-4" />}
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-24 pb-16">
        {product && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="lg:flex">
              {/* Product Images */}
              <div className="lg:w-1/2 p-6">
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden mb-4 group">
                  {product.images.length > 0 ? (
                    <>
                      <img
                        src={product.images[selectedImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                          >
                            <ChevronLeft className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
                          >
                            <ChevronRight className="w-4 h-4 text-gray-700" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <span className="text-sm font-medium">
                          No Image Available
                        </span>
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
                  <button
                    onClick={
                      isInWishlist
                        ? handleRemoveFromWishlist
                        : handleAddToWishlist
                    }
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
                </div>

                {/* Image Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          selectedImageIndex === index
                            ? "border-gray-900 ring-2 ring-gray-300 scale-105"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="lg:w-1/2 p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                        {product.name}
                      </h1>

                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {product.rating > 0 ? (
                            [...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating)
                                    ? "text-gray-900 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">
                              No ratings yet
                            </span>
                          )}
                        </div>
                        {product.rating > 0 && (
                          <span className="text-gray-600 text-sm">
                            ({product.rating.toFixed(1)}) •{" "}
                            {product.reviewCount} reviews
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      Rs. {product.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                      Description
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Color Selection */}
                  {product.color.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Color:{" "}
                        {selectedColor && (
                          <span className="text-gray-600 font-normal">
                            {selectedColor}
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.color.map((c, idx) => {
                          const colorInfo = COLOR_MAP[c.colorID] || {
                            name: c.color || "Unknown",
                            hex: "#9ca3af",
                          };
                          return (
                            <button
                              key={idx}
                              onClick={() => handleColorSelect(c)}
                              className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                                selectedColor === c.color
                                  ? "border-gray-900 ring-2 ring-gray-300 scale-110"
                                  : "border-gray-300 hover:border-gray-500 hover:scale-105"
                              }`}
                              style={{
                                backgroundColor: colorInfo.hex,
                              }}
                              title={colorInfo.name}
                            >
                              {selectedColor === c.color && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Check className="w-5 h-5 text-white drop-shadow-lg" />
                                </div>
                              )}
                              {colorInfo.hex === "#ffffff" && (
                                <div className="absolute inset-1 border border-gray-400 rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Size:{" "}
                        {selectedSize.length > 0
                          ? selectedSize.join(", ")
                          : "Select Size"}
                      </h3>
                      <button
                        onClick={() => setShowSizeChart(true)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
                      >
                        <Ruler className="w-3 h-3" />
                        <span>Size Chart</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size.sizeId}
                          onClick={() =>
                            setSelectedSize([
                              size.sizeName.replace("Size ", ""),
                            ])
                          }
                          className={`py-2 px-3 border-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            selectedSize[0] ===
                            size.sizeName.replace("Size ", "")
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {size.sizeName.replace("Size ", "")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Quantity
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-2 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-bold border-x-2 border-gray-300 bg-gray-50">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">Total Price</div>
                        <div className="text-lg font-bold text-gray-900">
                          Rs. {(product.price * quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || product.Stock === 0}
                      className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border-2 border-gray-300 hover:border-gray-400"
                    >
                      {addingToCart ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={product.Stock === 0}
                      className="flex items-center justify-center space-x-2 bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Buy Now</span>
                    </button>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Truck className="w-5 h-5 text-gray-700" />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          Free Delivery
                        </div>
                        <div className="text-xs text-gray-600">
                          On orders over Rs. 5,000
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Shield className="w-5 h-5 text-gray-700" />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          Secure Payment
                        </div>
                        <div className="text-xs text-gray-600">
                          100% protected
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <RotateCcw className="w-5 h-5 text-gray-700" />
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          Easy Returns
                        </div>
                        <div className="text-xs text-gray-600">
                          30-day policy
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Customer Reviews</span>
                </h3>
                <button
                  onClick={refreshReviews}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200"
                  disabled={reviewsLoading}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      reviewsLoading ? "animate-spin" : ""
                    }`}
                  />
                  <span>Refresh</span>
                </button>
              </div>

              {reviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 text-sm">Loading reviews...</p>
                  </div>
                </div>
              ) : reviewError ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-red-600 font-medium text-sm">
                    Error loading reviews
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{reviewError}</p>
                  <button
                    onClick={refreshReviews}
                    className="mt-3 text-gray-900 hover:text-gray-700 font-medium text-sm"
                  >
                    Try again
                  </button>
                </div>
              ) : product.reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    No reviews yet. Be the first to review!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div
                      key={review.reviewID}
                      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {review.userName}
                            </h4>
                            <div className="flex items-center space-x-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(review.reviewDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                        {review.reviewText}
                      </p>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() =>
                            handleReactionClick(review.reviewID, true)
                          }
                          disabled={userReactionLoading[review.reviewID]}
                          className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50"
                        >
                          {userReactionLoading[review.reviewID] ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <ThumbsUp className="w-3 h-3" />
                          )}
                          <span className="text-xs">{review.likes}</span>
                        </button>
                        <button
                          onClick={() =>
                            handleReactionClick(review.reviewID, false)
                          }
                          disabled={userReactionLoading[review.reviewID]}
                          className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          <span className="text-xs">{review.dislikes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Write Review */}
              <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-gray-900" />
                  <span>Write a Review</span>
                </h4>

                {reviewError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{reviewError}</span>
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2 text-sm">
                      Your Rating
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className={`w-8 h-8 transition-colors duration-200 ${
                            newReviewRating >= star
                              ? "text-yellow-400"
                              : "text-gray-300 hover:text-yellow-300"
                          }`}
                        >
                          <Star className="w-full h-full fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-900 mb-2 text-sm">
                      Your Review
                    </label>
                    <textarea
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none text-sm"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {newReviewText.length}/500 characters
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSubmitReview}
                    disabled={
                      !newReviewText.trim() ||
                      newReviewRating === 0 ||
                      submittingReview
                    }
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {submittingReview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSizeChart && (
        <SizeChart
          isOpen={showSizeChart}
          onClose={() => setShowSizeChart(false)}
          category={product?.categoryName || ""}
        />
      )}
    </div>
  );
};

export default ProductPage;
