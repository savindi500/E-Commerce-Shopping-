import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Layers,
  LogOut,
  ChevronRight,
  Settings,
  Bell,
  User,
  Menu,
  X,
  Activity,
  TrendingUp,
  BarChart3,
  Crown,
  Sparkles,
  Mail,
  Shield,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: number;
  color: string;
  description: string;
}

interface UserInfo {
  email: string;
  name: string;
  role: string;
  userId?: string;
}

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(3);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    email: "admin@liyara.com",
    name: "Admin User",
    role: "Super Admin",
  });

  // Use external collapsed state if provided, otherwise use internal state
  const isCollapsed =
    externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const allMenuItems: MenuItem[] = [
    {
      id: "dashboard",
      name: "Dashboard",
      path: "/Admindashboard",
      icon: LayoutDashboard,
      color: "from-gray-700 to-gray-800",
      description: "Overview & Analytics",
    },
    {
      id: "products",
      name: "Products",
      path: "/Product",
      icon: Package,
      color: "from-gray-600 to-gray-700",
      description: "Manage Inventory",
    },
    {
      id: "orders",
      name: "Orders",
      path: "/Orders",
      icon: ShoppingCart,
      color: "from-gray-500 to-gray-600",
      description: "Order Management",
    },
    {
      id: "users",
      name: "Users",
      path: "/UserManagement",
      icon: Users,
      color: "from-gray-800 to-gray-900",
      description: "User Management",
    },
    {
      id: "categories",
      name: "Categories",
      path: "/Category",
      icon: Layers,
      color: "from-gray-400 to-gray-500",
      description: "Product Categories",
    },
    {
      id: "return",
      name: "Return",
      path: "/AdminReturnDashboard",
      icon: Package,
      color: "from-gray-600 to-gray-700",
      description: "Return Management",
    },
  ];

  // Only show products and categories to staff
  const menuItems: MenuItem[] =
    userInfo.role === "Staff"
      ? allMenuItems.filter((item) =>
          ["products", "categories"].includes(item.id)
        )
      : allMenuItems;

  // Function to decode JWT token and extract user info
  const decodeToken = (token: string): UserInfo | null => {
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      // Add padding if needed for base64 decoding
      const paddedPayload =
        payload + "=".repeat((4 - (payload.length % 4)) % 4);
      const decodedPayload = atob(
        paddedPayload.replace(/-/g, "+").replace(/_/g, "/")
      );
      const parsedPayload = JSON.parse(decodedPayload);

      // Extract user information from token
      // Common JWT claims: email, sub (user ID), name, role, etc.
      return {
        email:
          parsedPayload.email ||
          parsedPayload.Email ||
          parsedPayload.unique_name ||
          "admin@liyara.com",
        name:
          parsedPayload.name ||
          parsedPayload.Name ||
          parsedPayload.given_name ||
          "Admin User",
        role: (
          parsedPayload.role ||
          parsedPayload.Role ||
          parsedPayload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] ||
          "Admin"
        )
          .toString()
          .toLowerCase()
          .replace(/^\w/, (c: string) => c.toUpperCase()),
        userId:
          parsedPayload.sub ||
          parsedPayload.Sub ||
          parsedPayload.nameid ||
          parsedPayload.NameId,
      };
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Load user info from token on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUserInfo(decoded);
      }
    }
  }, []);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  };

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to logout?");

    if (confirmed) {
      // Clear all stored data
      localStorage.removeItem("token");
      localStorage.removeItem("cart");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userID");

      // Navigate to login page
      navigate("/login");
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Get user initials for avatar
  const getUserInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Custom CSS for animations */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          
          @keyframes glow {
            0%, 100% {
              box-shadow: 0 0 5px rgba(107, 114, 128, 0.3);
            }
            50% {
              box-shadow: 0 0 20px rgba(107, 114, 128, 0.6);
            }
          }
          
          .animate-slide-in {
            animation: slideIn 0.3s ease-out forwards;
          }
          
          .animate-pulse-gentle {
            animation: pulse 2s ease-in-out infinite;
          }
          
          .animate-glow {
            animation: glow 2s ease-in-out infinite;
          }
        `}
      </style>

      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-2xl z-50 transition-all duration-300 ease-out ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="animate-slide-in">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center animate-glow">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                      
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {userInfo.role === "Admin"
                        ? "Liyara Admin"
                        : userInfo.role === "Staff"
                        ? "Liyara Staff"
                        : "Liyara"}
                    </h2>
                    <p className="text-xs text-white/80">
                      {userInfo.role === "Admin"
                        ? "Management Portal"
                        : userInfo.role === "Staff"
                        ? "Limited Access Portal"
                        : "Dashboard"}
                    </p>
                  </div>
                </div>
              </div>
            )}
{/* 
            <button
              onClick={handleToggleCollapse}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5 text-white" />
              ) : (
                <X className="w-5 h-5 text-white" />
              )}
            </button> */}
          </div>

          {/* Admin Profile - Collapsed State */}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <div
                key={item.id}
                className="animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link
                  to={item.path}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`group relative flex items-center p-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}

                  {/* Icon */}
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-white/20 backdrop-blur-sm"
                        : "group-hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-all duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-700"
                      }`}
                    />

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse-gentle">
                        {item.badge > 99 ? "99+" : item.badge}
                      </div>
                    )}
                  </div>

                  {/* Label and Description */}
                  {!isCollapsed && (
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold transition-colors duration-300 ${
                            isActive
                              ? "text-white"
                              : "text-gray-700 group-hover:text-gray-900"
                          }`}
                        >
                          {item.name}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition-all duration-300 ${
                            isActive
                              ? "text-white/80 transform translate-x-1"
                              : "text-gray-400 group-hover:text-gray-600 group-hover:transform group-hover:translate-x-1"
                          }`}
                        />
                      </div>
                      <p
                        className={`text-xs mt-0.5 transition-colors duration-300 ${
                          isActive ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Hover Tooltip for Collapsed State */}
                  {isCollapsed && hoveredItem === item.id && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-300">
                        {item.description}
                      </div>
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}

                  {/* Glow Effect for Active Item */}
                  {isActive && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20 rounded-xl blur-xl`}
                    ></div>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {/* {isCollapsed && (
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  {getUserInitials(userInfo.name)}
                </div>
              </div>
            </div>
          )} */}

          {/* User Profile - Expanded State
          {!isCollapsed && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center space-x-3 animate-slide-in">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-lg text-white font-bold text-sm">
                    {getUserInitials(userInfo.name)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{userInfo.name}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-xs text-gray-600 font-medium">Online</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600 font-medium">{userInfo.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`group flex items-center w-full p-3 rounded-xl transition-all duration-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-2 border-transparent hover:border-gray-200 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg group-hover:bg-gray-200 transition-colors duration-300">
              <LogOut className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="ml-3 flex-1 text-left">
                <span className="font-semibold">Logout</span>
                <p className="text-xs text-gray-500">Sign out of admin panel</p>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleToggleCollapse}
        />
      )}
    </>
  );
};

export default AdminSidebar;
