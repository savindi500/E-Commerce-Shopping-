import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Package, 
  User, 
  Phone, 
  Calendar, 
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Home,
  PackageCheck,
  AlertCircle,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subTotal: number;
}

interface Order {
  id: number;
  email: string;
  customerName: string;
  orderDate: string;
  total: number;
  status: "Pending" | "Processing" | "Delivered";
  paymentMethod: string;
  shippingAddress: string;
  items: OrderItem[];
}


interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
  icon: React.ComponentType<any>;
}

interface OrderDetailsProps {
  orderId: string;
  onBack: () => void;
}

const api = axios.create({
  baseURL: "http://localhost:5005/api/checkout",
  headers: { "Content-Type": "application/json" },
});

const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onBack }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { userID } = location.state || {};
  const loggedInUserID = localStorage.getItem("userID");



  useEffect(() => {
  fetchOrderDetails();
}, [orderId]);

useEffect(() => {
  // Scroll to top when component mounts or route changes
  window.scrollTo(0, 0);
}, [location.pathname, location.search]); 

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the specific endpoint for getting order details by ID
      const { data } = await api.get(`/GetOrderDetails/${orderId}`);

      if (data) {
        const formattedOrder: Order = {
  id: data.orderID,
  email: data.email,
  customerName: data.customerName,
  orderDate: new Date(data.orderDate).toLocaleDateString(),
  total: data.total,
  status: data.status,
  paymentMethod: data.paymentMethod,
  shippingAddress: data.shippingAddress,
  items: data.items.map((item: any) => ({
    productId: item.productID,
    productName: item.productName,
    price: item.price,
    quantity: item.quantity,
    subTotal: item.subTotal
  }))
};

        setOrder(formattedOrder);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy order ID');
    }
  };

  const getStatusStep = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return 1;
      case "Processing": return 2;
      case "Delivered": return 3;
      default: return 0;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "text-amber-600";
      case "Processing": return "text-blue-800";
      case "Delivered": return "text-emerald-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBgColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "bg-gradient-to-r from-amber-500 to-orange-500";
      case "Processing": return "bg-gradient-to-r from-blue-500 to-indigo-500";
      case "Delivered": return "bg-gradient-to-r from-emerald-500 to-green-500";
      default: return "bg-gray-500";
    }
  };

  const generateTimeline = (order: Order): TimelineEvent[] => {
    const orderDate = new Date(order.orderDate);
    const currentStep = getStatusStep(order.status);
    
    const events: TimelineEvent[] = [
      {
        id: 1,
        title: "Order Placed",
        description: "Your order has been successfully placed and confirmed.",
        timestamp: orderDate.toLocaleString(),
        status: currentStep >= 1 ? 'completed' : 'pending',
        icon: PackageCheck
      },
      {
        id: 2,
        title: "Order Processing",
        description: "Your order is being prepared and will be shipped soon.",
        timestamp: currentStep >= 2 ? new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toLocaleString() : "Pending",
        status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending',
        icon: Truck
      },
      {
        id: 3,
        title: "Order Delivered",
        description: "Your order has been successfully delivered to your address.",
        timestamp: currentStep >= 3 ? new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleString() : "Pending",
        status: currentStep === 3 ? 'completed' : 'pending',
        icon: Home
      }
    ];

    return events;
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
      default:
        return "Processing";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <RefreshCw className="animate-spin text-6xl text-indigo-500 mx-auto" />
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Loading Order Details</h3>
            <p className="text-gray-600">Fetching your order information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </button>
         

          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Order Not Found</h3>
                <p className="text-red-700 mt-1">{error || 'The requested order could not be found.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const timeline = generateTimeline(order);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Search</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                  <p className="text-gray-600">Complete information about your order</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-8">
              <div className={`p-6 ${getStatusBgColor(order.status)} text-white`}>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <h2 className="text-xl font-bold">Order #{order.id}</h2>
                    <button
                      onClick={copyOrderId}
                      className="p-1 hover:bg-white/20 rounded transition-colors duration-200"
                      title="Copy Order ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{order.status}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
    <Package className="w-5 h-5 text-indigo-600" />
    <span>Ordered Products</span>
  </h3>
  <div className="space-y-4">
    {order.items.map((item, index) => (
      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div>
          <p className="text-sm font-medium text-gray-800">{item.productName}</p>
          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Rs. {item.price.toLocaleString()} x {item.quantity}</p>
          <p className="text-sm font-semibold text-gray-900">Subtotal: Rs. {item.subTotal.toLocaleString()}</p>
        </div>
      </div>
    ))}
  </div>
</div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    <span>Customer Details</span>
                  </h3>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
  <MapPin className="w-4 h-4 text-gray-400" />
  <div>
    <p className="text-xs text-gray-600">Shipping Address</p>
    <p className="font-semibold text-gray-900">{order.shippingAddress}</p>
  </div>
</div>

<div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
  <DollarSign className="w-4 h-4 text-gray-400" />
  <div>
    <p className="text-xs text-gray-600">Payment Method</p>
    <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
  </div>
</div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Name</p>
                        <p className="font-semibold text-gray-900">{order.customerName}</p>
                      </div>
                    </div>
                    
                  </div>
                </div>

                {/* Order Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-indigo-600" />
                    <span>Order Summary</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Order Date</p>
                        <p className="font-semibold text-gray-900">{order.orderDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Total Amount</p>
                        <p className="font-semibold text-gray-900">Rs. {order.total.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-600">Delivery Status</p>
                        <p className="font-semibold text-gray-900">{getEstimatedDelivery(order.status, order.orderDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {order.status === 'Delivered' ? '🎉 Order Delivered!' : 
                       order.status === 'Processing' ? '📦 Order Processing' : 
                       '⏳ Order Confirmed'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {order.status === 'Delivered' ? 'Thank you for your order!' :
                       order.status === 'Processing' ? 'Being prepared for shipment' :
                       'Your order is being processed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Timeline</h3>
                <p className="text-gray-600">Track your order's journey from placement to delivery</p>
              </div>

              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Timeline Events */}
                <div className="space-y-8">
                  {timeline.map((event, index) => {
                    const IconComponent = event.icon;
                    
                    return (
                      <div key={event.id} className="relative flex items-start space-x-6">
                        {/* Timeline Dot */}
                        <div className={`
                          relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-500
                          ${event.status === 'completed' 
                            ? `${getStatusBgColor(order.status)} border-transparent text-white shadow-lg` 
                            : event.status === 'current'
                              ? 'bg-white border-indigo-600 text-indigo-600 shadow-md animate-pulse' 
                              : 'bg-gray-100 border-gray-300 text-gray-400'
                          }
                        `}>
                          <IconComponent className="w-8 h-8" />
                        </div>

                        {/* Event Content */}
                        <div className="flex-1 min-w-0 pb-8">
                          <div className={`
                            p-6 rounded-xl border-2 transition-all duration-300
                            ${event.status === 'completed' 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-200' 
                              : event.status === 'current'
                                ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 shadow-md' 
                                : 'bg-gray-50 border-gray-200'
                            }
                          `}>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className={`
                                text-lg font-semibold
                                ${event.status === 'completed' || event.status === 'current' 
                                  ? 'text-gray-900' 
                                  : 'text-gray-500'
                                }
                              `}>
                                {event.title}
                              </h4>
                              {event.status === 'current' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                  Current Status
                                </span>
                              )}
                              {event.status === 'completed' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                  Completed
                                </span>
                              )}
                            </div>
                            
                            <p className={`
                              text-sm mb-3
                              ${event.status === 'completed' || event.status === 'current' 
                                ? 'text-gray-700' 
                                : 'text-gray-500'
                              }
                            `}>
                              {event.description}
                            </p>
                            
                            <div className="flex items-center space-x-2">
                              <Clock className={`
                                w-4 h-4
                                ${event.status === 'completed' || event.status === 'current' 
                                  ? 'text-gray-500' 
                                  : 'text-gray-400'
                                }
                              `} />
                              <span className={`
                                text-sm font-medium
                                ${event.status === 'completed' || event.status === 'current' 
                                  ? 'text-gray-900' 
                                  : 'text-gray-500'
                                }
                              `}>
                                {event.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-blue-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Need Assistance?</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      If you have any questions about your order or need to make changes, please contact our customer support team. 
                      Have your Order ID #{order.id} ready for faster service.
                    </p>
                    <div className="mt-3 flex items-center space-x-4">
                      <span className="text-sm font-medium text-blue-900">📞 Customer Support</span>
                      <span className="text-sm font-medium text-blue-900">📧 Email Support</span>
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
};

export default OrderDetails;