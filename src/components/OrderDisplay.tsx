import React, { useState, useEffect } from "react";
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle,
  User,
  Phone,
  Calendar,
  DollarSign,
  MapPin,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Home,
  PackageCheck,
  Eye,
} from "lucide-react";
import axios from "axios";
import OrderDetails from "./OrderDetails";

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  subTotal: number;
  imageData: string;
}

interface Order {
  id: string;
  customerName: string;
  email: string;
  orderDate: string;
  total: number;
  status: "Pending" | "Processing" | "Delivered" | "Returned";
  items: OrderItem[];
}

const api = axios.create({
  baseURL: "http://localhost:5005/api/checkout",
  headers: { "Content-Type": "application/json" },
});

const OrderDisplay: React.FC = () => {
  const [searchType, setSearchType] = useState<"orderId" | "mobile">("orderId");
  const [searchValue, setSearchValue] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
useEffect(() => {
  // Scroll to top when component mounts or route changes
  window.scrollTo(0, 0);
}, [location.pathname, location.search]); 
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError("Please enter a valid search value");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      let foundOrder = null;

      if (searchType === "orderId") {
        const { data } = await api.get(
          `/GetOrderDetails/${searchValue.trim()}`
        );
        foundOrder = data;
      } else {
        const { data } = await api.get("/GetAllOrders");
        foundOrder = data.find(
          (o: any) => o.mobileNumber === searchValue.trim()
        );
      }

      if (foundOrder) {
        const formattedOrder: Order = {
          id: foundOrder.orderID,
          customerName: foundOrder.customerName,
          email: foundOrder.email,
          total: foundOrder.total,
          orderDate: new Date(foundOrder.orderDate).toLocaleDateString(),
          status: foundOrder.status as Order["status"],
          items: foundOrder.items || [],
        };
        setOrder(formattedOrder);
      } else {
        setOrder(null);
        setError(
          `No order found with the provided ${
            searchType === "orderId" ? "Order ID" : "Mobile Number"
          }`
        );
      }
    } catch (err) {
      console.error(err);
      setError("Unable to fetch order details. Please try again later.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const resetSearch = () => {
    setSearchValue("");
    setOrder(null);
    setError("");
    setHasSearched(false);
    setSelectedOrderId(null);
  };

  const handleViewDetails = (orderId: string) => {
    if (orderId) {
      setSelectedOrderId(orderId);
    } else {
      console.error("Invalid order ID:", orderId);
    }
  };

  const handleBackToSearch = () => {
    setSelectedOrderId(null);
  };

  if (selectedOrderId) {
    return (
      <OrderDetails orderId={selectedOrderId} onBack={handleBackToSearch} />
    );
  }

  const getStatusStep = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return 1;
      case "Processing":
        return 2;
      case "Delivered":
        return 3;
      case "Returned":
        return 4;
      default:
        return 0;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "text-gray-600";
      case "Processing":
        return "text-gray-700";
      case "Delivered":
        return "text-gray-800";
      case "Returned":
        return "text-gray-900";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBgColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-gray-400";
      case "Processing":
        return "bg-gray-500";
      case "Delivered":
        return "bg-gray-600";
      case "Returned":
        return "bg-gray-700";
      default:
        return "bg-gray-300";
    }
  };

  const getEstimatedDelivery = (status: Order["status"], orderDate: string) => {
    const orderDateObj = new Date(orderDate);
    const deliveryDate = new Date(orderDateObj);

    switch (status) {
      case "Pending":
        deliveryDate.setDate(orderDateObj.getDate() + 7);
        return `Expected by ${deliveryDate.toLocaleDateString()}`;
      case "Processing":
        deliveryDate.setDate(orderDateObj.getDate() + 3);
        return `Expected by ${deliveryDate.toLocaleDateString()}`;
      case "Delivered":
        return "Delivered";
      case "Returned":
        return "Return Processed";
      default:
        return "Processing";
    }
  };

  const steps = [
    { name: "Order Placed", icon: PackageCheck, status: "Pending" },
    { name: "Processing", icon: Truck, status: "Processing" },
    { name: "Delivered", icon: Home, status: "Delivered" },
    { name: "Returned", icon: RefreshCw, status: "Returned" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="p-3 bg-gray-800 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900"></h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto"></p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-gray-100 p-1 rounded-xl inline-flex">
                <button
                  onClick={() => setSearchType("orderId")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    searchType === "orderId"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Search by Order ID
                </button>
              </div>
            </div>

            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {searchType === "orderId" ? (
                  <Package className="h-5 w-5 text-gray-400" />
                ) : (
                  <Phone className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <input
                type="text"
                placeholder={
                  searchType === "orderId"
                    ? "Enter Order ID (e.g., 12345)"
                    : "Enter Mobile Number"
                }
                className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={handleSearch}
                disabled={loading || !searchValue.trim()}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                <span>{loading ? "Searching..." : "Track Order"}</span>
              </button>

              {hasSearched && (
                <button
                  onClick={resetSearch}
                  className="inline-flex items-center space-x-2 px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>New Search</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-gray-100 border-l-4 border-gray-500 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-gray-700 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Not Found
                </h3>
                <p className="text-gray-700 mt-1">{error}</p>
                <p className="text-gray-600 text-sm mt-2">
                  Please check your{" "}
                  {searchType === "orderId" ? "Order ID" : "Mobile Number"} and
                  try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {order && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div
                className={`p-6 ${
                  getStatusBgColor(order.status) || "bg-black"
                } text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Order #{order.id}
                    </h2>
                    <p className="text-white/90">Status: {order.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/90 text-sm">Total Amount</p>
                    <p className="text-3xl font-bold">
                      Rs. {order.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <User className="w-5 h-5 text-gray-700" />
                      <span>Customer Information</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Customer Name</p>
                          <p className="font-semibold text-gray-900">
                            {order.customerName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">
                            {order.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Package className="w-5 h-5 text-gray-700" />
                      <span>Order Information</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Order Date</p>
                          <p className="font-semibold text-gray-900">
                            {order.orderDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Delivery Status
                          </p>
                          <p className="font-semibold text-gray-900">
                            {getEstimatedDelivery(
                              order.status,
                              order.orderDate
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-gray-700" />
                    <span>Order Items</span>
                  </h3>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 p-4 grid grid-cols-12 gap-4 border-b border-gray-200">
                      <div className="col-span-6 font-medium text-gray-700">
                        Product
                      </div>
                      <div className="col-span-2 font-medium text-gray-700 text-center">
                        Quantity
                      </div>
                      <div className="col-span-2 font-medium text-gray-700 text-right">
                        Price
                      </div>
                      <div className="col-span-2 font-medium text-gray-700 text-right">
                        Subtotal
                      </div>
                    </div>

                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 grid grid-cols-12 gap-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <div className="col-span-6 flex items-center space-x-4">
                          {item.imageData ? (
                            <img
                              src={`http://localhost:5005${item.imageData[0]}`}
                              alt={item.productName}
                              className="w-40 h-40"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.productName}
                            </p>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center justify-center">
                          <p className="text-gray-700">{item.quantity}</p>
                        </div>
                        <div className="col-span-2 flex items-center justify-end">
                          <p className="text-gray-700">
                            Rs. {item.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="col-span-2 flex items-center justify-end">
                          <p className="font-medium text-gray-900">
                            Rs. {item.subTotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="bg-gray-50 p-4 flex justify-end">
                      <div className="flex items-center space-x-6">
                        <span className="text-gray-700 font-medium">
                          Total:
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          Rs. {order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => handleViewDetails(order.id)}
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
                  >
                    <Eye className="w-5 h-5" />
                    <span>View Detailed Timeline</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">
                Order Progress
              </h3>

              <div className="relative">
                <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getStatusBgColor(
                      order.status
                    )}`}
                    style={{
                      width: `${(getStatusStep(order.status) / 4) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="relative flex justify-between">
                  {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted =
                      getStatusStep(order.status) >= stepNumber;
                    const isCurrent =
                      getStatusStep(order.status) === stepNumber;

                    return (
                      <div
                        key={step.name}
                        className="flex flex-col items-center space-y-3"
                      >
                        <div
                          className={`
                          w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300
                          ${
                            isCompleted
                              ? `${getStatusBgColor(
                                  order.status
                                )} border-transparent text-white shadow-lg`
                              : isCurrent
                              ? "bg-white border-gray-700 text-gray-700 shadow-md"
                              : "bg-gray-100 border-gray-300 text-gray-400"
                          }
                        `}
                        >
                          <step.icon className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p
                            className={`font-semibold text-sm ${
                              isCompleted || isCurrent
                                ? "text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {step.name}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-gray-700 font-medium mt-1">
                              Current Status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-100 rounded-xl border border-gray-300">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {order.status === "Delivered"
                      ? "🎉 Order Delivered!"
                      : order.status === "Processing"
                      ? "📦 Order is being processed"
                      : order.status === "Returned"
                      ? "🔄 Return Processed"
                      : "⏳ Order received and pending"}
                  </h4>
                  <p className="text-gray-600">
                    {order.status === "Delivered"
                      ? "Your order has been successfully delivered. Thank you for shopping with us!"
                      : order.status === "Processing"
                      ? "Your order is currently being prepared and will be shipped soon."
                      : order.status === "Returned"
                      ? "Your return request has been processed. Refund will be initiated shortly."
                      : "We have received your order and it will be processed shortly."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-2xl p-6 border border-gray-300">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Need Help?
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    If you have any questions about your order or need
                    assistance, please contact our customer support team. Keep
                    your Order ID #{order.id} handy for faster service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!order && !error && !loading && !hasSearched && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Order Tracking
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Enter your Order ID or Mobile Number above to track your order
                  status, view delivery information, and get real-time updates
                  on your purchase.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDisplay;
