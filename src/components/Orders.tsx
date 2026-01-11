import React, { useState, useEffect } from "react";
import {
  Search,
  Save,
  Filter,
  Calendar,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  MoreVertical,
  Edit3,
  Truck,
  User,
  Phone,
  DollarSign,
  RotateCcw,
  CheckSquare,
  Square,
  ChevronDown,
  Zap,
  ArrowRight,
  Target,
  Activity,
  TrendingDown,
  Percent,
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Order {
  id: number;
  customerName: string;
  mobileNumber: string;
  total: number;
  orderDate: string;
  status: "Pending" | "Processing" | "Delivered" | "Returned";
}

interface UpdateResult {
  id: string;
  status: "Pending" | "Processing" | "Delivered" | "Returned";
  success: boolean;
  error?: any;
}

const api = axios.create({
  baseURL: "http://localhost:5005/api/checkout",
  headers: { "Content-Type": "application/json" },
});

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editedStatuses, setEditedStatuses] = useState<
    Record<number, Order["status"]>
  >({});
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<Order["status"]>("Pending");
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [savingBulk, setSavingBulk] = useState(false);
  const [savingIndividual, setSavingIndividual] = useState<
    Record<number, boolean>
  >({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      setError("");

      const { data } = await api.get("/GetAllOrders");
      const formatted: Order[] = data.map((o: any) => ({
        id: o.orderID,
        customerName: o.customerName,
        mobileNumber: o.mobileNumber,
        total: o.total,
        orderDate: new Date(o.orderDate).toLocaleDateString(),
        status: o.status as Order["status"],
      }));

      // Sort so that highest ID (most recent) appears first
      formatted.sort((a: Order, b: Order) => b.id - a.id);
      setOrders(formatted);
    } catch (e) {
      console.error(e);
      setError(
        "Failed to fetch orders. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const handleStatusChange = (id: number, newStatus: Order["status"]) => {
    setEditedStatuses((prev) => ({ ...prev, [id]: newStatus }));
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((order) => order.id)));
    }
  };

  const handleBulkStatusChange = async () => {
    if (selectedOrders.size === 0) {
      toast.warning("Please select orders to update", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setSavingBulk(true);
    let successCount = 0;
    let failCount = 0;

    try {
      console.log(
        `🔄 Bulk updating ${selectedOrders.size} orders to ${bulkStatus}...`
      );

      const results = await Promise.allSettled(
        Array.from(selectedOrders).map((orderId) =>
          api
            .put(
              `/UpdateStatus/${orderId}`,
              {},
              { params: { status: bulkStatus } }
            )
            .then(
              (): UpdateResult => ({
                id: orderId.toString(),
                status: bulkStatus,
                success: true,
              })
            )
            .catch(
              (error): UpdateResult => ({
                id: orderId.toString(),
                status: bulkStatus,
                success: false,
                error,
              })
            )
        )
      );

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const updateResult = result.value;
          if (updateResult.success) {
            successCount++;
            console.log(
              `✅ Successfully updated order ${updateResult.id} to ${updateResult.status}`
            );
          } else {
            failCount++;
            console.error(
              `❌ Failed to update order ${updateResult.id}:`,
              updateResult.error
            );
          }
        } else {
          failCount++;
          console.error("❌ Promise rejected:", result.reason);
        }
      });

      if (successCount > 0) {
        toast.success(
          `Successfully updated ${successCount} order${
            successCount > 1 ? "s" : ""
          } to ${bulkStatus}!`,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }

      if (failCount > 0) {
        toast.error(
          `Failed to update ${failCount} order${
            failCount > 1 ? "s" : ""
          }. Please try again.`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      }

      // Clear selections and refresh data
      setSelectedOrders(new Set());
      setShowBulkActions(false);
      await fetchOrders();
    } catch (error) {
      console.error("❌ Error in bulk update:", error);
      toast.error("Failed to update orders. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setSavingBulk(false);
    }
  };

  const saveStatus = async (orderId: number) => {
    const statusToSave = editedStatuses[orderId];
    setSavingIndividual((prev) => ({ ...prev, [orderId]: true }));

    try {
      console.log(`🔄 Updating order ${orderId} status to: ${statusToSave}`);

      const response = await api.put(
        `/UpdateStatus/${orderId}`,
        {},
        {
          params: { status: statusToSave },
        }
      );

      console.log("✅ Status update response:", response.data);

      toast.success(
        `Order #${orderId} status updated to ${statusToSave} successfully!`,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      setEditedStatuses((prev) => {
        const copy = { ...prev };
        delete copy[orderId];
        return copy;
      });

      // Refresh orders to ensure we have the latest data
      await fetchOrders();
    } catch (error: any) {
      console.error("❌ Error updating status:", error);

      let errorMessage = `Failed to update order #${orderId}. Please try again.`;
      if (error.response?.data) {
        errorMessage = `Failed to update order #${orderId}: ${error.response.data}`;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });

      // Revert the status change in UI
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            // Find the original status from the server
            return { ...o, status: o.status }; // This will be corrected on next fetch
          }
          return o;
        })
      );
    } finally {
      setSavingIndividual((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const saveAllStatuses = async () => {
    const updates = Object.entries(editedStatuses);
    if (updates.length === 0) {
      toast.info("No changes to save", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    setSavingAll(true);
    let successCount = 0;
    let failCount = 0;

    try {
      console.log(`🔄 Updating ${updates.length} order statuses...`);

      const results = await Promise.allSettled(
        updates.map(([id, status]) =>
          api
            .put(`/UpdateStatus/${id}`, {}, { params: { status } })
            .then((): UpdateResult => ({ id, status, success: true }))
            .catch(
              (error): UpdateResult => ({ id, status, success: false, error })
            )
        )
      );

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const updateResult = result.value;
          if (updateResult.success) {
            successCount++;
            console.log(
              `✅ Successfully updated order ${updateResult.id} to ${updateResult.status}`
            );
          } else {
            failCount++;
            console.error(
              `❌ Failed to update order ${updateResult.id}:`,
              updateResult.error
            );
          }
        } else {
          failCount++;
          console.error("❌ Promise rejected:", result.reason);
        }
      });

      if (successCount > 0) {
        toast.success(
          `Successfully updated ${successCount} order${
            successCount > 1 ? "s" : ""
          }!`,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }

      if (failCount > 0) {
        toast.error(
          `Failed to update ${failCount} order${
            failCount > 1 ? "s" : ""
          }. Please try again.`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      }

      setEditedStatuses({});

      // Refresh orders to ensure we have the latest data
      await fetchOrders();
    } catch (error) {
      console.error("❌ Error in batch update:", error);
      toast.error("Failed to update orders. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setSavingAll(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesId =
      searchTerm.trim() === "" ||
      order.id.toString().includes(searchTerm.trim()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || order.status === statusFilter;
    const matchesDate =
      dateFilter === "" ||
      new Date(order.orderDate).toDateString() ===
        new Date(dateFilter).toDateString();
    return matchesId && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Processing":
        return "bg-gray-200 text-gray-800 border-gray-300";
      case "Delivered":
        return "bg-gray-300 text-gray-800 border-gray-400";
      case "Returned":
        return "bg-red-100 text-red-800 border-red-200"; // Kept red for returned status
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-3 h-3 text-gray-600" />;
      case "Processing":
        return <Truck className="w-3 h-3 text-gray-600" />;
      case "Delivered":
        return <CheckCircle className="w-3 h-3 text-gray-600" />;
      case "Returned":
        return <RotateCcw className="w-3 h-3 text-red-600" />; // Kept red for returned icon
      default:
        return <AlertCircle className="w-3 h-3 text-gray-600" />;
    }
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    processing: orders.filter((o) => o.status === "Processing").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    returned: orders.filter((o) => o.status === "Returned").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    deliveredRevenue: orders
      .filter((o) => o.status === "Delivered")
      .reduce((sum, order) => sum + order.total, 0),
    averageOrderValue:
      orders.length > 0
        ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length
        : 0,
  };

  const deliveryRate =
    orderStats.total > 0 ? (orderStats.delivered / orderStats.total) * 100 : 0;
  const returnRate =
    orderStats.total > 0 ? (orderStats.returned / orderStats.total) * 100 : 0;

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
              <RefreshCw className="animate-spin text-6xl text-gray-600 mx-auto" />
              <div className="absolute inset-0 rounded-full bg-gray-200 animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Loading Orders
              </h3>
              <p className="text-gray-600">
                Fetching your latest order data...
              </p>
            </div>
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

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        } bg-gray-50 overflow-y-auto`}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order Management
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and manage all customer orders with bulk operations
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Bulk Actions Toggle */}
              {selectedOrders.size > 0 && (
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow hover:shadow-md"
                >
                  <Zap className="w-4 h-4" />
                  <span>Bulk Actions</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
                    {selectedOrders.size}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showBulkActions ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}

              {/* Save All Button */}
              <button
                onClick={saveAllStatuses}
                disabled={savingAll || Object.keys(editedStatuses).length === 0}
                className="inline-flex items-center space-x-2 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow hover:shadow-md"
              >
                {savingAll ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save All Changes</span>
                {Object.keys(editedStatuses).length > 0 && (
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
                    {Object.keys(editedStatuses).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Bulk Actions Panel */}
          {showBulkActions && selectedOrders.size > 0 && (
            <div className="mt-4 p-4 bg-gray-100 rounded-xl border border-gray-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedOrders.size} order
                      {selectedOrders.size > 1 ? "s" : ""} selected
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Change status to:
                    </span>
                    <select
                      value={bulkStatus}
                      onChange={(e) =>
                        setBulkStatus(e.target.value as Order["status"])
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setSelectedOrders(new Set());
                      setShowBulkActions(false);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkStatusChange}
                    disabled={savingBulk}
                    className="inline-flex items-center space-x-2 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 shadow hover:shadow-md"
                  >
                    {savingBulk ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>
                      Update {selectedOrders.size} Order
                      {selectedOrders.size > 1 ? "s" : ""}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {orderStats.total}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">All time orders</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Package className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Orders
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {orderStats.pending}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Awaiting processing
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Clock className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Processing
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {orderStats.processing}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">In progress</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Truck className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {orderStats.delivered}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Successfully completed
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-gray-700" />
                    <p className="text-sm font-medium text-gray-700">
                      Total Revenue
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    Rs. {orderStats.totalRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <p className="text-xs text-gray-600">All orders combined</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Activity className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>

            {/* Average Order Value Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-gray-700" />
                    <p className="text-sm font-medium text-gray-700">
                      Avg Order Value
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    Rs.{" "}
                    {orderStats.averageOrderValue.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                    <p className="text-xs text-gray-600">Per order average</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Package className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>

            {/* Performance Metrics Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Percent className="w-5 h-5 text-gray-700" />
                    <p className="text-sm font-medium text-gray-700">
                      Success Rate
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {deliveryRate.toFixed(1)}%
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {returnRate > 5 ? (
                        <TrendingDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-gray-600" />
                      )}
                      <p className="text-xs text-gray-600">
                        {returnRate.toFixed(1)}% return rate
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-gray-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Filters & Search
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search - No icon */}
              <input
                type="text"
                placeholder="Search by Order ID or Customer..."
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Status Filter - No icon */}
              <select
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 appearance-none bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Returned">Returned</option>
              </select>

              {/* Date Filter - No icon */}
              <input
                type="date"
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />

              {/* Results Count */}
              <div className="flex items-center justify-center bg-gray-100 rounded-xl p-3 border border-gray-300">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Showing Results
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredOrders.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <Package className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Orders List
                  </h3>
                  {selectedOrders.size > 0 && (
                    <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
                      {selectedOrders.size} selected
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    {filteredOrders.length} of {orders.length} orders
                  </div>
                  {filteredOrders.length > 0 && (
                    <button
                      onClick={handleSelectAll}
                      className="inline-flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      {selectedOrders.size === filteredOrders.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                      <span>
                        {selectedOrders.size === filteredOrders.length
                          ? "Deselect All"
                          : "Select All"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSelectAll}
                          className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                        >
                          {selectedOrders.size === filteredOrders.length &&
                          filteredOrders.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-gray-700" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <span>Select</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-50 transition-colors duration-200 group ${
                          selectedOrders.has(order.id)
                            ? "bg-gray-100 border-l-4 border-gray-500"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSelectOrder(order.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
                          >
                            {selectedOrders.has(order.id) ? (
                              <CheckSquare className="w-4 h-4 text-gray-700" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors duration-200">
                              <Package className="w-4 h-4 text-gray-700" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Order ID #{order.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {order.customerName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {order.mobileNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleStatusChange(
                                    order.id,
                                    e.target.value as Order["status"]
                                  )
                                }
                                className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Returned">Returned</option>
                              </select>
                              <div className="flex items-center">
                                {getStatusIcon(order.status)}
                              </div>
                            </div>
                            {editedStatuses[order.id] && (
                              <div className="flex items-center space-x-1 text-xs text-gray-600">
                                <Edit3 className="w-3 h-3" />
                                <span>Modified - Click Save</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-bold text-gray-900">
                              Rs.{" "}
                              {order.total.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {order.orderDate}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          {editedStatuses[order.id] ? (
                            <button
                              onClick={() => saveStatus(order.id)}
                              disabled={savingIndividual[order.id]}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                              title="Save Status Change"
                            >
                              {savingIndividual[order.id] ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                              <span>Save</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                No changes
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No orders found
                            </h3>
                            <p className="text-gray-500">
                              {searchTerm || statusFilter || dateFilter
                                ? "No orders match your current filter criteria. Try adjusting your filters."
                                : "No orders have been placed yet. Orders will appear here once customers start placing them."}
                            </p>
                          </div>
                          {(searchTerm || statusFilter || dateFilter) && (
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("");
                                setDateFilter("");
                              }}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                            >
                              <Filter className="w-4 h-4" />
                              <span>Clear Filters</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Error</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
