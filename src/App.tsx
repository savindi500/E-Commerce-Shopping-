import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AboutUs from "./components/AboutUs";
import OrderDisplay from "./components/OrderDisplay";
import Navbar from "./components/NavBar";
import CustomerLogin from "./components/CustomerLogin";
import SignUp from "./components/SignUp";
import HeroSection from "./components/Herosection";
import NewArrivals from "./components/NewArrivals";




import Footer from "./components/Footer";
import Admindashboard from "./components/AdminDashboard";
import Product from "./components/Product";
import Addproduct from "./components/Addproduct";
import ResetPassword from "./components/ResetPassword";
import Category from "./components/Category";
import AddCategory from "./components/Addcategory";
import CheckoutForm from "./components/CheckoutForm";
import CartPage from "./components/CartPage";
import Orders from "./components/Orders";
import Modal from "react-modal";
import ProductDetails from "./components/ProductDetails";
import EditProduct from "./components/EditProduct";
import UserManagement from "./components/UserManagement";
import Home from "./components/Home";
import ProductPage from "./components/ProductPage";
import AdminReturnDashboard from "./components/AdminReturnDashboard";
import SearchResults from "./components/SearchResults";
import ReturnOrderForm from "./components/ReturnOrderForm";
import WishlistPage from "./components/WishlistPage";
import ProductListing from "./components/ProductListing";
import ReturnOrderTracking from "./components/ReturnOrderTracking";
import AdminSidebar from "./components/AdminSidebar";
import { init } from "@emailjs/browser";
import "react-phone-input-2/lib/style.css";

const decodeToken = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = JSON.parse(
      atob(paddedPayload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return (
      decoded.role ||
      decoded.Role ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
    );
  } catch (e) {
    return null;
  }
};

console.log("Initializing EmailJS with:", import.meta.env.VITE_EMAILJS_USER_ID);
init(import.meta.env.VITE_EMAILJS_USER_ID!);
Modal.setAppElement("#root");

const App: React.FC = () => {
  const location = useLocation();

  const token = localStorage.getItem("token");

  const role = token ? decodeToken(token) : null;

  const isDashboardPage =
    location.pathname.startsWith("/Admindashboard") ||
    location.pathname.startsWith("/Product") ||
    location.pathname.startsWith("/Category") ||
    location.pathname.startsWith("/Orders") ||
    location.pathname.startsWith("/UserManagement") ||
    location.pathname.startsWith("/Addproduct") ||
    location.pathname.startsWith("/Addcategory") ||
    location.pathname.startsWith("/AdminReturnDashboard") ||
    location.pathname.startsWith("/EditProduct");

  return (
    <div>
      {/* Global toast container */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Conditionally show sidebars based on role */}
      {isDashboardPage && (role === "Admin" || role === "staff") && (
        <AdminSidebar />
      )}

      {/* Show regular navbar and footer on public pages */}
      {!isDashboardPage && <Navbar />}
      {!isDashboardPage && location.pathname === "/" && <Home />}

      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/Herosection" element={<HeroSection />} />
        <Route path="/NewArrivals" element={<NewArrivals />} />
             
        <Route path="/Product" element={<Product />} />
        <Route path="/Category" element={<Category />} />
        <Route path="/Admindashboard" element={<Admindashboard />} />
        <Route path="/Addproduct" element={<Addproduct />} />
        <Route path="/Addcategory" element={<AddCategory />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutForm />} />
        <Route path="/CartPage" element={<CartPage />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/ProductDetails/:productId" element={<ProductDetails />} />
        <Route path="/Orders" element={<Orders />} />
        <Route path="/EditProduct/:id" element={<EditProduct />} />
        <Route path="/UserManagement" element={<UserManagement />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/:categoryName" element={<ProductListing />} />
        <Route
          path="/AdminReturnDashboard"
          element={<AdminReturnDashboard />}
        />
        <Route path="/ReturnOrderForm" element={<ReturnOrderForm />} />
        <Route path="/WishlistPage" element={<WishlistPage />} />
        <Route path="/OrderDisplay/:orderId" element={<OrderDisplay />} />
        <Route path="/track-returns" element={<ReturnOrderTracking />} />
      </Routes>

      {!isDashboardPage && <Footer />}
    </div>
  );
};

const WrappedApp: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
