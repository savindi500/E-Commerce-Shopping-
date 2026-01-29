import React, { useState, useEffect } from "react";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Truck,
  ArrowRight,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Eye,
  Download,
  MessageSquare,
  Star,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Shield,
  Image as ImageIcon,
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ReturnTrackingData {
  returnID: number;
  orderID: number;
  productID: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  reason: string;
  productCondition: string;
  comment?: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
}

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "pending";
  date?: string;
  icon: React.ReactNode;
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

const ReturnOrderTracking: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [email, setEmail] = useState("");
  const [returnData, setReturnData] = useState<ReturnTrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    details: true,
    timeline: true,
  });

  const [allReturns, setAllReturns] = useState<ReturnTrackingData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAllReturns, setShowAllReturns] = useState(false);
  const [loadingAllReturns, setLoadingAllReturns] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      setEmail(userEmail);
    }
    fetchAllReturns();
  }, []);
useEffect(() => {
  // Scroll to top when component mounts or route changes
  window.scrollTo(0, 0);
}, [location.pathname, location.search]); 
  const fetchAllReturns = async () => {
    setLoadingAllReturns(true);
    try {
      const response = await axios.get(
        "http://localhost:5005/api/ReturnRequest/all",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setAllReturns(response.data);
    } catch (error: any) {
      console.error("Error fetching returns:", error);
      toast.error("Failed to fetch return requests. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingAllReturns(false);
    }
  };

  const getTrackingSteps = (
    status: string,
    createdAt: string
  ): TrackingStep[] => {
    const baseSteps: TrackingStep[] = [
      {
        id: "submitted",
        title: "Return Request Submitted",
        description:
          "Your return request has been received and is being processed",
        status: "completed",
        date: createdAt,
        icon: <FileText className="w-5 h-5" />,
      },
      {
        id: "review",
        title: "Under Review",
        description:
          "Our team is reviewing your return request and documentation",
        status: status === "Pending" ? "current" : "completed",
        date: status !== "Pending" ? createdAt : undefined,
        icon: <Eye className="w-5 h-5" />,
      },
    ];

    if (status === "Rejected") {
      baseSteps.push({
        id: "rejected",
        title: "Request Rejected",
        description:
          "Your return request has been rejected. Please contact support for details.",
        status: "completed",
        date: createdAt,
        icon: <XCircle className="w-5 h-5" />,
      });
    } else if (status === "Approved") {
      baseSteps.push({
        id: "approved",
        title: "Request Approved",
        description:
          "Your return request has been approved. The process is now complete.",
        status: "completed",
        date: createdAt,
        icon: <CheckCircle className="w-5 h-5" />,
      });
    } else if (!["Pending", "Rejected", "Approved"].includes(status)) {
      baseSteps.push({
        id: "decision",
        title: "Awaiting Decision",
        description:
          "Waiting for approval or rejection of your return request.",
        status: "pending",
        icon: <Clock className="w-5 h-5" />,
      });
    }

    return baseSteps;
  };

  const handleTrackReturn = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a return tracking number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cleanTrackingNumber = trackingNumber.replace(/[^0-9]/g, "");

      if (!cleanTrackingNumber) {
        setError("Please enter a valid tracking number");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:5005/api/ReturnRequest/all",
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const returns = response.data;
      let foundReturn = null;

      foundReturn = returns.find(
        (ret: ReturnTrackingData) =>
          ret.returnID.toString() === cleanTrackingNumber
      );

      if (!foundReturn) {
        foundReturn = returns.find(
          (ret: ReturnTrackingData) =>
            ret.orderID.toString() === cleanTrackingNumber
        );
      }

      if (foundReturn && email.trim()) {
        if (foundReturn.email.toLowerCase() !== email.toLowerCase()) {
          setError("Email address does not match the return request");
          setReturnData(null);
          setLoading(false);
          return;
        }
      }

      if (foundReturn) {
        setReturnData(foundReturn);
        setError("");
        toast.success("Return request found successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setError(
          "Return not found. Please check your tracking number and try again."
        );
        setReturnData(null);
      }
    } catch (error: any) {
      console.error("Error tracking return:", error);
      setError("Unable to track return. Please try again later.");
      setReturnData(null);
      toast.error("Failed to track return. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTrackByOrderId = async (orderId: number) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:5005/api/ReturnRequest/by-order/${orderId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const latestReturn = response.data[0];
        setReturnData(latestReturn);
        setTrackingNumber(latestReturn.returnID.toString());
        setError("");
        toast.success("Return request found successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setError("No return requests found for this order ID.");
        setReturnData(null);
      }
    } catch (error: any) {
      console.error("Error tracking return by order ID:", error);
      setError("Unable to find return for this order. Please try again.");
      setReturnData(null);
      toast.error("Failed to track return. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-gray-200 text-gray-800 border-gray-300";
      case "approved":
        return "bg-gray-300 text-gray-900 border-gray-400";
      case "rejected":
        return "bg-gray-200 text-gray-800 border-gray-300";
      case "processing":
        return "bg-gray-200 text-gray-800 border-gray-300";
      case "completed":
        return "bg-gray-200 text-gray-800 border-gray-300";
      default:
        return "bg-gray-200 text-gray-800 border-gray-300";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Your return request is being reviewed by our team.";
      case "approved":
        return "Your return request has been approved. The process is complete.";
      case "rejected":
        return "Your return request has been rejected. Please contact support for more information.";
      default:
        return "Your return request is being processed.";
    }
  };

  const filteredReturns = allReturns.filter((returnItem) => {
    const matchesSearch =
      searchTerm === "" ||
      returnItem.returnID.toString().includes(searchTerm) ||
      returnItem.orderID.toString().includes(searchTerm) ||
      returnItem.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "" ||
      returnItem.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Track Return Orders
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor the status and progress of your return requests
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setShowAllReturns(!showAllReturns);
                  if (!showAllReturns) {
                    fetchAllReturns();
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  showAllReturns
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {showAllReturns ? "Track Specific Return" : "View All Returns"}
              </button>
              <button
                onClick={fetchAllReturns}
                disabled={loadingAllReturns}
                className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loadingAllReturns ? "animate-spin" : ""
                  }`}
                />
                <span>Refresh</span>
              </button>
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Shield className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">
                  Secure Tracking
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!showAllReturns ? (
          <>
            {/* Tracking Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Track Your Return
                </h2>
                <p className="text-gray-600">
                  Enter your order number to get real-time updates
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order Number *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter Order ID (e.g., 456)"
                      className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 text-lg"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleTrackReturn()
                      }
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You can enter just the numbers (e.g., 123 for 456 for Order
                    ID)
                  </p>
                </div>

                <button
                  onClick={handleTrackReturn}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Tracking...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Track Return</span>
                    </>
                  )}
                </button>

                {error && (
                  <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-gray-700 flex-shrink-0" />
                    <p className="text-gray-700">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Results */}
            {returnData && (
              <div className="space-y-8">
                {/* Return Overview */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-800 px-8 py-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">
                          Return #{returnData.returnID}
                        </h3>
                        <p className="text-gray-300 mt-1">
                          Order #{returnData.orderID}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border bg-white/10 text-white border-white/20`}
                        >
                          <span className="capitalize">
                            {returnData.status || "Pending"}
                          </span>
                        </span>
                        <p className="text-gray-300 mt-2 text-sm">
                          Submitted:{" "}
                          {new Date(returnData.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    {/* Status Message */}
                    <div
                      className={`mb-6 p-4 rounded-xl border ${getStatusColor(
                        returnData.status || "pending"
                      )}`}
                    >
                      <div className="flex items-center space-x-3">
                        {returnData.status?.toLowerCase() === "approved" && (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        {returnData.status?.toLowerCase() === "rejected" && (
                          <XCircle className="w-5 h-5" />
                        )}
                        {returnData.status?.toLowerCase() === "pending" && (
                          <Clock className="w-5 h-5" />
                        )}
                        <p className="font-medium">
                          {getStatusMessage(returnData.status || "pending")}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <User className="w-5 h-5 mr-2 text-gray-700" />
                          Customer Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-600">Name:</span>{" "}
                            <span className="font-medium">
                              {returnData.fullName}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Email:</span>{" "}
                            <span className="font-medium">
                              {returnData.email}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Phone:</span>{" "}
                            <span className="font-medium">
                              {returnData.phoneNumber}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <Package className="w-5 h-5 mr-2 text-gray-700" />
                          Return Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          
                          <p>
                            <span className="text-gray-600">Reason:</span>{" "}
                            <span className="font-medium">
                              {returnReasons[
                                returnData.reason as keyof typeof returnReasons
                              ] || returnData.reason}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Condition:</span>{" "}
                            <span className="font-medium">
                              {productConditions[
                                returnData.productCondition as keyof typeof productConditions
                              ] || returnData.productCondition}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-gray-700" />
                          Timeline
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-600">Submitted:</span>{" "}
                            <span className="font-medium">
                              {new Date(
                                returnData.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Status:</span>{" "}
                            <span className="font-medium">
                              {returnData.status || "Pending"}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">
                              Est. Processing:
                            </span>{" "}
                            <span className="font-medium">
                              3-5 business days
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Truck className="w-6 h-6 mr-2 text-gray-700" />
                      Return Progress
                    </h3>
                    <button
                      onClick={() => toggleSection("timeline")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      {expandedSections.timeline ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {expandedSections.timeline && (
                    <div className="space-y-6">
                      {getTrackingSteps(
                        returnData.status || "Pending",
                        returnData.createdAt
                      ).map((step, index) => (
                        <div
                          key={step.id}
                          className="flex items-start space-x-4 relative"
                        >
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              step.status === "completed"
                                ? "bg-gray-300 text-gray-700"
                                : step.status === "current"
                                ? "bg-gray-400 text-gray-900"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {step.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-sm font-semibold ${
                                  step.status === "completed"
                                    ? "text-gray-900"
                                    : step.status === "current"
                                    ? "text-gray-900"
                                    : "text-gray-600"
                                }`}
                              >
                                {step.title}
                              </h4>
                              {step.date && (
                                <span className="text-xs text-gray-500">
                                  {new Date(step.date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-sm mt-1 ${
                                step.status === "completed"
                                  ? "text-gray-700"
                                  : step.status === "current"
                                  ? "text-gray-700"
                                  : "text-gray-600"
                              }`}
                            >
                              {step.description}
                            </p>
                          </div>

                          {index <
                            getTrackingSteps(
                              returnData.status || "Pending",
                              returnData.createdAt
                            ).length -
                              1 && (
                            <div
                              className={`absolute left-5 mt-10 w-0.5 h-6 ${
                                step.status === "completed"
                                  ? "bg-gray-300"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Return Details with Image */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-gray-700" />
                      Return Details
                    </h3>
                    <button
                      onClick={() => toggleSection("details")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      {expandedSections.details ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {expandedSections.details && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Return Reason
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                          {returnReasons[
                            returnData.reason as keyof typeof returnReasons
                          ] || returnData.reason}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Product Condition
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                          {productConditions[
                            returnData.productCondition as keyof typeof productConditions
                          ] || returnData.productCondition}
                        </p>
                      </div>

                      {returnData.comment && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Customer Comments
                          </label>
                          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                            {returnData.comment}
                          </p>
                        </div>
                      )}

                      {returnData?.imageUrl && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Uploaded Image
                          </label>
                          <div className="mt-2">
                            <img
                              src={`http://localhost:5005${returnData.imageUrl}`}
                              alt="Return product condition"
                              className="max-w-full h-auto rounded-lg border border-gray-200"
                              style={{ maxHeight: "300px" }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3 pt-4"></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* All Returns View */
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Filter className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Filter Returns
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search returns..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 appearance-none bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <div className="flex items-center justify-center bg-gray-100 rounded-xl p-3 border border-gray-300">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Results</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredReturns.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Returns List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    All Return Requests
                  </h3>
                  <div className="text-sm text-gray-500">
                    {filteredReturns.length} of {allReturns.length} returns
                  </div>
                </div>
              </div>

              {loadingAllReturns ? (
                <div className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600">Loading return requests...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredReturns.length > 0 ? (
                    filteredReturns.map((returnItem) => (
                      <div
                        key={returnItem.returnID}
                        className="p-6 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-start space-x-4">
                          {returnItem.imageUrl && (
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={`http://localhost:5005${returnItem.imageUrl}`}
                                alt="Return product"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  Return #{returnItem.returnID}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Order #{returnItem.orderID} • Product #
                                  {returnItem.productID}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Submitted:{" "}
                                  {new Date(
                                    returnItem.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>

                              <div className="flex items-center space-x-4">
                                <span
                                  className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(
                                    returnItem.status || "pending"
                                  )}`}
                                >
                                  <span className="capitalize">
                                    {returnItem.status || "Pending"}
                                  </span>
                                </span>
                                <button
                                  onClick={() => {
                                    setTrackingNumber(
                                      returnItem.returnID.toString()
                                    );
                                    setReturnData(returnItem);
                                    setShowAllReturns(false);
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>Track</span>
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Reason:</span>
                                <span className="ml-2 font-medium">
                                  {returnReasons[
                                    returnItem.reason as keyof typeof returnReasons
                                  ] || returnItem.reason}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Condition:
                                </span>
                                <span className="ml-2 font-medium">
                                  {productConditions[
                                    returnItem.productCondition as keyof typeof productConditions
                                  ] || returnItem.productCondition}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Customer:</span>
                                <span className="ml-2 font-medium">
                                  {returnItem.fullName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No returns found
                      </h3>
                      <p className="text-gray-500">
                        {searchTerm || statusFilter
                          ? "No returns match your current filter criteria."
                          : "No return requests have been submitted yet."}
                      </p>
                      {(searchTerm || statusFilter) && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("");
                          }}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 mt-4"
                        >
                          <Filter className="w-4 h-4" />
                          <span>Clear Filters</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnOrderTracking;
