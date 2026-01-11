import axios from "axios";
import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  Check,
  AlertCircle,
  Package,
  DollarSign,
  Palette,
  Ruler,
  Image as ImageIcon,
  Tag,
  FileText,
  Save,
  Eye,
  RefreshCw,
  Info,
  Plus,
  Minus,
  Camera,
  Layers,
  ShoppingCart,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:5005/api";

interface SubCategory {
  id: number;
  name: string;
  states: string;
}

interface Category {
  id: number;
  name: string;
  states: string;
  subCategories: SubCategory[];
}

interface FormData {
  name: string;
  category: string;
  subcategory: string;
  price: string;
  description: string;
  selectedColors: string[];
  selectedSizes: string[];
  stockQuantity: string;
  images: File[];
}

interface ValidationErrors {
  name?: string;
  category?: string;
  subcategory?: string;
  price?: string;
  stockQuantity?: string;
  images?: string;
}

const AddProduct: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    category: "",
    subcategory: "",
    price: "",
    description: "",
    selectedColors: [],
    selectedSizes: [],
    stockQuantity: "",
    images: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const navigate = useNavigate();

  const colorOptions = [
    { name: "Red", hex: "#ef4444" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Yellow", hex: "#f59e0b" },
    { name: "Green", hex: "#10b981" },
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#ffffff", border: true },
    { name: "Gray", hex: "#6b7280" },
    { name: "Purple", hex: "#8b5cf6" },
    { name: "Orange", hex: "#f97316" },
    { name: "Beige", hex: "#d4b483" },
    { name: "Brown", hex: "#78350f" },
    { name: "Navy", hex: "#1e3a8a" },
    { name: "Maroon", hex: "#7f1d1d" },
    { name: "Teal", hex: "#0d9488" },
    { name: "Gold", hex: "#facc15" },
    { name: "Silver", hex: "#a8a29e" },
  ];

  const sizeOptions = ["S", "M", "L", "XL"];

  const steps = [
    { id: 1, name: "Basic Info", icon: Package },
    { id: 2, name: "Details", icon: FileText },
    { id: 3, name: "Images", icon: ImageIcon },
    { id: 4, name: "Review", icon: Eye },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get<Category[]>(`${API_BASE_URL}/Categories`);
        // Filter for active categories only (states === 'A')
        const activeCategories = res.data.filter((cat) => cat.states === "A");
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    } else if (formData.name.length < 3) {
      errors.name = "Product name must be at least 3 characters";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    if (!formData.subcategory) {
      errors.subcategory = "Subcategory is required";
    }

    if (!formData.price) {
      errors.price = "Price is required";
    } else {
      const numericPrice = parseFloat(formData.price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        errors.price = "Please enter a valid price greater than 0";
      }
    }

    if (!formData.stockQuantity) {
      errors.stockQuantity = "Stock quantity is required";
    } else {
      const numericStock = parseInt(formData.stockQuantity);
      if (isNaN(numericStock) || numericStock < 0) {
        errors.stockQuantity = "Please enter a valid stock quantity";
      }
    }

    if (formData.images.length === 0) {
      errors.images = "At least one product image is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleColorChange = (colorName: string) => {
    const newColors = formData.selectedColors.includes(colorName)
      ? formData.selectedColors.filter((color) => color !== colorName)
      : [...formData.selectedColors, colorName];

    handleInputChange("selectedColors", newColors);
  };

  const handleSizeChange = (size: string) => {
    const newSizes = formData.selectedSizes.includes(size)
      ? formData.selectedSizes.filter((s) => s !== size)
      : [...formData.selectedSizes, size];

    handleInputChange("selectedSizes", newSizes);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      toast.warning("Only image files are allowed");
    }

    const newImages = [...formData.images, ...imageFiles].slice(0, 5); // Limit to 5 images
    handleInputChange("images", newImages);

    // Create preview URLs
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews].slice(0, 5));

    if (validationErrors.images) {
      setValidationErrors((prev) => ({ ...prev, images: undefined }));
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);

    handleInputChange("images", newImages);
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setIsSubmitting(true);

    const numericPrice = parseFloat(formData.price);
    const numericStock = parseInt(formData.stockQuantity);

    const submitData = new FormData();
    submitData.append("Name", formData.name);
    submitData.append("CategoryName", formData.category);
    submitData.append("SubCategoryName", formData.subcategory);
    submitData.append("Stock", numericStock.toString());
    submitData.append("Price", numericPrice.toString());
    submitData.append(
      "Description",
      formData.description || "No description provided"
    );

    formData.selectedSizes.length > 0
      ? formData.selectedSizes.forEach((size) =>
          submitData.append("Sizes", size)
        )
      : submitData.append("Sizes", "Default");

    formData.selectedColors.length > 0
      ? formData.selectedColors.forEach((color) =>
          submitData.append("Colors", color)
        )
      : submitData.append("Colors", "Default");

    formData.images.forEach((image) => submitData.append("Images", image));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/Product/Addproduct`,
        submitData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        toast.success("Product added successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        setTimeout(() => {
          navigate("/Product");
        }, 2000);
      } else {
        toast.error(
          `Failed to add product: ${response.data.message || "Unknown error"}`
        );
      }
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all duration-200 ${
                      validationErrors.name
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    }`}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                  />
                </div>
                {validationErrors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all duration-200 appearance-none bg-white ${
                      validationErrors.category
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    }`}
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {validationErrors.category && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.category}
                  </p>
                )}
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subcategory *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.subcategory}
                    onChange={(e) =>
                      handleInputChange("subcategory", e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all duration-200 appearance-none bg-white ${
                      validationErrors.subcategory
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    }`}
                    disabled={!formData.category}
                  >
                    <option value="">Select subcategory</option>
                    {categories
                      .find((cat) => cat.name === formData.category)
                      ?.subCategories.filter((sub) => sub.states === "A")
                      .map((sub) => (
                        <option key={sub.id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {validationErrors.subcategory && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.subcategory}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (Rs.) *
                </label>
                <div className="relative">
                  
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all duration-200 ${
                      validationErrors.price
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    }`}
                    value={formData.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        handleInputChange("price", value);
                      }
                    }}
                    placeholder="0.00"
                  />
                </div>
                {validationErrors.price && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.price}
                  </p>
                )}
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <div className="relative">
                  <ShoppingCart className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.stockQuantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        handleInputChange("stockQuantity", value);
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all duration-200 ${
                      validationErrors.stockQuantity
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    }`}
                    placeholder="Enter quantity"
                  />
                </div>
                {validationErrors.stockQuantity && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.stockQuantity}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Color Selection */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Palette className="w-5 h-5 text-indigo-600" />
                <label className="text-sm font-semibold text-gray-700">
                  Available Colors
                </label>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 gap-4">
                {colorOptions.map((color) => (
                  <div
                    key={color.name}
                    className={`relative flex flex-col items-center cursor-pointer group transition-all duration-200 ${
                      formData.selectedColors.includes(color.name)
                        ? "transform scale-110"
                        : "hover:transform hover:scale-105"
                    }`}
                    onClick={() => handleColorChange(color.name)}
                  >
                    <div
                      className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 ${
                        color.border ? "border-2 border-gray-300" : ""
                      } ${
                        formData.selectedColors.includes(color.name)
                          ? "ring-4 ring-indigo-300 shadow-xl"
                          : "group-hover:shadow-xl"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {formData.selectedColors.includes(color.name) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs mt-2 text-gray-700 font-medium text-center">
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
              {formData.selectedColors.length > 0 && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <p className="text-sm font-medium text-indigo-700 mb-2">
                    Selected Colors:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedColors.map((color) => (
                      <span
                        key={color}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {color}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleColorChange(color);
                          }}
                          className="ml-2 hover:text-indigo-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Ruler className="w-5 h-5 text-indigo-600" />
                <label className="text-sm font-semibold text-gray-700">
                  Available Sizes
                </label>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeChange(size)}
                    className={`py-3 px-4 border-2 rounded-xl font-semibold transition-all duration-200 ${
                      formData.selectedSizes.includes(size)
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg transform scale-105"
                        : "bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {formData.selectedSizes.length > 0 && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-sm font-medium text-emerald-700 mb-2">
                    Selected Sizes:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedSizes.map((size) => (
                      <span
                        key={size}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                      >
                        {size}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSizeChange(size);
                          }}
                          className="ml-2 hover:text-emerald-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-600" />
                <label className="text-sm font-semibold text-gray-700">
                  Product Description (Optional)
                </label>
              </div>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 resize-none"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter a detailed description of your product..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Camera className="w-5 h-5 text-indigo-600" />
                <label className="text-sm font-semibold text-gray-700">
                  Product Images * (Max 5 images)
                </label>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : validationErrors.images
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleFiles(Array.from(e.target.files))
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700">
                      Drop your images here, or{" "}
                      <span className="text-indigo-600">browse</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </div>
                </div>
              </div>

              {validationErrors.images && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.images}
                </p>
              )}

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">
                    Selected Images ({previewImages.length}/5)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-md">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {index === 0 ? "Main" : `${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-indigo-600" />
                Review Product Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Product Name
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formData.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Category
                      </label>
                      <p className="font-semibold text-gray-900">
                        {formData.category}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Subcategory
                      </label>
                      <p className="font-semibold text-gray-900">
                        {formData.subcategory}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Price
                      </label>
                      <p className="text-xl font-bold text-indigo-600">
                        Rs. {formData.price}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Stock
                      </label>
                      <p className="font-semibold text-gray-900">
                        {formData.stockQuantity} units
                      </p>
                    </div>
                  </div>

                  {formData.selectedColors.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Colors
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.selectedColors.map((color) => (
                          <span
                            key={color}
                            className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-sm"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.selectedSizes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Sizes
                      </label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.selectedSizes.map((size) => (
                          <span
                            key={size}
                            className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Description
                      </label>
                      <p className="text-gray-900 mt-1">
                        {formData.description}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Product Images
                  </label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {previewImages.slice(0, 4).map((preview, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {previewImages.length > 4 && (
                    <p className="text-sm text-gray-500 mt-2">
                      +{previewImages.length - 4} more image
                      {previewImages.length - 4 > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <div className="w-64 bg-white shadow-lg fixed h-full z-10">
          <AdminSidebar />
        </div>
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <RefreshCw className="animate-spin text-6xl text-indigo-500 mx-auto" />
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Loading Form
              </h3>
              <p className="text-gray-600">Preparing the add product form...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-lg fixed h-full z-10">
        <AdminSidebar />
      </div>

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

      <div className="flex-1 ml-64 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/Product")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Add New Product
                </h1>
                <p className="text-gray-600 mt-1">
                  Create a new product for your inventory
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center space-x-3 ${
                        index < steps.length - 1 ? "flex-1" : ""
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="hidden sm:block">
                        <p
                          className={`text-sm font-medium ${
                            isActive ? "text-indigo-600" : "text-gray-500"
                          }`}
                        >
                          {step.name}
                        </p>
                      </div>
                    </div>

                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          isCompleted ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          {/* <form onSubmit={handleSubmit}> */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  navigate("/Product");
                }
              }}
              className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentStep > 1 ? "Previous" : "Cancel"}</span>
            </button>

            <div className="flex items-center space-x-4">
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Next</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              ) : (
                <form onSubmit={handleSubmit}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Creating Product...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Create Product</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
          {/* </form> */}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
