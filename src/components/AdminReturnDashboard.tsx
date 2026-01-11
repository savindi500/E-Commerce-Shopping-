import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import {
  Search,
  Filter,
  Calendar,
  Package,
  User,
  Phone,
  Mail,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  MoreVertical,
  Camera,
  FileText,
  MessageSquare,
  ArrowLeft,
  Save,
  Edit3,
  Trash2,
  Archive,
  Send,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  FiFilter as FilterIcon,
  FiSearch as SearchIcon,
  FiChevronDown as ChevronDownIcon,
  FiCalendar as CalendarIcon,
  FiBarChart2 as ChartBarIcon,
} from "react-icons/fi";
import { FiTag as StatusIcon } from "react-icons/fi";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ReturnRequestModel {
  returnID?: number;
  orderID: number;
  productID?: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  reason: string;
  productCondition: string;
  comment?: string;
  imageUrl?: string;
  status?: string;
  createdAt?: string;
}

interface ProductDto {
  productID: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
}

const returnReasons = {
  defective: "Product is defective or damaged",
  "wrong-item": "Received wrong item",
  "not-as-described": "Item not as described",
  "size-issue": "Size/fit issue",
  "changed-mind": "Changed my mind",
  "quality-issues": "Quality not as expected",
  other: "Other reason",
};

const productConditions = {
  unopened: "Unopened/Unused",
  "opened-unused": "Opened but Unused",
  "lightly-used": "Lightly Used",
  used: "Used",
  damaged: "Damaged",
};

const AdminReturnDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState<ReturnRequestModel[]>([]);
  const [selectedReturn, setSelectedReturn] =
    useState<ReturnRequestModel | null>(null);
  const [orderProducts, setOrderProducts] = useState<ProductDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    fetchReturns();
  }, []);

  useEffect(() => {
    if (selectedReturn?.orderID) {
      fetchOrderProducts(selectedReturn.orderID);
    }
  }, [selectedReturn]);

  const fetchReturns = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);

      const response = await axios.get(
        "http://localhost:5005/api/ReturnRequest/all"
      );
      console.log("Raw return data:", response.data);

      // Process the data to ensure all fields are properly mapped
      const processedReturns = response.data.map((returnItem: any) => ({
        returnID: returnItem.returnID || returnItem.ReturnID,
        orderID: returnItem.orderID || returnItem.OrderID,
        productID: returnItem.productID || returnItem.ProductID,
        fullName: returnItem.fullName || returnItem.FullName || "N/A",
        email: returnItem.email || returnItem.Email || "N/A",
        phoneNumber: returnItem.phoneNumber || returnItem.PhoneNumber || "N/A",
        reason: returnItem.reason || returnItem.Reason || "N/A",
        productCondition:
          returnItem.productCondition || returnItem.ProductCondition || "N/A",
        comment: returnItem.comment || returnItem.Comment,
        imageUrl: returnItem.imageUrl || returnItem.ImageUrl,
        status: returnItem.status || returnItem.Status || "Pending",
        createdAt: returnItem.createdAt || returnItem.CreatedAt,
      }));

      setReturns(processedReturns);
      console.log("Processed returns:", processedReturns);
    } catch (error: any) {
      console.error("Error fetching returns:", error);
      toast.error("Failed to fetch return requests. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const fetchOrderProducts = async (orderId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:5005/api/ReturnRequest/GetProductsByOrder?orderId=${orderId}`
      );
      setOrderProducts(response.data);
    } catch (error) {
      console.error("Error fetching order products:", error);
      setOrderProducts([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "processing":
        return <RefreshCw className="w-4 h-4 text-blue-800" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not available";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDateShort = (dateString: string | undefined) => {
    if (!dateString) return "Not available";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getReasonDisplay = (reason: string) => {
    return (
      returnReasons[reason as keyof typeof returnReasons] ||
      reason ||
      "Not specified"
    );
  };

  const getConditionDisplay = (condition: string) => {
    return (
      productConditions[condition as keyof typeof productConditions] ||
      condition ||
      "Not specified"
    );
  };

  const filteredReturns = returns.filter((returnOrder) => {
    const matchesSearch =
      searchTerm === "" ||
      returnOrder.returnID?.toString().includes(searchTerm.toLowerCase()) ||
      returnOrder.orderID?.toString().includes(searchTerm.toLowerCase()) ||
      returnOrder.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnOrder.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      returnOrder.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesDate =
      dateFilter === "" ||
      (returnOrder.createdAt &&
        new Date(returnOrder.createdAt).toISOString().split("T")[0] ===
          dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  const updateReturnStatus = async (returnId: number, newStatus: string) => {
    setProcessingStatus((prev) => ({ ...prev, [returnId]: true }));

    const processingAlert = toast.info(
      `Processing ${newStatus.toLowerCase()} request...`,
      {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
      }
    );

    try {
      console.log(`🔄 Updating return ${returnId} status to: ${newStatus}`);

      await axios.put(
        `http://localhost:5005/api/ReturnRequest/update-status/${returnId}`,
        JSON.stringify(newStatus),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.dismiss(processingAlert);

      toast.success(
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <div className="font-semibold">Status Updated Successfully!</div>
            <div className="text-sm">
              Return request #{returnId} is now {newStatus.toLowerCase()}
            </div>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      setReturns((prev) =>
        prev.map((ret) =>
          ret.returnID === returnId ? { ...ret, status: newStatus } : ret
        )
      );

      setSelectedReturn(null);
      setAdminNotes("");

      console.log(`✅ Successfully updated return ${returnId} to ${newStatus}`);
    } catch (error: any) {
      console.error("❌ Error updating status:", error);

      toast.dismiss(processingAlert);

      const errorMessage =
        error.response?.data || error.message || "Unknown error occurred";
      toast.error(
        <div className="flex items-center space-x-3">
          <XCircle className="w-5 h-5 text-red-600" />
          <div>
            <div className="font-semibold">Update Failed</div>
            <div className="text-sm">
              Failed to update return #{returnId}: {errorMessage}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Please try again or contact support
            </div>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setProcessingStatus((prev) => ({ ...prev, [returnId]: false }));
    }
  };

  const returnStats = {
    total: returns.length,
    pending: returns.filter((r) => r.status?.toLowerCase() === "pending")
      .length,
    approved: returns.filter((r) => r.status?.toLowerCase() === "approved")
      .length,
    rejected: returns.filter((r) => r.status?.toLowerCase() === "rejected")
      .length,
    processing: returns.filter((r) => r.status?.toLowerCase() === "processing")
      .length,
    completed: returns.filter((r) => r.status?.toLowerCase() === "completed")
      .length,
  };

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
                Loading Return Requests
              </h3>
              <p className="text-gray-600">
                Fetching your latest return data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedReturn) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />

        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-72"
          } bg-gray-50`}
        >
          <ToastContainer />

          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedReturn(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Return Request Details
                  </h1>
                  <p className="text-gray-600">
                    Review and process return request #{selectedReturn.returnID}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(
                    selectedReturn.status || "pending"
                  )}`}
                >
                  {getStatusIcon(selectedReturn.status || "pending")}
                  <span className="capitalize">
                    {selectedReturn.status || "Pending"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-indigo-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Full Name
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedReturn.fullName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Email
                      </label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">
                          {selectedReturn.email || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone
                      </label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900">
                          {selectedReturn.phoneNumber || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Order ID
                      </label>
                      <p className="text-gray-900 font-medium">
                        {selectedReturn.orderID}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-amber-600" />
                    Return Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Return Reason
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {getReasonDisplay(selectedReturn.reason)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Product Condition
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {getConditionDisplay(selectedReturn.productCondition)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Submitted Date
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {formatDate(selectedReturn.createdAt)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Return ID
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {selectedReturn.returnID}
                        </p>
                      </div>
                    </div>

                    {selectedReturn.comment && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Customer Comments
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {selectedReturn.comment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Products */}
                {orderProducts.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Package className="w-5 h-5 mr-2 text-purple-600" />
                      Products in this Order
                    </h3>
                    <div className="space-y-3">
                      {orderProducts.map((product) => (
                        <div
                          key={product.productID}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Product ID: #{product.productID}
                            </p>
                            {product.description && (
                              <p className="text-sm text-gray-500">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {product.price}
                            </p>
                            <p className="text-sm text-gray-600">
                              Stock: {product.stock}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {selectedReturn.imageUrl && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Camera className="w-5 h-5 mr-2 text-green-600" />
                      Product Photos
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="relative group">
                        <img
                          src={`http://localhost:5005${selectedReturn.imageUrl}`}
                          alt="Return product"
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
                          }}
                        />
                        <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                          Product Image
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Panel */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                    Process Return
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          updateReturnStatus(
                            selectedReturn.returnID!,
                            "Approved"
                          )
                        }
                        disabled={processingStatus[selectedReturn.returnID!]}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {processingStatus[selectedReturn.returnID!] ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() =>
                          updateReturnStatus(
                            selectedReturn.returnID!,
                            "Rejected"
                          )
                        }
                        disabled={processingStatus[selectedReturn.returnID!]}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {processingStatus[selectedReturn.returnID!] ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>Reject</span>
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        updateReturnStatus(
                          selectedReturn.returnID!,
                          "completed"
                        )
                      }
                      disabled={processingStatus[selectedReturn.returnID!]}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {processingStatus[selectedReturn.returnID!] ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>Completed</span>
                    </button>
                    <button
                      onClick={() =>
                        updateReturnStatus(
                          selectedReturn.returnID!,
                          "Processing"
                        )
                      }
                      disabled={processingStatus[selectedReturn.returnID!]}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {processingStatus[selectedReturn.returnID!] ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>Mark as Processing</span>
                    </button>
                  </div>
                </div>

                {/* Return Timeline */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                    Timeline
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Return Submitted
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(selectedReturn.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-600">Under Review</p>
                        <p className="text-xs text-gray-500">
                          Current status: {selectedReturn.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        } bg-gray-50`}
      >
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

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Return Management
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and process customer return requests
              </p>
            </div>

            <div className="flex items-center space-x-4">
              
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Returns
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {returnStats.total}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {returnStats.pending}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {returnStats.approved}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">
                    {returnStats.rejected}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Processing
                  </p>
                  <p className="text-3xl font-bold text-blue-800">
                    {returnStats.processing}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <RefreshCw className="w-6 h-6 text-blue-800" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {returnStats.completed}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Archive className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                {/* Simple filter icon - replace with your actual icon component */}
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Filters & Search
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input - No icon */}
              <input
                type="text"
                placeholder="Search returns..."
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Status Dropdown - No icon */}
              <select
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 appearance-none bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
              </select>

              {/* Date Picker - No icon */}
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
              />

              {/* Results Count - Simple version */}
              <div className="flex items-center justify-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-indigo-700">Results</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {filteredReturns.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Returns Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Return Requests
                  </h3>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredReturns.length} of {returns.length} returns
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Return Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Reason & Condition
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReturns.length > 0 ? (
                    filteredReturns.map((returnOrder) => (
                      <tr
                        key={returnOrder.returnID}
                        className="hover:bg-gray-50 transition-colors duration-200 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors duration-200">
                              <Package className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Return {returnOrder.returnID}
                              </div>
                              <div className="text-xs text-gray-500">
                                Order: {returnOrder.orderID}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {returnOrder.fullName || "Not provided"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {returnOrder.email || "Not provided"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {returnOrder.phoneNumber || "Not provided"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              <strong>Reason:</strong>{" "}
                              {getReasonDisplay(returnOrder.reason)}
                            </div>
                            <div className="text-sm text-gray-600">
                              <strong>Condition:</strong>{" "}
                              {getConditionDisplay(
                                returnOrder.productCondition
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border ${getStatusColor(
                              returnOrder.status || "pending"
                            )}`}
                          >
                            {getStatusIcon(returnOrder.status || "pending")}
                            <span className="capitalize">
                              {returnOrder.status || "Pending"}
                            </span>
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDateShort(returnOrder.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {returnOrder.createdAt
                              ? new Date(
                                  returnOrder.createdAt
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Time not available"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setSelectedReturn(returnOrder)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No return requests found
                            </h3>
                            <p className="text-gray-500">
                              {searchTerm ||
                              statusFilter !== "All" ||
                              dateFilter
                                ? "No returns match your current filter criteria. Try adjusting your filters."
                                : "No return requests have been submitted yet."}
                            </p>
                          </div>
                          {(searchTerm ||
                            statusFilter !== "All" ||
                            dateFilter) && (
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("All");
                                setDateFilter("");
                              }}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
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
        </div>
      </div>
    </div>
  );
};

export default AdminReturnDashboard;
