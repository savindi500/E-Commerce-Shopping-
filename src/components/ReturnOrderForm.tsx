import React, { useState } from "react";
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  Mail,
  Calendar,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  RefreshCw,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ReturnFormData {
  orderID: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  orderDate: string;
  reason: string;
  otherReason: string;
  productCondition: string;
  comment: string;
  imageUrl: string;
  photos: File[];
  termsAccepted: boolean;
}

const returnReasons = [
  { value: "defective", label: "Product is defective or damaged" },
  { value: "wrong-item", label: "Received wrong item" },
  { value: "not-as-described", label: "Item not as described" },
  { value: "size-issue", label: "Size/fit issue" },
  { value: "changed-mind", label: "Changed my mind" },
  { value: "quality-issues", label: "Quality not as expected" },
  { value: "other", label: "Other reason" },
];

const productConditions = [
  {
    value: "unopened",
    label: "Unopened/Unused",
    description: "Product is in original packaging and unused",
  },
  {
    value: "opened-unused",
    label: "Opened but Unused",
    description: "Package opened but product not used",
  },
  {
    value: "lightly-used",
    label: "Lightly Used",
    description: "Used once or twice, excellent condition",
  },
  {
    value: "used",
    label: "Used",
    description: "Used several times but in good condition",
  },
  {
    value: "damaged",
    label: "Damaged",
    description: "Product has defects or damage",
  },
];

const ReturnOrderForm: React.FC = () => {
  const [formData, setFormData] = useState<ReturnFormData>({
    orderID: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    orderDate: "",
    reason: "",
    otherReason: "",
    productCondition: "",
    comment: "",
    imageUrl: "",
    photos: [],
    termsAccepted: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string>("");
  const [previewImages, setPreviewImages] = useState<string[]>([]);


  const totalSteps = 4;

  // === UPDATED validateStep FUNCTION ===
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        // if (!formData.orderID.trim()) {
        //   newErrors.orderID = "Order ID is required";
        // } else if (!/^\d{3,}$|^ORD-\d{3,}$/i.test(formData.orderID)) {
        //   newErrors.orderID =
        //     'Order ID format should be like "12345" or "ORD-12345"';
        // }

        if (!formData.fullName.trim()) {
          newErrors.fullName = "Customer name is required";
        } else if (!/^[A-Za-z ]{3,}$/.test(formData.fullName.trim())) {
          newErrors.fullName = "Enter a valid full name";
        }

        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          newErrors.email = "Invalid email format";
        }

        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = "Phone number must be exactly 10 digits";
        }

        if (!formData.orderDate) {
          newErrors.orderDate = "Order date is required";
        }
        break;

      case 2:
        if (!formData.reason) {
          newErrors.reason = "Please select a return reason";
        }
        if (formData.reason === "other" && !formData.otherReason.trim()) {
          newErrors.otherReason = "Please specify the reason";
        } else if (
          formData.reason === "other" &&
          formData.otherReason.length < 10
        ) {
          newErrors.otherReason = "Reason must be at least 10 characters";
        }

        if (!formData.productCondition) {
          newErrors.productCondition = "Please select product condition";
        }
        break;

      case 3:
        if (formData.photos.some((file) => !file.type.startsWith("image/"))) {
          newErrors.photos = "Only image files are allowed";
        }
        if (formData.photos.length > 5) {
          newErrors.photos = "You can upload a maximum of 5 images";
        }
        break;

      case 4:
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = "Please accept the terms and conditions";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Other handlers remain unchanged, for brevity:
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

 const handleFiles = (files: FileList | File[]) => {
   const fileArray = Array.from(files);
   const imageFiles = fileArray.filter((file) =>
     file.type.startsWith("image/")
   );

   if (imageFiles.length !== fileArray.length) {
     toast.warning("Only image files are allowed");
   }

   // Only keep the first image
   const firstImage = imageFiles.slice(0, 1);

   const newPreviews = firstImage.map((file) => URL.createObjectURL(file));

   setFormData((prev) => ({
     ...prev,
     photos: firstImage,
   }));
   setPreviewImages(newPreviews);

   if (errors.photos) {
     setErrors((prev) => ({ ...prev, photos: "" }));
   }
 };


  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      photos: newPhotos,
    }));
    setPreviewImages(newPreviews);
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
  handleFiles(e.dataTransfer.files);
};


 const uploadPhotosToServer = async (photos: File[]): Promise<string> => {
   if (photos.length === 0) return "";

   const file = photos[0]; // Only 1 image allowed
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.onload = () => resolve(reader.result as string);
     reader.onerror = (error) => reject(error);
     reader.readAsDataURL(file);
   });
 };



  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("OrderID", formData.orderID); // Note: keys must match your C# model property names
      formDataToSend.append("FullName", formData.fullName);
      formDataToSend.append("Email", formData.email);
      formDataToSend.append("PhoneNumber", formData.phoneNumber);
      formDataToSend.append(
        "Reason",
        formData.reason === "other" ? formData.otherReason : formData.reason
      );
      formDataToSend.append("ProductCondition", formData.productCondition);
      formDataToSend.append("Comment", formData.comment || "");

      if (formData.photos.length > 0) {
        formDataToSend.append("imageFile", formData.photos[0]);
      }

      // Don't set Content-Type manually; axios will set to multipart/form-data automatically with boundary
      await axios.post(
        "http://localhost:5005/api/ReturnRequest/submit",
        formDataToSend
      );

      toast.success("Return request submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      setSubmittedOrderId(formData.orderID);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Detailed submission error:", {
        message: error.message,
        response: error.response?.data,
      });

      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit return request. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  const getStepIcon = (step: number) => {
    if (step < currentStep)
      return <CheckCircle className="w-6 h-6 text-emerald-600" />;
    if (step === currentStep)
      return (
        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {step}
        </div>
      );
    return (
      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold">
        {step}
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <ToastContainer />
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Return Request Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Your return request has been successfully submitted. We'll review
            your request and contact you within 24-48 hours.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID:</p>
            <p className="text-lg font-bold text-indigo-600">
              {submittedOrderId}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Please keep this Order ID for your records. You can use it to
              track your return status.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              Submit Another Return
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Return Order
                </h1>
                <p className="text-gray-600">
                  Submit a return request for your order
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">
                Secure & Protected
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  {getStepIcon(step)}
                  <span
                    className={`text-xs mt-2 font-medium ${
                      step <= currentStep ? "text-indigo-600" : "text-gray-400"
                    }`}
                  >
                    Step {step}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full ${
                      step < currentStep ? "bg-emerald-200" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentStep === 1 && "Order Information"}
              {currentStep === 2 && "Return Details"}
              {currentStep === 3 && "Upload Photos"}
              {currentStep === 4 && "Review & Submit"}
            </h2>
            <p className="text-gray-600 mt-1">
              {currentStep === 1 && "Enter your order and contact details"}
              {currentStep === 2 && "Tell us why you want to return this item"}
              {currentStep === 3 && "Add photos of the product (optional)"}
              {currentStep === 4 && "Review your information and submit"}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8">
            {/* Step 1: Order Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order ID *
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g., 12345 or ORD-12345"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                        errors.orderID
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      value={formData.orderID}
                      onChange={(e) =>
                        handleInputChange("orderID", e.target.value)
                      }
                    />
                  </div>
                  {errors.orderID && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.orderID}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the Order ID from your purchase confirmation email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                        errors.orderDate
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      value={formData.orderDate}
                      onChange={(e) =>
                        handleInputChange("orderDate", e.target.value)
                      }
                    />
                  </div>
                  {errors.orderDate && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.orderDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                        errors.fullName
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-600 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                          errors.email
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Your phone number"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                          errors.phoneNumber
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Return Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Reason for Return *
                  </label>
                  <div className="space-y-3">
                    {returnReasons.map((reason) => (
                      <div key={reason.value} className="flex items-center">
                        <input
                          type="radio"
                          id={reason.value}
                          name="reason"
                          value={reason.value}
                          checked={formData.reason === reason.value}
                          onChange={(e) =>
                            handleInputChange("reason", e.target.value)
                          }
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <label
                          htmlFor={reason.value}
                          className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {reason.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.reason && (
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.reason}
                    </p>
                  )}
                </div>

                {formData.reason === "other" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Please specify the reason *
                    </label>
                    <textarea
                      placeholder="Please describe your reason for return..."
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none ${
                        errors.otherReason
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      rows={3}
                      value={formData.otherReason}
                      onChange={(e) =>
                        handleInputChange("otherReason", e.target.value)
                      }
                    />
                    {errors.otherReason && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.otherReason}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Product Condition *
                  </label>
                  <div className="space-y-3">
                    {productConditions.map((condition) => (
                      <div
                        key={condition.value}
                        className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          formData.productCondition === condition.value
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            id={condition.value}
                            name="productCondition"
                            value={condition.value}
                            checked={
                              formData.productCondition === condition.value
                            }
                            onChange={(e) =>
                              handleInputChange(
                                "productCondition",
                                e.target.value
                              )
                            }
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-1"
                          />
                          <div className="ml-3">
                            <label
                              htmlFor={condition.value}
                              className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              {condition.label}
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                              {condition.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.productCondition && (
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.productCondition}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    placeholder="Any additional details about your return..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none"
                    rows={4}
                    value={formData.comment}
                    onChange={(e) =>
                      handleInputChange("comment", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            {/* Step 3: Photo Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Camera className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Product Photos
                  </h3>
                  <p className="text-gray-600">
                    Adding photos helps us process your return faster (optional
                    but recommended)
                  </p>
                </div>

                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                    dragActive
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Drag & drop photos here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Or click to browse files (Max 5 photos, 10MB each)
                  </p>
                  <label className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span>Choose Files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFiles(e.target.files);
                        }
                      }}
                    />
                  </label>
                </div>

                {previewImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Uploaded Photos ({previewImages.length}/5)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {previewImages.map((src, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={src}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                            {formData.photos[index]?.name.length > 15
                              ? `${formData.photos[index].name.substring(
                                  0,
                                  15
                                )}...`
                              : formData.photos[index]?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <FileText className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Review Your Return Request
                  </h3>
                  <p className="text-gray-600">
                    Please review all information before submitting your return
                    request
                  </p>
                </div>

                {/* Review Cards */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Package className="w-5 h-5 mr-2 text-indigo-600" />
                      Order Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Order ID:</span>
                        <span className="ml-2 font-medium">
                          {formData.orderID}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Order Date:</span>
                        <span className="ml-2 font-medium">
                          {formData.orderDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Customer:</span>
                        <span className="ml-2 font-medium">
                          {formData.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-medium">
                          {formData.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="ml-2 font-medium">
                          {formData.phoneNumber}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                      Return Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Reason:</span>
                        <span className="ml-2 font-medium">
                          {
                            returnReasons.find(
                              (r) => r.value === formData.reason
                            )?.label
                          }
                        </span>
                      </div>
                      {formData.otherReason && (
                        <div>
                          <span className="text-gray-600">Details:</span>
                          <span className="ml-2 font-medium">
                            {formData.otherReason}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">
                          Product Condition:
                        </span>
                        <span className="ml-2 font-medium">
                          {
                            productConditions.find(
                              (c) => c.value === formData.productCondition
                            )?.label
                          }
                        </span>
                      </div>
                      {formData.comment && (
                        <div>
                          <span className="text-gray-600">
                            Additional Comments:
                          </span>
                          <p className="mt-1 text-gray-900">
                            {formData.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.photos.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Camera className="w-5 h-5 mr-2 text-green-600" />
                        Uploaded Photos ({formData.photos.length})
                      </h4>
                      <div className="flex space-x-2">
                        {formData.photos.map((file, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(file)}
                            alt={`Photo ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Return Policy
                  </h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>
                      • Returns must be initiated within 30 days of purchase
                    </p>
                    <p>• Items must be in their original condition</p>
                    <p>• Return processing takes 5-7 business days</p>
                    <p>• Refund will be processed to original payment method</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.termsAccepted}
                    onChange={(e) =>
                      handleInputChange("termsAccepted", e.target.checked)
                    }
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    I acknowledge that I have read and agree to the return
                    policy and terms of service. I confirm that all information
                    provided is accurate and complete.
                  </label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-red-600 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.termsAccepted}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Form Navigation */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="inline-flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <span>Next</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-800 to-blue-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit Return Request</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnOrderForm;
