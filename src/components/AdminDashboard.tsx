import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { Wallet } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import {
  Package,
  ShoppingCart,
  Users,
  Loader,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  Stock: number;
  Status: string;
}

interface Order {
  id: number;
  customerName: string;
  mobileNumber: string;
  total: number;
  orderDate: string;
  status: "Pending" | "Processing" | "Delivered" | "Returned";
}

interface Customer {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  changeType?: "increase" | "decrease";
  subtitle?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  change,
  changeType,
  subtitle,
}) => (
  <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-300">
          {icon}
        </div>
        {change && (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
              changeType === "increase"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {changeType === "increase" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const COLORS = [
  "#0f2d57ff",
  "#4286e5ff",
  "#485d7bff",
  "#0246a4ff",
  "#98bae8ff",
  "#f5f5f5",
];

const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      setError(null);

      const [productsRes, ordersRes, customersRes] = await Promise.all([
        axios.get("http://localhost:5005/api/Product/GetAllProducts"),
        axios.get("http://localhost:5005/api/Checkout/GetAllOrders"),
        axios.get("http://localhost:5005/api/Users"),
      ]);

      const formattedProducts = productsRes.data.map((product: any) => ({
        id: product.productID,
        name: product.name,
        price: product.price,
        categoryName: product.categoryName || "Uncategorized",
        Stock: product.stock || 0,
        Status: product.status || "Active",
      }));

      const formattedOrders = ordersRes.data.map((order: any) => ({
        id: order.orderID,
        customerName: order.customerName || "Unknown",
        mobileNumber: order.mobileNumber || "N/A",
        total: order.total || 0,
        orderDate: order.orderDate || new Date().toISOString(),
        status: order.status || "Pending",
      }));

      setProducts(formattedProducts);
      setOrders(formattedOrders);
      setCustomers(customersRes.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(
        "Failed to fetch dashboard data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => fetchData(), 300000);
    return () => clearInterval(intervalId);
  }, []);

  const {
    orderStatusData,
    categoryData,
    orderTrendData,
    stockByCategory,
    totalRevenue,
    revenueGrowth,
    lowStockProducts,
    outOfStockProducts,
  } = useMemo(() => {
    const orderStatusData = [
      {
        name: "Pending",
        value: orders.filter((o) => o.status === "Pending").length,
        color: "#888",
      },
      {
        name: "Processing",
        value: orders.filter((o) => o.status === "Processing").length,
        color: "#555",
      },
      {
        name: "Delivered",
        value: orders.filter((o) => o.status === "Delivered").length,
        color: "#222",
      },
      {
        name: "Returned",
        value: orders.filter((o) => o.status === "Returned").length,
        color: "#aaa",
      },
    ];

    const categories = Array.from(new Set(products.map((p) => p.categoryName)));
    const categoryData = categories.map((category, index) => ({
      name: category,
      value: products.filter((p) => p.categoryName === category).length,
      color: COLORS[index % COLORS.length],
    }));

    const orderTrendData = orders
      .reduce(
        (acc: { date: string; orders: number; revenue: number }[], order) => {
          const date = order.orderDate.split("T")[0];
          const existing = acc.find((item) => item.date === date);
          if (existing) {
            existing.orders++;
            existing.revenue += order.total;
          } else {
            acc.push({ date, orders: 1, revenue: order.total });
          }
          return acc;
        },
        []
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    const stockByCategory = categories.map((category) => {
      const categoryProducts = products.filter(
        (p) => p.categoryName === category
      );
      return {
        category,
        inStock: categoryProducts.filter((p) => p.Stock > 5).length,
        lowStock: categoryProducts.filter((p) => p.Stock > 0 && p.Stock <= 5)
          .length,
        outOfStock: categoryProducts.filter((p) => p.Stock <= 0).length,
      };
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const revenueGrowth = 12.5; // Mock growth percentage
    const lowStockProducts = products.filter(
      (p) => p.Stock <= 5 && p.Stock > 0
    );
    const outOfStockProducts = products.filter((p) => p.Stock <= 0);

    return {
      orderStatusData,
      categoryData,
      orderTrendData,
      stockByCategory,
      totalRevenue,
      revenueGrowth,
      lowStockProducts,
      outOfStockProducts,
    };
  }, [products, orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        )
        .slice(0, 10),
    [orders]
  );

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AdminSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-72"
          } flex items-center justify-center`}
        >
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader className="animate-spin text-6xl text-gray-600 mx-auto" />
              <div className="absolute inset-0 rounded-full bg-gray-200 animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Loading Dashboard
              </h3>
              <p className="text-gray-600">Fetching your latest data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AdminSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-72"
          } flex items-center justify-center p-6`}
        >
          <div className="text-center max-w-md space-y-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Dashboard Error
              </h3>
              <p className="text-gray-600">{error}</p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchData();
              }}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200 shadow hover:shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
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

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        } overflow-y-auto`}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here's what's happening with your store.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Total Products"
              value={products.length.toLocaleString()}
              icon={<Package className="w-6 h-6 text-gray-700" />}
              change={8.2}
              changeType="increase"
              subtitle="Active products"
            />
            <DashboardCard
              title="Total Orders"
              value={orders.length.toLocaleString()}
              icon={<ShoppingCart className="w-6 h-6 text-gray-700" />}
              change={15.3}
              changeType="increase"
              subtitle="All time orders"
            />
            <DashboardCard
              title="Total Revenue"
              value={`Rs. ${totalRevenue.toLocaleString()}`}
              icon={<Wallet className="w-6 h-6 text-gray-700" />}
              change={revenueGrowth}
              changeType="increase"
              subtitle="Total earnings"
            />
            <DashboardCard
              title="Total Customers"
              value={customers.length.toLocaleString()}
              icon={<Users className="w-6 h-6 text-gray-700" />}
              change={5.7}
              changeType="increase"
              subtitle="Registered users"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Status
                  </h3>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#9ca3af" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#9ca3af" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f2d57ff",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#567197ff"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <PieChartIcon className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Product Categories
                  </h3>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#767591ff"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#7695c3ff",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Trends */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Activity className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Revenue Trends
                  </h3>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orderTrendData}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#1156afff"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#435772ff"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#6381bdff" }}
                      axisLine={{ stroke: "#9ca3af" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#92a3c4ff" }}
                      axisLine={{ stroke: "#9ca3af" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#5b7aa3ff",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4b5563"
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stock Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Package className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Stock Status
                  </h3>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 12, fill: "#697ca1ff" }}
                      axisLine={{ stroke: "#9ca3af" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#4d6287ff" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "6px",
                        color: "white",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="inStock"
                      stackId="a"
                      fill="#546681ff"
                      name="In Stock"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="lowStock"
                      stackId="a"
                      fill="#f59e0b"
                      name="Low Stock"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="outOfStock"
                      stackId="a"
                      fill="#ef4444"
                      name="Out of Stock"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Orders
                  </h3>
                </div>

                <Link to="/Orders">
                  <button className="text-gray-700 hover:text-gray-900 font-medium text-sm">
                    View All
                  </button>
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders available.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                          Order ID
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                          Total
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order, index) => (
                        <tr
                          key={order.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">
                            #{order.id}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-700">
                            {order.customerName}
                          </td>
                          <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                            Rs. {order.total.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-700">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === "Delivered"
                                  ? "bg-gray-100 text-gray-800"
                                  : order.status === "Processing"
                                  ? "bg-gray-200 text-gray-800"
                                  : order.status === "Returned"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-300 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Stock Alerts */}
            <div className="space-y-6">
              {/* Low Stock Alert */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Low Stock Alert
                  </h3>
                </div>

                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      All products are well stocked!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {lowStockProducts.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.categoryName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {product.Stock} left
                          </span>
                        </div>
                      </div>
                    ))}
                    {lowStockProducts.length > 5 && (
                      <button className="w-full text-center py-2 text-sm text-gray-700 hover:text-gray-900 font-medium">
                        View {lowStockProducts.length - 5} more
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Out of Stock Alert */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Out of Stock
                  </h3>
                </div>

                {outOfStockProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      No out of stock products
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {outOfStockProducts.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.categoryName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Out of stock
                          </span>
                        </div>
                      </div>
                    ))}
                    {outOfStockProducts.length > 5 && (
                      <button className="w-full text-center py-2 text-sm text-gray-700 hover:text-gray-900 font-medium">
                        View {outOfStockProducts.length - 5} more
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
