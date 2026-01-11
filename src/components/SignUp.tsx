import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

// Update with your image path
import signupImage from "../assets/login.jpg";

interface FormData {
  Username: string;
  Email: string;
  Password: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    Username: "",
    Email: "",
    Password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:5005/api/Users/register",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-900">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-100 dark:bg-gray-800">
        <img
          src={signupImage}
          alt="Sign up visual"
          className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent flex items-center pl-12">
          <div className="text-white max-w-md">
            <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-xl text-gray-200">
              Start your journey with us today
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Page Header */}
        <header className="px-8 pt-12 pb-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white"
          >
            Create Account
          </motion.h1>
        </header>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md space-y-8"
          >
            {/* Form Header */}
            <div className="space-y-2">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-semibold text-gray-800 dark:text-gray-200"
              >
                Get Started
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 dark:text-gray-400"
              >
                Create your account to continue
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

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400 mr-3" />
                <span className="text-sm text-green-700 dark:text-green-100">
                  Registration successful! Redirecting to login...
                </span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="Username"
                    value={formData.Username}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border-b border-gray-300 dark:border-gray-600 bg-transparent focus:border-gray-900 dark:focus:border-gray-100 focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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

              {/* Terms Checkbox */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(!termsAccepted)}
                    className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:ring-gray-500 dark:focus:ring-gray-600 text-gray-700 dark:text-gray-300"
                  />
                </div>
                <label
                  htmlFor="terms"
                  className="ml-3 block text-sm text-gray-700 dark:text-gray-300"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline"
                  >
                    terms and conditions
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading || success}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors ${
                  isLoading || success ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Creating account...
                  </>
                ) : success ? (
                  <>
                    Account Created <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
