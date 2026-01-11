import React, { useState, useEffect, KeyboardEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Search,
  LogOut,
  Heart,
  ChevronDown,
  Package,
  Truck,
  RotateCcw,
  MapPin,
  AlertCircle,
  Loader2,
  Home,
  Star,
  Info,
  Box,
  Sparkles,
  Clock,
  ArrowRight,
  Settings,
} from "lucide-react";
import { getCart } from "../types/CartItem";

interface NavbarProps {
  wishlistCount?: number;
}

interface SubCategory {
  id: number;
  name: string;
  states: string;
}

interface Category {
  id: number;
  name: string;
  states: string;
  subCategories?: SubCategory[];
}

interface NavItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  subcategories?: {
    name: string;
    value: string;
    path: string;
  }[];
}

interface OrderMenuItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
}

interface SearchResult {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

const API_BASE_URL = "http://localhost:5005";

const Navbar: React.FC<NavbarProps> = ({
  wishlistCount: propWishlistCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(propWishlistCount || 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");
  const userID = localStorage.getItem("userID");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/Categories`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch categories: ${response.status} ${response.statusText}`
        );
      }

      const categoriesData = await response.json();

      if (!Array.isArray(categoriesData)) {
        throw new Error("Categories data is not an array");
      }

      const activeCategories = categoriesData
        .filter((category: any) => category.states === "A")
        .map((category: any) => ({
          id: category.categoryID || category.id,
          name: category.categoryName || category.name,
          states: category.states,
          subCategories: category.subCategories
            ? category.subCategories.filter((sub: any) => sub.states === "A")
            : [],
        }));

      setCategories(activeCategories);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch categories"
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!userID) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/User/${userID}`);
      if (response.ok) {
        const data = await response.json();
        setUserData({
          id: data.id,
          name: data.name || data.email.split("@")[0],
          email: data.email,
          profileImage: data.profileImage,
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const searchProducts = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/Product/Search?keyword=${encodeURIComponent(
          keyword
        )}`
      );

      if (response.ok) {
        const results = await response.json();
        setSearchResults(Array.isArray(results) ? results.slice(0, 6) : []);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProducts(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchWishlistCount = async () => {
    if (!userID) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Wishlist/Get?customerId=${userID}`
      );
      if (response.ok) {
        const wishlist = await response.json();
        setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
      }
    } catch (error) {
      setWishlistCount(0);
    }
  };

  const updateCount = () => {
    const items = getCart() || [];
    const totalQty = items.reduce((sum, i) => sum + i.Quantity, 0);
    setCartCount(totalQty);
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => {
      if (!prev) {
        setSearchQuery("");
        setSearchResults([]);
        setShowSearchResults(false);
      }
      return !prev;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed.length > 0) {
      navigate(`/search?query=${encodeURIComponent(trimmed)}`);
      setSearchQuery("");
      setIsSearchOpen(false);
      setShowSearchResults(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit(e as unknown as React.FormEvent);
    } else if (e.key === "Escape") {
      setShowSearchResults(false);
      setIsSearchOpen(false);
    }
  };

  const handleSearchResultClick = (productId: number) => {
    navigate(`/product/${productId}`);
    setSearchQuery("");
    setIsSearchOpen(false);
    setShowSearchResults(false);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!userID) {
      alert("Please login to view your wishlist");
      navigate("/login");
      return;
    }
    navigate("/WishlistPage");
  };

  const handleOrderMenuClick = (path: string) => {
    if (!isLoggedIn) {
      alert("Please login to access order management");
      navigate("/login");
      return;
    }
    navigate(path);
    setOrderDropdownOpen(false);
    setActiveDropdown(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userID");
    setCartCount(0);
    setWishlistCount(0);
    setUserData(null);
    navigate("/Home");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleOrderDropdownToggle = () => {
    setOrderDropdownOpen(!orderDropdownOpen);
    setActiveDropdown(orderDropdownOpen ? null : "orders");
    setUserDropdownOpen(false);
  };

  const handleUserDropdownToggle = () => {
    setUserDropdownOpen(!userDropdownOpen);
    setOrderDropdownOpen(false);
    setActiveDropdown(null);
  };

  const createNavItemsFromCategories = (): NavItem[] => {
    const staticItems: NavItem[] = [
      { id: "Home", name: "Home", icon: <Home className="w-4 h-4" /> },
      {
        id: "NewArrivals",
        name: "New Arrivals",
        icon: <Star className="w-4 h-4" />,
      },
    ];

    let dynamicItems: NavItem[] = [];

    if (!loading && !error && categories.length > 0) {
      dynamicItems = categories.map((category) => {
        const safeId =
          category.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") ||
          `category_${category.id}`;

        const subcategories =
          category.subCategories?.map((sub) => ({
            name: sub.name,
            value: sub.id.toString(),
            path: `/${safeId}?subcategory=${
              sub.id
            }&subcategoryName=${encodeURIComponent(sub.name)}`,
          })) || [];

        return {
          id: safeId,
          name: category.name.toLowerCase(),
          icon: <Box className="w-4 h-4" />,
          subcategories: subcategories,
        };
      });
    }

    const endItems: NavItem[] = [
      { id: "AboutUs", name: "About Us", icon: <Info className="w-4 h-4" /> },
    ];

    return [...staticItems, ...dynamicItems, ...endItems];
  };

  const navItems = createNavItemsFromCategories();

  const orderMenuItems: OrderMenuItem[] = [
    {
      id: "track-orders",
      name: "Track Orders",
      description: "Monitor your order status and delivery",
      icon: Truck,
      path: "/OrderDisplay/:orderId",
      color: "from-blue-500 to-blue-800",
    },
    {
      id: "return-order",
      name: "Return Order",
      description: "Initiate a return for your purchase",
      icon: RotateCcw,
      path: "/ReturnOrderForm",
      color: "from-orange-500 to-orange-600",
    },
    {
      id: "return-tracking",
      name: "Return Tracking",
      description: "Track your return request status",
      icon: MapPin,
      path: "/track-returns",
      color: "from-purple-500 to-purple-600",
    },
  ];

  useEffect(() => {
    fetchCategories();
    updateCount();
    fetchWishlistCount();
    if (userID) fetchUserData();

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("storage", updateCount);
    window.addEventListener("cartUpdated", updateCount);
    window.addEventListener("wishlistUpdated", fetchWishlistCount);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("cartUpdated", updateCount);
      window.removeEventListener("wishlistUpdated", fetchWishlistCount);
    };
  }, []);

  useEffect(() => {
    updateCount();
    fetchWishlistCount();
    if (userID) fetchUserData();
  }, [userID]);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setOrderDropdownOpen(false);
    setUserDropdownOpen(false);
    setShowSearchResults(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".search-container") &&
        !target.closest(".dropdown-container")
      ) {
        setShowSearchResults(false);
        setActiveDropdown(null);
        setOrderDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Single Header Section with Brand and Navigation */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-black/95 backdrop-blur-md shadow-sm" : "bg-black"
        }`}
      >
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between py-6">
            {/* Left - Brand Logo */}
            <div className="flex items-center">
              <Link
                to="/Home"
                className="group flex items-center space-x-2 transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl font-bold tracking-tight flex items-center space-x-1">
                  <span className="text-white">Liyara</span>
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
              </Link>
            </div>

            {/* Center - Navigation Menu */}
            <div className="hidden md:flex items-center justify-center flex-1">
              {loading ? (
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="text-white text-sm">Loading...</span>
                </div>
              ) : error ? (
                <div className="flex items-center space-x-3 text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Navigation unavailable</span>
                </div>
              ) : (
                <ul className="flex items-center space-x-8">
                  {navItems.map((item) => (
                    <li
                      key={item.id}
                      className="relative group dropdown-container"
                    >
                      {item.subcategories && item.subcategories.length > 0 ? (
                        <div className="relative">
                          <button
                            onClick={() => {
                              if (activeDropdown === item.id) {
                                setActiveDropdown(null);
                              } else {
                                setActiveDropdown(item.id);
                              }
                            }}
                            className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-all duration-300 ${
                              location.pathname.includes(item.id)
                                ? "text-blue-800"
                                : "text-white hover:text-gray-300"
                            }`}
                          >
                            <span className="capitalize">{item.name}</span>
                            <ChevronDown
                              className={`w-3 h-3 ml-1 transition-transform duration-300 ${
                                activeDropdown === item.id ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {activeDropdown === item.id && (
                            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200/80 py-2 z-50 animate-in fade-in-80 zoom-in-95">
                              <Link
                                to={`/${item.id}?category=${
                                  categories.find(
                                    (c) =>
                                      c.name
                                        .toLowerCase()
                                        .replace(/[^a-zA-Z0-9]/g, "") ===
                                      item.id
                                  )?.id
                                }`}
                                className="flex items-center px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium border-b border-gray-100 group"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <span className="group-hover:translate-x-1 transition-transform duration-200">
                                  All {item.name}
                                </span>
                                <ArrowRight className="ml-2 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              </Link>
                              {item.subcategories.map((sub) => (
                                <Link
                                  key={sub.value}
                                  to={sub.path}
                                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                                    {sub.name}
                                  </span>
                                  <ChevronDown className="ml-2 w-3 h-3 transform -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={`/${item.id}`}
                          className={`block px-3 py-2 text-sm font-medium transition-all duration-300 ${
                            location.pathname.includes(item.id)
                              ? "text-blue-800"
                              : "text-white hover:text-gray-300"
                          }`}
                        >
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right - User Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Search Icon */}
              <button
                onClick={toggleSearch}
                className="p-2 rounded-full transition-all duration-300 hover:bg-gray-800"
              >
                <Search className="h-5 w-5 text-white" />
              </button>

              {!isLoggedIn ? (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-lg font-medium transition-all duration-300 hover:bg-gray-200"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleWishlistClick}
                    className="relative p-2 rounded-full transition-all duration-300 hover:bg-gray-800"
                  >
                    <Heart className="h-5 w-5 text-white hover:text-rose-300" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-rose-500 rounded-full">
                        {wishlistCount > 9 ? "9+" : wishlistCount}
                      </span>
                    )}
                  </button>

                  <Link
                    to="/CartPage"
                    className="relative p-2 rounded-full transition-all duration-300 hover:bg-gray-800"
                  >
                    <ShoppingBag className="h-5 w-5 text-white hover:text-blue-800" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Order Management Dropdown */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={handleOrderDropdownToggle}
                      className="group relative p-2 rounded-full transition-all duration-300 hover:bg-gray-800"
                    >
                      <Truck className="h-5 w-5 text-white group-hover:text-green-500" />
                    </button>

                    {orderDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200/80 py-2 z-50 animate-in fade-in-80 zoom-in-95">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                            <Truck className="w-4 h-4 mr-2 text-blue-600" />
                            Order Management
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-1 p-2">
                          {orderMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleOrderMenuClick(item.path)}
                                className="w-full flex items-center space-x-3 px-3 py-3 text-left hover:bg-gray-50 transition-all duration-200 group rounded-lg"
                              >
                                <div
                                  className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white shadow-sm group-hover:shadow-md transition-shadow`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                                    {item.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                                    {item.description}
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 translate-x-0 group-hover:translate-x-1 transition-all" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Dropdown */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={handleUserDropdownToggle}
                      className="flex items-center space-x-1 p-1 rounded-full transition-all duration-300 hover:bg-gray-800"
                    >
                      {userData?.profileImage ? (
                        <img
                          src={userData.profileImage}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <ChevronDown
                        className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${
                          userDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200/80 py-2 z-50 animate-in fade-in-80 zoom-in-95">
                        {userData && (
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {userData.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {userData.email}
                            </div>
                          </div>
                        )}
                       
                        <button
                          onClick={() => {
                            handleLogout();
                            setUserDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group"
                        >
                          <LogOut className="w-4 h-4 mr-2 text-red-500" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg focus:outline-none transition-all duration-300 hover:bg-gray-800"
              >
                {isOpen ? (
                  <X className="h-6 w-6 text-white" />
                ) : (
                  <Menu className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Search Overlay - appears when search icon is clicked */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-md py-4 px-6 sm:px-8 lg:px-12 z-40">
              <div className="relative search-container max-w-2xl mx-auto">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-white border rounded-lg px-4 py-3"
                >
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 outline-none text-black text-lg"
                    autoFocus
                  />
                  <button type="submit" className="ml-2">
                    <Search className="w-6 h-6 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="ml-2 p-1"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </form>

                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-2xl">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center p-4 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleSearchResultClick(product.id)}
                      >
                        <div>
                          <p className="text-base font-medium text-black">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Rs. {product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-black shadow-2xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="text-2xl font-bold flex items-center space-x-1">
                  <span className="text-white">Liyara</span>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-800"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {/* Mobile Search */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <div key={item.id}>
                        {item.subcategories && item.subcategories.length > 0 ? (
                          <div>
                            <button
                              onClick={() => {
                                if (activeDropdown === item.id) {
                                  setActiveDropdown(null);
                                } else {
                                  setActiveDropdown(item.id);
                                }
                              }}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                                location.pathname.includes(item.id)
                                  ? "bg-gray-800 text-blue-400"
                                  : "text-white hover:bg-gray-800"
                              }`}
                            >
                              <span>{item.name}</span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${
                                  activeDropdown === item.id ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {activeDropdown === item.id && (
                              <div className="mt-1 ml-4 space-y-1 bg-gray-800/50 rounded-lg p-2 animate-in fade-in-50">
                                <Link
                                  to={`/${item.id}?category=${
                                    categories.find(
                                      (c) =>
                                        c.name
                                          .toLowerCase()
                                          .replace(/[^a-zA-Z0-9]/g, "") ===
                                        item.id
                                    )?.id
                                  }`}
                                  className="flex items-center px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium group"
                                  onClick={() => {
                                    setIsOpen(false);
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                                    All {item.name}
                                  </span>
                                </Link>
                                {item.subcategories.map((sub) => (
                                  <Link
                                    key={sub.value}
                                    to={sub.path}
                                    className="flex items-center px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                                    onClick={() => {
                                      setIsOpen(false);
                                      setActiveDropdown(null);
                                    }}
                                  >
                                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                                      {sub.name}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            to={`/${item.id}`}
                            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                              location.pathname.includes(item.id)
                                ? "bg-gray-800 text-blue-400"
                                : "text-white hover:bg-gray-800"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-700">
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    className="flex items-center justify-center space-x-2 w-full py-3 bg-white text-black rounded-lg font-medium transition-all duration-300 hover:bg-gray-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Sign In</span>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 mb-4">
                      {userData?.profileImage ? (
                        <img
                          src={userData.profileImage}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                          {userData?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {userData?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {userData?.email || ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={(e) => {
                          handleWishlistClick(e);
                          setIsOpen(false);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gray-800 rounded-lg font-medium text-white hover:bg-gray-700 transition-all duration-300"
                      >
                        <Heart className="h-5 w-5" />
                        <span>Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="ml-1 px-2 py-1 text-xs bg-rose-500 text-white rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </button>
                      <Link
                        to="/CartPage"
                        className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gray-800 rounded-lg font-medium text-white hover:bg-gray-700 transition-all duration-300"
                        onClick={() => setIsOpen(false)}
                      >
                        <ShoppingBag className="h-5 w-5" />
                        <span>Cart</span>
                        {cartCount > 0 && (
                          <span className="ml-1 px-2 py-1 text-xs bg-blue-800 text-white rounded-full">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    </div>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-red-900 text-red-300 rounded-lg font-medium hover:bg-red-800 transition-all duration-300"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
