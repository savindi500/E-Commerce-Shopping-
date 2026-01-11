import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// Add your right-side image to your assets or use a URL
import loginImage from "../assets/login.jpg"; // Replace with your image path

interface FormData {
  Email: string;
  Password: string;
}

const CustomerLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    Email: "",
    Password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5005/api/Users/login",
        JSON.stringify(formData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const token = response.data.token;
      localStorage.setItem("token", token);

      const role = response.data.user.role;
      localStorage.setItem("userRole", role);
      const email = response.data.user.email;
      localStorage.setItem("email", email);

      const username = response.data.user.username;
      localStorage.setItem("userName", username);

      const userID = response.data.user.userID;
      localStorage.setItem("userID", userID.toString());

      if (role.toLowerCase() === "admin") {
        navigate("/Admindashboard");
      } else if (role.toLowerCase() === "customer") {
        navigate("/Herosection");
      } else if (role.toLowerCase() === "staff") {
        navigate("/Product");
      } else {
        navigate("/unauthorized");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid credentials. Please check your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-900">
      {/* Left Side - Image (now on left) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-100 dark:bg-gray-800">
        <img
          src={loginImage}
          alt="Decorative"
          className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex items-center pl-12">
          <div className="text-white max-w-md">
            <h2 className="text-4xl font-bold mb-4">Welcome to Liyara</h2>
            <p className="text-xl text-gray-200">Your journey begins here</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Page Header with increased spacing */}
        <header className="px-8 pt-12 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white"
          >
            
          </motion.h1>
        </header>

        {/* Form Container with increased gap from page header */}
        <div className="flex-1 flex items-center justify-center px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md space-y-8"
          >
            {/* Form Header with increased gap */}
            <div className="space-y-2">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-semibold text-gray-800 dark:text-gray-200"
              >
                Welcome Back
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 dark:text-gray-400"
              >
                Sign in to continue your journey
              </motion.p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg"
              >
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" />
                <span className="text-sm text-red-700 dark:text-red-100">
                  {error}
                </span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border-b border-gray-300 dark:border-gray-600 bg-transparent focus:border-gray-900 dark:focus:border-gray-100 focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="Password"
                    value={formData.Password}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-10 py-3 border-b border-gray-300 dark:border-gray-600 bg-transparent focus:border-gray-900 dark:focus:border-gray-100 focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                

                <Link
                  to="/ResetPassword"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Create one now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;