import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { send } from "@emailjs/browser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CartItem, clearCart } from "../types/CartItem";
import {
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle,
  Mail,
  User,
  MapPin,
  Phone,
  Building,
  Globe,
  Lock,
  Package,
  Star,
  Gift,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShoppingBag,
  Heart,
  Sparkles,
} from "lucide-react";

interface CheckoutState {
  cartItems: CartItem[];
  subtotal: number;
}

const CheckoutForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, subtotal } = (location.state as CheckoutState) || {
    cartItems: [],
    subtotal: 0,
  };

  const shippingFee = subtotal < 5000 ? 400 : 0;
  const finalTotal = subtotal + shippingFee;

  const [selectedPayment, setSelectedPayment] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailOffers, setEmailOffers] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser?.userID || 0;
  const currentUserName = currentUser?.username || "";
  const currentUserEmail = currentUser?.email || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: "/CheckoutForm" } });
    }
  }, [navigate]);
const storedEmail = localStorage.getItem("email") || "";

  const formik = useFormik({
    initialValues: {
      email: storedEmail || "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      apartment: "",
      city: "",
      postalCode: "",
      country: "Sri Lanka",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Please enter a valid email address")
        .required("Email is required")
        .matches(
          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          "Please enter a valid email format"
        ),
      firstName: Yup.string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must be less than 50 characters")
        .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters")
        .required("First name is required"),
      lastName: Yup.string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must be less than 50 characters")
        .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters")
        .required("Last name is required"),
      phone: Yup.string()
        .required("Phone number is required")
        .matches(/^[0-9]{9}$/, "Phone number must be exactly 9 digits"),
      address: Yup.string()
        .min(10, "Address must be at least 10 characters")
        .max(200, "Address must be less than 200 characters")
        .required("Address is required"),
      city: Yup.string()
        .min(2, "City must be at least 2 characters")
        .max(50, "City must be less than 50 characters")
        .matches(/^[a-zA-Z\s]+$/, "City can only contain letters")
        .required("City is required"),
      postalCode: Yup.string()
        .matches(/^[0-9]{5}$/, "Postal code must be exactly 5 digits")
        .required("Postal code is required"),
      country: Yup.string().required("Country is required"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);

      const orderPayload = {
        firstName: values.firstName,
        lastName: values.lastName,
        address: values.address,
        city: values.city,
        postalCode: values.postalCode,
        country: values.country,
        phone: `+94${values.phone}`, // Combine with Sri Lanka country code
        email: values.email,
        paymentMethod: selectedPayment,
        shippingFee,
        total: finalTotal,
        cartItems: cartItems.map((item) => ({
          productID: item.ProductID,
          quantity: item.Quantity,
          price: item.Price,
          id: Math.floor(Date.now() % 2147483647),
          userID: item.UserID || currentUserId,
          name: item.Name,
          imageData: item.ImageUrl,
          size: item.Size,
          color: item.Color,
          user: {
            userID: (item.User && item.User.UserID) || currentUserId,
            username: (item.User && item.User.Username) || currentUserName,
            email: (item.User && item.User.Email) || currentUserEmail,
            passwordHash: (item.User && item.User.PasswordHash) || "",
            role: (item.User && item.User.Role) || "customer",
          },
        })),
      };

      try {
        const { data } = await axios.post(
          "http://localhost:5005/api/Checkout/PlaceOrder",
          orderPayload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        toast.success(data.message || "Order placed successfully!", {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        });

        await send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID!,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID!,
          {
            email: values.email,
            to_name: `${values.firstName} ${values.lastName}`,
            order_id: data.orderId,
            order_date: new Date().toLocaleDateString(),
            order_total: finalTotal.toFixed(2),
          },
          import.meta.env.VITE_EMAILJS_USER_ID!
        );

        toast.success("Confirmation email sent!", {
          icon: <Mail className="w-5 h-5 text-black-500" />,
        });

        clearCart();

        navigate(`/OrderDisplay/${data.orderId}`, {
          state: { userID: currentUserId },
        });
      } catch (err: any) {
        console.error(err);
        toast.error("Something went wrong while placing the order.", {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const paymentOptions = [
    {
      value: "card",
      label: "Debit/Credit Card",
      description: "Secure payment with your card",
      icon: CreditCard,
      popular: true,
      icons: ["visa@2x", "mastercard@2x"],
    },
    {
      value: "mintpay",
      label: "Mintpay (BNPL)",
      description: "Buy now, pay later",
      icon: Gift,
      icons: ["visa@2x"],
    },
    {
      value: "payhere",
      label: "PayHere",
      description: "Local payment gateway",
      icon: Shield,
      icons: ["visa@2x", "mastercard@2x"],
    },
    {
      value: "koko",
      label: "Koko (BNPL)",
      description: "Flexible payment options",
      icon: Clock,
      icons: ["visa@2x"],
    },
    {
      value: "cod",
      label: "Cash on Delivery",
      description: "Pay when you receive",
      icon: Package,
      icons: [],
    },
  ];

  const steps = [
    { id: 1, name: "Contact", icon: Mail },
    { id: 2, name: "Delivery", icon: Truck },
    { id: 3, name: "Payment", icon: CreditCard },
  ];

  return (
    <>
      <style>
        {`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          .animate-slide-in-up {
            animation: slideInUp 0.6s ease-out forwards;
          }
          
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }
          
          .animate-pulse-custom {
            animation: pulse 2s infinite;
          }
          
          .shimmer {
            position: relative;
            overflow: hidden;
          }
          
          .shimmer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 2s infinite;
          }
          
          .gradient-border {
            background: linear-gradient(white, white) padding-box,
                        linear-gradient(45deg, #000000ff, #000000ff) border-box;
            border: 2px solid transparent;
          }
        `}
      </style>

      <div className="bg-gradient-to-br from-gray-50 via-white to-black-50 min-h-screen">
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 py-16"> {/* Even larger padding */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-black-600 to-black-600 rounded-2xl shadow-lg">
                    
                  </div>
                 
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Secure Checkout
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Complete your order with our secure and encrypted checkout
                process
              </p>

              <div className="flex items-center justify-center space-x-8 mb-8">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep >= step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : isActive
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white border-gray-300 text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`ml-3 text-sm font-medium ${
                          isActive ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </span>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-16 h-0.5 mx-4 ${
                            currentStep > step.id
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-black-500" />
                  <span>256-bit Encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>PCI Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 p-6">
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={formik.handleSubmit} className="space-y-8">
              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50 animate-slide-in-up">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-500 rounded-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Contact Information
                  </h2>
                </div>

                <div className="space-y-6">
                  <EnhancedInput
                    label="Email Address"
                    name="email"
                    type="email"
                    formik={formik}
                    icon={Mail}
                    placeholder="your.email@example.com"
                  />

                  <div className="flex items-start space-x-3 p-4 bg-black-50 rounded-xl border border-black-200">
                    <input
                      id="offers"
                      type="checkbox"
                      checked={emailOffers}
                      onChange={() => setEmailOffers(!emailOffers)}
                      className="mt-1 h-4 w-4 text-black-600 rounded focus:ring-black-500 focus:ring-2"
                    />
                    <div>
                      <label
                        htmlFor="offers"
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        Keep me updated with exclusive offers
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Get early access to sales, new arrivals, and special
                        promotions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50 animate-slide-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Address
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Country / Region
                    </label>
                    <select
                      name="country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 bg-white focus:border-black-500 focus:ring-4 focus:ring-black-500/20 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
                      <option value="India">🇮🇳 India</option>
                      <option value="USA">🇺🇸 United States</option>
                      <option value="UK">🇬🇧 United Kingdom</option>
                    </select>
                    {formik.touched.country && formik.errors.country && (
                      <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formik.errors.country}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <EnhancedInput
                      label="First Name"
                      name="firstName"
                      formik={formik}
                      icon={User}
                      placeholder="John"
                    />
                    <EnhancedInput
                      label="Last Name"
                      name="lastName"
                      formik={formik}
                      icon={User}
                      placeholder="Doe"
                    />
                  </div>

                  {/* Updated Phone Number Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    <div className="flex">
                      <div className="flex items-center justify-center px-4 border-2 border-r-0 border-gray-200 rounded-l-xl bg-gray-100 text-gray-600">
                        +94
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="771234567"
                        maxLength={9}
                        className="flex-1 border-2 border-gray-200 rounded-r-xl p-4 text-gray-900 bg-white focus:border-black-500 focus:ring-4 focus:ring-black-500/20 transition-all duration-300 shadow-sm hover:shadow-md"
                      />
                    </div>
                    {formik.touched.phone && formik.errors.phone && (
                      <div className="flex items-center space-x-2 text-red-500 text-sm mt-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formik.errors.phone}</span>
                      </div>
                    )}
                  </div>

                  <EnhancedInput
                    label="Street Address"
                    name="address"
                    formik={formik}
                    icon={MapPin}
                    placeholder="123 Main Street"
                  />

                  <EnhancedInput
                    label="Apartment, Suite, etc. (Optional)"
                    name="apartment"
                    formik={formik}
                    icon={Building}
                    placeholder="Apt 4B, Floor 2"
                    required={false}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <EnhancedInput
                      label="City"
                      name="city"
                      formik={formik}
                      icon={MapPin}
                      placeholder="Colombo"
                    />
                    <EnhancedInput
                      label="Postal Code"
                      name="postalCode"
                      formik={formik}
                      icon={MapPin}
                      placeholder="10100"
                    />
                  </div>
                </div>
              </div>

              <div
                className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50 animate-slide-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-500 rounded-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-4">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`relative flex items-center justify-between p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                          selectedPayment === option.value
                            ? "border-black-500 bg-black-50 shadow-lg ring-4 ring-black-500/20"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {option.popular && (
                          <div className="absolute -top-2 left-4 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Most Popular
                          </div>
                        )}

                        <div className="flex items-center space-x-4">
                          <input
                            type="radio"
                            name="payment"
                            value={option.value}
                            checked={selectedPayment === option.value}
                            onChange={() => setSelectedPayment(option.value)}
                            className="w-5 h-5 text-black-600 focus:ring-black-500 focus:ring-2"
                          />
                          <div
                            className={`p-3 rounded-lg ${
                              selectedPayment === option.value
                                ? "bg-black-500 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {option.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {option.icons.map((icon) => (
                            <img
                              key={icon}
                              src={`/icons/${icon}.png`}
                              alt={icon}
                              className="h-6 opacity-70"
                            />
                          ))}
                          {selectedPayment === option.value && (
                            <CheckCircle className="w-5 h-5 text-black-500" />
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !formik.isValid}
                className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-4 px-8 rounded-xl text-lg font-bold transition-all duration-300 hover:from-gray-800 hover:to-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] shimmer"
>
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Your Order...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Lock className="w-5 h-5" />
                    <span>Complete Secure Order</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div
                className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50 animate-slide-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Order Summary
                  </h2>
                  <button
                    onClick={() => setShowOrderSummary(!showOrderSummary)}
                    className="lg:hidden flex items-center space-x-2 text-blue-800 hover:text-blue-700"
                  >
                    <span>{showOrderSummary ? "Hide" : "Show"}</span>
                    <Eye
                      className={`w-4 h-4 transition-transform ${
                        showOrderSummary ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                <div
                  className={`space-y-4 ${
                    showOrderSummary ? "block" : "hidden lg:block"
                  }`}
                >
                  {cartItems.map((item, index) => (
                    <div
                      key={item.ProductID}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative group">
                        
                        <img
                          src={item.ImageUrl}
                          alt={`Thumbnail ${index}`}
                          className="w-full h-20 object-cover"
                        />

                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          {item.Quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {item.Name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                            {item.Size}
                          </span>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                            {item.Color}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          LKR {(item.Price * item.Quantity).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.Quantity} × LKR {item.Price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span className="font-semibold">
                        LKR {subtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Shipping</span>
                      </div>
                      {shippingFee > 0 ? (
                        <span className="font-semibold text-gray-900">
                          LKR {shippingFee.toLocaleString()}
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span className="text-green-600 font-bold">FREE</span>
                          <Gift className="w-4 h-4 text-green-500" />
                        </div>
                      )}
                    </div>

                    {subtotal < 5000 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-amber-700 text-sm">
                          <Sparkles className="w-4 h-4" />
                          <span>
                            Add LKR {(5000 - subtotal).toLocaleString()} more
                            for FREE shipping!
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span className="text-2xl">
                          LKR {finalTotal.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Including all taxes and fees
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="flex flex-col items-center space-y-2 p-3 bg-green-50 rounded-lg">
                        <Shield className="w-6 h-6 text-green-500" />
                        <span className="text-xs font-medium text-green-700">
                          Secure Payment
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-2 p-3 bg-black-50 rounded-lg">
                        <Truck className="w-6 h-6 text-black-500" />
                        <span className="text-xs font-medium text-black-700">
                          Fast Delivery
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="mt-16"
        />
      </div>
    </>
  );
};

type EnhancedInputProps = {
  label: string;
  name: string;
  type?: string;
  formik: any;
  icon?: React.ComponentType<any>;
  placeholder?: string;
  required?: boolean;
};

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  name,
  type = "text",
  formik,
  icon: Icon,
  placeholder,
  required = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isError = formik.touched[name] && formik.errors[name];
  const isValid =
    formik.touched[name] && !formik.errors[name] && formik.values[name];

  return (
    <div className="space-y-2">
      <label
        className="block text-sm font-semibold text-gray-700"
        htmlFor={name}
      >
        {Icon && <Icon className="w-4 h-4 inline mr-2" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={type === "password" && showPassword ? "text" : type}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values[name]}
          placeholder={placeholder || label}
          className={`w-full border-2 rounded-xl p-4 pr-12 text-gray-900 bg-white transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-4 ${
            isError
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : isValid
              ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
              : "border-gray-200 focus:border-black-500 focus:ring-black-500/20"
          }`}
        />

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          {type === "password" ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : isValid ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : null}
        </div>
      </div>

      {isError && (
        <div className="flex items-center space-x-2 text-red-500 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{formik.errors[name]}</span>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
