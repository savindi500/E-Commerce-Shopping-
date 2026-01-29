import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Check, 
  AlertCircle, 
  Layers, 
  Tag, 
  Save, 
  RefreshCw,
  Info,
  Sparkles,
  FolderPlus,
  CheckCircle,
  Trash2,
  Edit3,
  Eye,
  Package,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:5005/api";

interface SubCategory {
  id: string;
  name: string;
  description: string;
}

interface ValidationErrors {
  categoryName?: string;
  subCategories?: string;
}

const AddCategory: React.FC = () => {
  const navigate = useNavigate();
  
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryDescription, setCategoryDescription] = useState<string>("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([
    { id: "1", name: "", description: "" }
  ]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, name: "Category Info", icon: Layers, description: "Basic category details" },
    { id: 2, name: "Subcategories", icon: Tag, description: "Add subcategories" },
    { id: 3, name: "Review", icon: Eye, description: "Review and save" },
  ];

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!categoryName.trim()) {
      errors.categoryName = "Category name is required";
    } else if (categoryName.length < 2) {
      errors.categoryName = "Category name must be at least 2 characters";
    }

    const validSubCategories = subCategories.filter(sub => sub.name.trim());
    if (validSubCategories.length === 0) {
      errors.subCategories = "At least one subcategory is required";
    }

    // Check for duplicate subcategory names
    const subCategoryNames = validSubCategories.map(sub => sub.name.trim().toLowerCase());
    const uniqueNames = new Set(subCategoryNames);
    if (subCategoryNames.length !== uniqueNames.size) {
      errors.subCategories = "Subcategory names must be unique";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubCategoryChange = (id: string, field: 'name' | 'description', value: string) => {
    setSubCategories(prev => 
      prev.map(sub => 
        sub.id === id ? { ...sub, [field]: value } : sub
      )
    );

    // Clear validation errors when user starts typing
    if (validationErrors.subCategories) {
      setValidationErrors(prev => ({ ...prev, subCategories: undefined }));
    }
  };

  const addSubCategoryField = () => {
    const newId = (subCategories.length + 1).toString();
    setSubCategories(prev => [...prev, { id: newId, name: "", description: "" }]);
  };

  const removeSubCategoryField = (id: string) => {
    if (subCategories.length > 1) {
      setSubCategories(prev => prev.filter(sub => sub.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);

    const validSubCategories = subCategories
      .filter(sub => sub.name.trim())
      .map(sub => ({ 
        subCategoryName: sub.name.trim(),
        description: sub.description.trim() || `Subcategory for ${sub.name.trim()}`
      }));

    const data = {
      categoryName: categoryName.trim(),
      description: categoryDescription.trim() || `Category for ${categoryName.trim()} products`,
      subCategory: validSubCategories,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/Categories/AddCategory`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Category and subcategories added successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        
        setTimeout(() => {
          navigate("/Category");
        }, 2000);
      } else {
        toast.error("Failed to add category. Please try again.");
      }
    } catch (err: any) {
      console.error("Submit Error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data || "Failed to add category";
      toast.error(typeof errorMessage === 'string' ? errorMessage : "Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FolderPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create New Category</h3>
              <p className="text-gray-600">Start by defining your main category details</p>
            </div>

            <div className="space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name *
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all duration-200 ${
                      validationErrors.categoryName 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300 focus:border-indigo-500'
                    }`}
                    value={categoryName}
                    onChange={(e) => {
                      setCategoryName(e.target.value);
                      if (validationErrors.categoryName) {
                        setValidationErrors(prev => ({ ...prev, categoryName: undefined }));
                      }
                    }}
                    placeholder="Enter category name (e.g., Electronics, Clothing)"
                  />
                </div>
                {validationErrors.categoryName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationErrors.categoryName}
                  </p>
                )}
              </div>

              {/* Category Description */}
              

              {/* Category Preview */}
              {categoryName && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{categoryName}</h4>
                      <p className="text-sm text-gray-600">
                        {categoryDescription || `Category for ${categoryName} products`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-indigo-600">
                    <Sparkles className="w-4 h-4" />
                    <span>Category preview</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Subcategories</h3>
              <p className="text-gray-600">Define subcategories to organize your products better</p>
            </div>

            <div className="space-y-4">
              {subCategories.map((subCategory, index) => (
                <div
                  key={subCategory.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        Subcategory {index + 1}
                      </h4>
                    </div>
                    
                    {subCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubCategoryField(subCategory.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Remove subcategory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory Name *
                      </label>
                      <input
                        type="text"
                        value={subCategory.name}
                        onChange={(e) => handleSubCategoryChange(subCategory.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                        placeholder="Enter subcategory name"
                      />
                    </div>
                    
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={subCategory.description}
                        onChange={(e) => handleSubCategoryChange(subCategory.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
                        placeholder="Brief description"
                      />
                    </div> */}
                  </div>

                  {/* Subcategory Preview */}
                  {subCategory.name && (
                    <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-emerald-800">{subCategory.name}</span>
                      </div>
                      
                    </div>
                  )}
                </div>
              ))}

              {validationErrors.subCategories && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {validationErrors.subCategories}
                  </p>
                </div>
              )}

              {/* Add Subcategory Button */}
              <button
                type="button"
                onClick={addSubCategoryField}
                className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 group"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="font-medium">Add Another Subcategory</span>
              </button>
            </div>
          </div>
        );

      case 3:
        const validSubCategories = subCategories.filter(sub => sub.name.trim());
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Confirm</h3>
              <p className="text-gray-600">Review your category details before saving</p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-indigo-600" />
                Category Overview
              </h4>
              
              <div className="space-y-6">
                {/* Main Category */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900">{categoryName}</h5>
                      <p className="text-sm text-gray-600">
                        {categoryDescription || `Category for ${categoryName} products`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-indigo-600 mb-1">
                        <Tag className="w-4 h-4" />
                        <span className="text-sm font-medium">Subcategories</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{validSubCategories.length}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-emerald-600 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">Status</span>
                      </div>
                      <p className="text-sm font-semibold text-emerald-600">Ready to Create</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">Type</span>
                      </div>
                      <p className="text-sm font-semibold text-purple-600">Main Category</p>
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                <div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-4">Subcategories ({validSubCategories.length})</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {validSubCategories.map((subCategory, index) => (
                      <div key={subCategory.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-gray-900">{subCategory.name}</h6>
                            {subCategory.description && (
                              <p className="text-sm text-gray-600">{subCategory.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
                <h6 className="font-semibold text-gray-900">Category</h6>
                <p className="text-sm text-gray-600">1 main category</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Tag className="w-6 h-6 text-emerald-600" />
                </div>
                <h6 className="font-semibold text-gray-900">Subcategories</h6>
                <p className="text-sm text-gray-600">{validSubCategories.length} subcategories</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <h6 className="font-semibold text-gray-900">Status</h6>
                <p className="text-sm text-gray-600">Ready to save</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
                onClick={() => navigate("/Category")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
                <p className="text-gray-600 mt-1">Create a new category with subcategories</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                <Plus className="w-4 h-4" />
                <span>Creating</span>
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
                    <div className={`flex items-center space-x-3 ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="hidden sm:block">
                        <p className={`text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                          {step.name}
                        </p>
                        <p className="text-xs text-gray-400">{step.description}</p>
                      </div>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          
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
                    navigate("/Category");
                  }
                }}
                className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentStep > 1 ? 'Previous' : 'Cancel'}</span>
              </button>

              <div className="flex items-center space-x-4">
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={currentStep === 1 && !categoryName.trim()}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
                        <span>Creating Category...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Create Category</span>
                      </>
                    )}
                    </button>
                    </form>
                )}
              </div>
            </div>
          

          {/* Help Section */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Tips for Creating Categories</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Choose clear, descriptive names for your categories</li>
                  <li>• Add subcategories to help organize products better</li>
                  <li>• Use consistent naming conventions across categories</li>
                  <li>• Consider how customers will search for products</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;