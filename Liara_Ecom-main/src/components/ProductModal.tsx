
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  X,
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
} from "lucide-react";
import { addToCart as addToLocalCart } from "../types/CartItem";
import { COLOR_MAP, SIZE_MAP } from "../types/Product";
import SizeChart from "./SizeChart";

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
  images: string[];
  rating: number;
  sizes: { sizeId: number; sizeName: string }[];
  reviews: Review[];
  reviewCount: number;
  description?: string;
  Stock: number;
  categoryName: string;
}

interface ProductModalProps {
  ProductID?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

const API_BASE_URL = "http://localhost:5005";

const ProductModal: React.FC<ProductModalProps> = ({
  ProductID: propProductID,
  isOpen,
  onClose,
}) => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const ProductID = propProductID || (productId ? parseInt(productId) : null);

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
    if (ProductID && isOpen) {
      fetchProduct();
      checkWishlistStatus();
    }
  }, [ProductID, isOpen]);

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

      const sanitizedColors = (found.colors || []).map(
        (colorName: string, index: number) => ({
          productID: ProductID,
          colorID: index + 1,
          product: null,
          color: colorName,
        })
      );

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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 md:w-[28rem] lg:w-[32rem] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {notification && (
          <div
            className={`absolute top-4 left-4 right-4 z-10 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
              notification.type === "success"
                ? "bg-black text-white"
                : notification.type === "error"
                ? "bg-gray-800 text-white"
                : "bg-gray-600 text-white"
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === "success" && <Check className="w-4 h-4" />}
              {notification.type === "error" && (
                <AlertCircle className="w-4 h-4" />
              )}
              {notification.type === "warning" && <Info className="w-4 h-4" />}
              <span className="font-medium text-sm">
                {notification.message}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <h2 className="text-lg font-semibold text-black">Product Details</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600">Loading product details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">
                    Product not found
                  </h3>
                  <p className="text-gray-500 text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : product ? (
            <div className="pb-4">
              <div className="relative">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.images.length > 0 ? (
                    <>
                      <img
                        src={product.images[selectedImageIndex]} // Remove the duplicate prefix
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
                          >
                            <ChevronLeft className="w-4 h-4 text-black" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
                          >
                            <ChevronRight className="w-4 h-4 text-black" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                        <span className="text-sm">No Image Available</span>
                      </div>
                    </div>
                  )}

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

                  <button
                    onClick={
                      isInWishlist
                        ? handleRemoveFromWishlist
                        : handleAddToWishlist
                    }
                    disabled={wishlistLoading}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors duration-200 disabled:opacity-50"
                  >
                    {wishlistLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Heart
                        className={`w-4 h-4 ${
                          isInWishlist
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    )}
                  </button>
                </div>

                {product.images.length > 1 && (
                  <div className="flex space-x-2 mt-3 px-4 overflow-x-auto pb-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          selectedImageIndex === index
                            ? "border-black ring-2 ring-gray-300"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={img} // Remove the duplicate prefix
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 space-y-6 mt-6">
                <div>
                  <h1 className="text-xl font-bold text-black leading-tight mb-2">
                    {product.name}
                  </h1>

                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      {product.rating > 0 ? (
                        [...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400 fill-current"
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
                    {product.rating > 0 && (
                      <span className="text-sm text-gray-600">
                        ({product.rating.toFixed(1)}) {product.reviewCount}{" "}
                        reviews
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-black">
                      Rs. {product.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-black mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {product.color.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-3">
                      Color:{" "}
                      {selectedColor && (
                        <span className="text-gray-600">{selectedColor}</span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.color.map((c, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleColorSelect(c)}
                          className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                            selectedColor === c.color
                              ? "border-black ring-2 ring-gray-300 scale-110"
                              : "border-gray-300 hover:border-gray-500 hover:scale-105"
                          }`}
                          style={{
                            backgroundColor:
                              COLOR_MAP[c.colorID]?.hex || "#f9fafb",
                          }}
                          title={c.color || "Unknown"}
                        >
                          {selectedColor === c.color && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          )}
                          {COLOR_MAP[c.colorID]?.hex === "#f9fafb" && (
                            <div className="absolute inset-1 border border-gray-300 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

               <div className="space-y-2">
                                   <div className="flex items-center justify-between">
                                     <h3 className="font-semibold text-gray-900 text-sm">
                                       Size:{" "}
                                       {selectedSize.length > 0
                                         ? selectedSize.join(", ")
                                         : "Select Size"}
                                     </h3>
                                     <button
                                       onClick={() => {
                                         console.log("Size chart button clicked"); // Add this for debugging
                                         setShowSizeChart(true);
                                       }}
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

                <div>
                  <h3 className="text-sm font-semibold text-black mb-3">
                    Quantity
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold border-x-2 border-gray-300 bg-gray-50">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-600">
                      Total:{" "}
                      <span className="font-bold text-black">
                        Rs. {(product.price * quantity).toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Truck className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-semibold text-black text-sm">
                        Free Delivery
                      </div>
                      <div className="text-xs text-gray-600">
                        On orders over Rs. 5,000
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-semibold text-black text-sm">
                        Secure Payment
                      </div>
                      <div className="text-xs text-gray-600">
                        100% protected
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-semibold text-black text-sm">
                        Easy Returns
                      </div>
                      <div className="text-xs text-gray-600">30-day policy</div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-black flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>Customer Reviews</span>
                    </h3>
                    <button
                      onClick={refreshReviews}
                      className="flex items-center space-x-1 text-gray-600 hover:text-black text-sm font-medium"
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
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-600 text-sm">
                          Loading reviews...
                        </p>
                      </div>
                    </div>
                  ) : reviewError ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="w-6 h-6 text-gray-600" />
                      </div>
                      <p className="text-gray-600 text-sm font-medium">
                        Error loading reviews
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {reviewError}
                      </p>
                      <button
                        onClick={refreshReviews}
                        className="mt-3 text-black hover:text-gray-600 text-sm font-medium"
                      >
                        Try again
                      </button>
                    </div>
                  ) : product.reviews.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">
                        No reviews yet. Be the first to review!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {product.reviews.map((review) => (
                        <div
                          key={review.reviewID}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-black text-sm">
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
                                {new Date(
                                  review.reviewDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                            {review.reviewText}
                          </p>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() =>
                                handleReactionClick(review.reviewID, true)
                              }
                              disabled={userReactionLoading[review.reviewID]}
                              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-black transition-colors duration-200 disabled:opacity-50"
                            >
                              {userReactionLoading[review.reviewID] &&
                              review.reviewID ? (
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <ThumbsUp className="w-3 h-3" />
                              )}
                              <span>{review.likes}</span>
                            </button>
                            <button
                              onClick={() =>
                                handleReactionClick(review.reviewID, false)
                              }
                              disabled={userReactionLoading[review.reviewID]}
                              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-black transition-colors duration-200 disabled:opacity-50"
                            >
                              {userReactionLoading[review.reviewID] &&
                              !review.reviewID ? (
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <ThumbsDown className="w-3 h-3" />
                              )}
                              <span>{review.dislikes}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-black mb-3 flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>Write a Review</span>
                    </h4>

                    {reviewError && (
                      <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-md">
                        <p className="text-gray-700 text-sm font-medium flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{reviewError}</span>
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Your Rating
                        </label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setNewReviewRating(star)}
                              className={`w-6 h-6 transition-colors duration-200 ${
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
                        <label className="block text-sm font-medium text-black mb-2">
                          Your Review
                        </label>
                        <textarea
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          placeholder="Share your thoughts about this product..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-sm resize-none"
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
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
            </div>
          ) : null}
        </div>

        {product && !loading && !error && (
          <div className="border-t border-gray-200 p-4 bg-white space-y-3 flex-shrink-0">
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

            <button
              onClick={
                isInWishlist ? handleRemoveFromWishlist : handleAddToWishlist
              }
              disabled={wishlistLoading}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                isInWishlist
                  ? "bg-gray-100 border-2 border-gray-300 text-gray-700 hover:bg-gray-200"
                  : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              {wishlistLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Heart
                    className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`}
                  />
                  <span className="text-sm">
                    {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {showSizeChart && (
          <SizeChart
            isOpen={showSizeChart} // Add this line
            onClose={() => setShowSizeChart(false)}
            category={product?.categoryName || ""}
          />
        )}
      </div>
    </>
  );
};

export default ProductModal;