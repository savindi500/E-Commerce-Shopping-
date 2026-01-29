import axios from "axios";
import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useNavigate, useParams } from "react-router-dom";
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
  Camera,
  Layers,
  ShoppingCart,
  Edit3,
  Lock,
  Unlock,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:5005/api";

interface ProductForm {
  name: string;
  price: string;
  stock: string;
  category: string;
  subcategory: string;
  selectedColors: string[];
  selectedSizes: string[];
  images: File[];
  description: string;
  isCategoryLocked: boolean;
}

interface ValidationErrors {
  name?: string;
  category?: string;
  subcategory?: string;
  price?: string;
  stock?: string;
  selectedColors?: string;
  selectedSizes?: string;
  images?: string;
}

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

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    price: "",
    stock: "",
    category: "",
    subcategory: "",
    selectedColors: [],
    selectedSizes: [],
    images: [],
    description: "",
    isCategoryLocked: true,
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [subCategoryList, setSubCategoryList] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [keepExistingImage, setKeepExistingImage] = useState<boolean>(true);
  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      name: "Basic Info",
      icon: Package,
      description: "Product details",
    },
    { id: 2, name: "Attributes", icon: Palette, description: "Colors & sizes" },
    { id: 3, name: "Images", icon: ImageIcon, description: "Product photos" },
    { id: 4, name: "Review", icon: Eye, description: "Final review" },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get<string[]>(
          `${API_BASE_URL}/Product/api/category/names`
        );
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        toast.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!formData.category) {
      setSubCategoryList([]);
      setFormData((prev) => ({ ...prev, subcategory: "" }));
      return;
    }

    const fetchSubcategories = async () => {
      try {
        const res = await axios.get<string[]>(
          `${API_BASE_URL}/Product/api/category/subcategories`,
          { params: { categoryName: formData.category } }
        );
        setSubCategoryList(res.data);
      } catch (err) {
        console.error("Failed to fetch subcategories", err);
        setSubCategoryList([]);
        toast.error("Failed to fetch subcategories");
      }
    };
    fetchSubcategories();
  }, [formData.category]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError("");

        const res = await axios.get(
          `${API_BASE_URL}/Product/GetProductDetails/${id}`
        );
        const p = res.data;

        setFormData({
          name: p.name || "",
          price: p.price?.toString() || "0",
          stock: p.stock?.toString() || "0",
          category: p.categoryName || "",
          subcategory: p.subCategoryName || "",
          selectedColors: p.colors || [],
          selectedSizes: p.sizes || [],
          images: [],
          description: p.description || "",
          isCategoryLocked: true,
        });

        if (p.images && p.images.length > 0) {
          setCurrentImages(p.images);
        }

        setKeepExistingImage(true);
        toast.success("Product data loaded successfully!");
      } catch (err) {
        console.error(err);
        setError("Failed to load product data. Please try again.");
        toast.error("Failed to load product data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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

    const numericPrice = parseFloat(formData.price);
    if (!formData.price || isNaN(numericPrice) || numericPrice <= 0) {
      errors.price = "Please enter a valid price greater than 0";
    }

    const numericStock = parseInt(formData.stock);
    if (!formData.stock || isNaN(numericStock) || numericStock < 0) {
      errors.stock = "Please enter a valid stock quantity";
    }

    if (formData.selectedColors.length === 0) {
      errors.selectedColors = "Please select at least one color";
    }

    if (formData.selectedSizes.length === 0) {
      errors.selectedSizes = "Please select at least one size";
    }

    if (
      !keepExistingImage &&
      formData.images.length === 0 &&
      currentImages.length === 0
    ) {
      errors.images = "At least one product image is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof ProductForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      handleInputChange("price", value);
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      handleInputChange("stock", value);
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

    const newImages = [...formData.images, ...imageFiles].slice(0, 5);
    handleInputChange("images", newImages);

    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 5));

    setKeepExistingImage(false);

    if (validationErrors.images) {
      setValidationErrors((prev) => ({ ...prev, images: undefined }));
    }
  };

  const removeNewImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = newImagePreviews.filter((_, i) => i !== index);

    handleInputChange("images", newImages);
    setNewImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);

    const numericPrice = parseFloat(formData.price);
    const numericStock = parseInt(formData.stock);

    const data = new FormData();
    data.append("Name", formData.name);
    data.append("CategoryName", formData.category);
    data.append("SubCategoryName", formData.subcategory);
    data.append("Stock", numericStock.toString());
    data.append("Price", numericPrice.toString());
    data.append("Description", formData.description);
    data.append("ProductID", id ?? "0");
    data.append("KeepExistingImage", keepExistingImage.toString());

    formData.selectedColors.forEach((c) => data.append("Colors", c));
    formData.selectedSizes.forEach((s) => data.append("Sizes", s));

    if (formData.images.length > 0 && !keepExistingImage) {
      formData.images.forEach((img) => data.append("Images", img));
    }

    try {
      await axios.put(`${API_BASE_URL}/Product/UpdateProduct`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => navigate("/Product"), 2000);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message;
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      toast.error("Failed to update product. Please try again.");
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isCategoryLocked: !prev.isCategoryLocked,
                      }))
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    {formData.isCategoryLocked ? (
                      <>
                        <Unlock className="w-3 h-3 mr-1" />
                        Unlock
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Lock
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all duration-200 appearance-none ${
                      validationErrors.category
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    } ${
                      formData.isCategoryLocked
                        ? "bg-gray-100 cursor-not-allowed"
                        : "bg-white"
                    }`}
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    disabled={formData.isCategoryLocked}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
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
                  {formData.isCategoryLocked && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Locked with category)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.subcategory}
                    onChange={(e) =>
                      handleInputChange("subcategory", e.target.value)
                    }
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all duration-200 appearance-none ${
                      validationErrors.subcategory
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    } ${
                      formData.isCategoryLocked
                        ? "bg-gray-100 cursor-not-allowed"
                        : "bg-white"
                    }`}
                    disabled={formData.isCategoryLocked || !formData.category}
                  >
                    <option value="">Select subcategory</option>
                    {formData.category &&
                      subCategoryList.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
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
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all duration-200 ${
                      validationErrors.price
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    }`}
                    value={formData.price}
                    onChange={handlePriceChange}
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
                    value={formData.stock}
                    onChange={handleStockChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all duration-200 ${
                      validationErrors.stock
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-indigo-500"
                    }`}
                    placeholder="Enter quantity"
                  />
                </div>
                {validationErrors.stock && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.stock}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      // ... rest of your case statements (2, 3, 4) remain the same ...
      case 2:
        return (
          <div className="space-y-8">
            {/* Color Selection */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Palette className="w-5 h-5 text-indigo-600" />
                <label className="text-sm font-semibold text-gray-700">
                  Available Colors *
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
              {validationErrors.selectedColors && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.selectedColors}
                </p>
              )}
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
                  Available Sizes *
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
              {validationErrors.selectedSizes && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {validationErrors.selectedSizes}
                </p>
              )}
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
            {/* Current Images */}
            {currentImages.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                    <label className="text-sm font-semibold text-gray-700">
                      Current Images
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="keep-image"
                      type="checkbox"
                      checked={keepExistingImage}
                      onChange={(e) => setKeepExistingImage(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="keep-image"
                      className="text-sm font-medium text-gray-700"
                    >
                      Keep current images
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {currentImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div
                        className={`aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-md transition-all duration-200 ${
                          keepExistingImage
                            ? "ring-2 ring-emerald-300"
                            : "opacity-50"
                        }`}
                      >
                        <img
                          src={`http://localhost:5005${imageUrl}`}
                          alt={`Thumbnail ${index}`}
                          className="w-full object-cover object-top"
                        />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {index === 0 ? "Main" : `${index + 1}`}
                      </div>
                      {keepExistingImage && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Upload */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Camera className="w-5 h-5 text-indigo-600" />
                <label className="text-sm font-semibold text-gray-700">
                  {keepExistingImage
                    ? "Add New Images (Optional)"
                    : "Upload New Images *"}
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
                      Drop new images here, or{" "}
                      <span className="text-indigo-600">browse</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG, GIF up to 10MB each (Max 5 images)
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

              {/* New Image Previews */}
              {newImagePreviews.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">
                    New Images ({newImagePreviews.length}/5)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-md">
                          <img
                            src={preview}
                            alt={`New Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          New {index + 1}
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
                Review Product Changes
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
                        {formData.stock} units
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
                    Images
                  </label>
                  <div className="space-y-4 mt-2">
                    {keepExistingImage && currentImages.length > 0 && (
                      <div>
                        <p className="text-xs text-emerald-600 font-medium mb-2">
                          Current Images (Keeping)
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {currentImages.slice(0, 4).map((imageUrl, index) => (
                            <div
                              key={index}
                              className="bg-gray-100 rounded-lg overflow-hidden border-2 border-emerald-200"
                            >
                              <img
                          src={`http://localhost:5005${imageUrl}`}
                          alt={`Thumbnail ${index}`}
                          className="w-full object-cover object-top"
                        />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {newImagePreviews.length > 0 && (
                      <div>
                        <p className="text-xs text-indigo-600 font-medium mb-2">
                          New Images
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {newImagePreviews
                            .slice(0, 4)
                            .map((preview, index) => (
                              <div
                                key={index}
                                className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-indigo-200"
                              >
                                <img
                                  src={preview}
                                  alt={`New ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
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
                Loading Product
              </h3>
              <p className="text-gray-600">Fetching product details...</p>
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
                type="button"
                onClick={() => navigate("/Product")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Edit Product
                </h1>
                <p className="text-gray-600 mt-1">
                  Update product information and settings
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                <Edit3 className="w-4 h-4" />
                <span>Editing</span>
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
                        <p className="text-xs text-gray-400">
                          {step.description}
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
          <div>
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

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => {
                    if (validateForm()) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      const firstError = Object.keys(validationErrors)[0];
                      if (firstError) {
                        const element = document.querySelector(
                          `[name="${firstError}"]`
                        );
                        element?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }
                      toast.error(
                        "Please fix all validation errors before proceeding",
                        {
                          position: "top-center",
                          autoClose: 5000,
                        }
                      );
                    }
                  }}
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
                        <span>Updating Product...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Update Product</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Update Error
                  </h3>
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

export default EditProduct;
