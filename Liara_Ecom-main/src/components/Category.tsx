import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import {
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Eye,
  Filter,
  RefreshCw,
  Tag,
  Layers,
  FolderOpen,
  Folder,
  AlertCircle,
  CheckCircle,
  Package,
  FolderPlus,
  X,
  Power,
  PowerOff,
  Activity,
  ToggleLeft,
  ToggleRight,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Category {
  id: number;
  name: string;
  description?: string;
  productCount?: number;
  status?: "active" | "inactive";
  states?: "A" | "I";
  createdAt?: string;
}

interface SubCategory {
  id: number;
  name: string;
  description?: string;
  productCount?: number;
  status?: "active" | "inactive";
  states?: "A" | "I";
  categoryId?: number;
}

const CategoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<{
    [key: number]: SubCategory[];
  }>({});
  const [expandedCategories, setExpandedCategories] = useState<{
    [key: number]: boolean;
  }>({});
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStates, setUpdatingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [newSubName, setNewSubName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const statusOptions = ["All", "Active", "Inactive"];

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddSubcategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setShowAddSubModal(true);
    setNewSubName("");
  };

  const handleAddSubcategory = async () => {
    if (!selectedCategoryId || newSubName.trim() === "") {
      toast.error("Subcategory name is required");
      return;
    }

    const category = categories.find((c) => c.id === selectedCategoryId);
    if (!category) {
      toast.error("Category not found");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get existing subcategories for this category
      const existingSubs =
        subCategories[selectedCategoryId]?.map((s) => s.name) || [];

      // Check for duplicate subcategory names
      if (
        existingSubs.some(
          (name) => name.toLowerCase() === newSubName.trim().toLowerCase()
        )
      ) {
        toast.error("Subcategory with this name already exists");
        return;
      }

      // Create the updated list of subcategory names
      const updatedSubNames = [...existingSubs, newSubName.trim()];

      // Prepare the request body with all required fields
      const requestBody = {
        categoryName: category.name,
        subCategoryNames: updatedSubNames,
        states: "A", // Default to active state for new subcategories
      };

      console.log("Sending request with:", requestBody);

      // Call the backend API
      const response = await axios.put(
        "http://localhost:5005/api/Categories/UpdateSubCategories",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      toast.success("Subcategory added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Refresh subcategories for this category to get the latest data
      await fetchSubcategories(selectedCategoryId, true);

      setShowAddSubModal(false);
      setNewSubName("");
      setSelectedCategoryId(null);
    } catch (err: any) {
      console.error("Error adding subcategory:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      let errorMessage = "Failed to add subcategory. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data) {
        errorMessage =
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setShowAddSubModal(false);
      setNewSubName("");
      setSelectedCategoryId(null);
    }
  };

  const loadCategories = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      setError("");

      const response = await axios.get("http://localhost:5005/api/Categories");

      // Map backend data to frontend format
      const mappedCategories = response.data.map((category: any) => ({
        id: category.categoryID || category.id,
        name: category.categoryName || category.name,
        description:
          category.description ||
          `Category for ${category.categoryName || category.name}`,
        states: category.states,
        status: category.states === "A" ? "active" : "inactive",
        createdAt: category.createdAt || category.dateCreated,
        productCount: category.productCount || 0,
      }));

      setCategories(mappedCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        "Failed to fetch categories. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const fetchSubcategories = async (
    categoryId: number,
    forceRefresh = false
  ) => {
    if (!subCategories[categoryId] || forceRefresh) {
      try {
        const response = await axios.get(
          `http://localhost:5005/api/Categories/SubCategories/${categoryId}`
        );

        console.log("Raw subcategory response:", response.data);

        // Map backend subcategory data to frontend format
        // Backend returns: { id, name, state }
        const mappedSubCategories = response.data.map((subCategory: any) => ({
          id: subCategory.id,
          name: subCategory.name,
          description:
            subCategory.description || `Subcategory for ${subCategory.name}`,
          states: subCategory.state,
          status: subCategory.state === "A" ? "active" : "inactive",
          categoryId: categoryId,
          productCount: subCategory.productCount || 0,
        }));

        console.log("Mapped subcategories:", mappedSubCategories);
        setSubCategories((prev) => ({
          ...prev,
          [categoryId]: mappedSubCategories,
        }));
      } catch (err) {
        console.error("Error fetching subcategories:", err);
        toast.error("Failed to fetch subcategories");
      }
    }
  };

  const handleToggleSubcategories = async (categoryId: number) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

    // Always fetch subcategories when expanding to ensure we have the latest data
    if (!expandedCategories[categoryId]) {
      await fetchSubcategories(categoryId, true);
    }
  };

  const handleToggleCategoryStatus = async (
    categoryId: number,
    currentStatus: string
  ) => {
    const newState = currentStatus === "active" ? "I" : "A";
    const newStatus = newState === "A" ? "active" : "inactive";

    setUpdatingStates((prev) => ({
      ...prev,
      [`category-${categoryId}`]: true,
    }));

    try {
      const response = await axios.put(
        `http://localhost:5005/api/Categories/${categoryId}/state?state=${newState}`
      );

      // Update category status
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, status: newStatus, states: newState }
            : cat
        )
      );

      toast.success(
        `Category ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );

      // Refresh subcategories to get the latest state from backend
      if (subCategories[categoryId]) {
        await fetchSubcategories(categoryId, true);
      }
    } catch (err: any) {
      console.error("Error updating category status:", err);

      // Handle specific error for deactivating category with active subcategories
      if (
        err.response?.data?.message &&
        err.response.data.message.includes("subcategories are still active")
      ) {
        toast.error(
          "Cannot deactivate category. One or more subcategories are still active."
        );
      } else {
        toast.error("Failed to update category status. Please try again.");
      }
    } finally {
      setUpdatingStates((prev) => ({
        ...prev,
        [`category-${categoryId}`]: false,
      }));
    }
  };

  const handleToggleSubcategoryStatus = async (
    categoryId: number,
    subCategoryId: number,
    currentStatus: string
  ) => {
    const newState = currentStatus === "active" ? "I" : "A";
    const newStatus = newState === "A" ? "active" : "inactive";

    setUpdatingStates((prev) => ({
      ...prev,
      [`subcategory-${subCategoryId}`]: true,
    }));

    try {
      // Call the backend API to update subcategory state
      const response = await axios.put(
        `http://localhost:5005/api/Categories/SubCategory/${subCategoryId}/state?state=${newState}`
      );

      console.log("Subcategory update response:", response.data);

      toast.success(
        `Subcategory ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );

      // Refresh subcategories to ensure we have the latest data
      await fetchSubcategories(categoryId, true);
    } catch (err: any) {
      console.error("Error updating subcategory status:", err);

      let errorMessage =
        "Failed to update subcategory status. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMessage = "Subcategory not found or update failed.";
      }

      toast.error(errorMessage);
    } finally {
      setUpdatingStates((prev) => ({
        ...prev,
        [`subcategory-${subCategoryId}`]: false,
      }));
    }
  };

  const handleAddCategory = () => {
    navigate("/Addcategory");
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && category.status === "active") ||
      (statusFilter === "Inactive" && category.status === "inactive");

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    return status === "active" ? (
      <CheckCircle className="w-4 h-4 text-emerald-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-amber-600" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : "bg-amber-100 text-amber-800 border-amber-200";
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <div className="inline-flex items-center space-x-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium">Active</span>
      </div>
    ) : (
      <div className="inline-flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
        <span className="text-xs font-medium">Inactive</span>
      </div>
    );
  };

  const getToggleButton = (
    status: string,
    isUpdating: boolean,
    onClick: () => void,
    disabled: boolean = false
  ) => {
    return (
      <button
        onClick={onClick}
        disabled={isUpdating || disabled}
        className={`relative inline-flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
          status === "active"
            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
            : "bg-gray-300 text-gray-700 hover:bg-gray-400 shadow-sm"
        } ${
          isUpdating || disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer"
        }`}
        title={
          disabled
            ? "Cannot change status"
            : `Click to ${status === "active" ? "deactivate" : "activate"}`
        }
      >
        {isUpdating ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : status === "active" ? (
          <Power className="w-4 h-4" />
        ) : (
          <PowerOff className="w-4 h-4" />
        )}
        <span className="text-xs font-medium">
          {status === "active" ? "Active" : "Inactive"}
        </span>
      </button>
    );
  };

  const categoryStats = {
    total: categories.length,
    active: categories.filter((c) => c.status === "active").length,
    inactive: categories.filter((c) => c.status === "inactive").length,
    totalProducts: categories.reduce(
      (sum, c) => sum + (c.productCount || 0),
      0
    ),
    totalSubCategories: Object.values(subCategories).reduce(
      (sum, subs) => sum + subs.length,
      0
    ),
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AdminSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={setSidebarCollapsed}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-72"
          } flex items-center justify-center`}
        >
          <div className="text-center space-y-4">
            <div className="relative">
              <RefreshCw className="animate-spin text-6xl text-indigo-500 mx-auto" />
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                Loading Categories
              </h3>
              <p className="text-gray-600">Fetching category data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
      />

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

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        } bg-gray-50`}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Category Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage category status and organize your product hierarchy
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddCategory}
                className="inline-flex items-center space-x-2 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Categories
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {categoryStats.total}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Layers className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Categories
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {categoryStats.active}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Inactive Categories
                  </p>
                  <p className="text-3xl font-bold text-amber-600">
                    {categoryStats.inactive}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Search & Filter
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input - No icon */}
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search categories by name..."
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter - No icon */}
              <select
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 appearance-none bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status} Categories
                  </option>
                ))}
              </select>

              {/* Results Count */}
              <div className="flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-3 border border-indigo-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-indigo-700">Showing</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {filteredCategories.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredCategories.length} of {categories.length}{" "}
                categories
              </div>
              {(searchTerm || statusFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Activity className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Categories & Status Control
                  </h3>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredCategories.length} categories
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Subcategories
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <React.Fragment key={category.id}>
                        <tr className="hover:bg-gray-50 transition-colors duration-200 group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  category.status === "active"
                                    ? "bg-gradient-to-br from-indigo-500 to-blue-800"
                                    : "bg-gradient-to-br from-gray-400 to-gray-500"
                                }`}
                              >
                                <Folder className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-gray-900">
                                  {category.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {category.description}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              {getStatusBadge(category.status || "inactive")}
                              {getToggleButton(
                                category.status || "inactive",
                                updatingStates[`category-${category.id}`] ||
                                  false,
                                () =>
                                  handleToggleCategoryStatus(
                                    category.id,
                                    category.status || "inactive"
                                  )
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() =>
                                handleToggleSubcategories(category.id)
                              }
                              className="inline-flex items-center space-x-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                            >
                              {expandedCategories[category.id] ? (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  <span>Hide</span>
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="w-4 h-4" />
                                  <span>Show</span>
                                </>
                              )}
                            </button>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() =>
                                  handleOpenAddSubcategory(category.id)
                                }
                                className="p-2 text-gray-400 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                title="Add Subcategory"
                              >
                                <FolderPlus className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Subcategories */}
                        {expandedCategories[category.id] &&
                          subCategories[category.id] && (
                            <>
                              {subCategories[category.id].map((subCategory) => {
                                // Check if parent category is inactive - if so, disable subcategory toggle
                                const parentCategory = categories.find(
                                  (c) => c.id === category.id
                                );
                                const isParentInactive =
                                  parentCategory?.status === "inactive";

                                console.log(
                                  `Subcategory ${subCategory.name}:`,
                                  {
                                    id: subCategory.id,
                                    states: subCategory.states,
                                    status: subCategory.status,
                                    isParentInactive,
                                  }
                                );
                                return (
                                  <tr
                                    key={subCategory.id}
                                    className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-blue-50 transition-all duration-200"
                                  >
                                    <td className="px-6 py-3 whitespace-nowrap">
                                      <div className="flex items-center space-x-4 pl-14">
                                        <div
                                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            subCategory.status === "active"
                                              ? "bg-gradient-to-br from-blue-400 to-pink-500"
                                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                                          }`}
                                        >
                                          <Tag className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-sm font-medium text-gray-700">
                                            {subCategory.name}
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="px-6 py-3 whitespace-nowrap">
                                      <div className="flex items-center space-x-3">
                                        {getStatusBadge(
                                          subCategory.status || "inactive"
                                        )}
                                        {getToggleButton(
                                          subCategory.status || "inactive",
                                          updatingStates[
                                            `subcategory-${subCategory.id}`
                                          ] || false,
                                          () =>
                                            handleToggleSubcategoryStatus(
                                              category.id,
                                              subCategory.id,
                                              subCategory.status || "inactive"
                                            ),
                                          isParentInactive
                                        )}
                                      </div>
                                      {isParentInactive && (
                                        <div className="mt-1 text-xs text-amber-600">
                                          Parent category is inactive
                                        </div>
                                      )}
                                    </td>

                                    <td className="px-6 py-3 whitespace-nowrap text-center">
                                      <div className="text-sm text-gray-500">
                                        Subcategory
                                      </div>
                                    </td>

                                    <td className="px-6 py-3 text-center">
                                      <span className="text-xs text-gray-400">
                                        —
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </>
                          )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Layers className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No categories found
                            </h3>
                            <p className="text-gray-500">
                              {searchTerm || statusFilter !== "All"
                                ? "No categories match your current filter criteria. Try adjusting your filters."
                                : "No categories have been created yet. Start by adding your first category."}
                            </p>
                          </div>
                          {searchTerm || statusFilter !== "All" ? (
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("All");
                              }}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                            >
                              <Filter className="w-4 h-4" />
                              <span>Clear Filters</span>
                            </button>
                          ) : (
                            <button
                              onClick={handleAddCategory}
                              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Your First Category</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Error</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Subcategory Modal */}
      {showAddSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FolderPlus className="w-6 h-6 text-blue-800" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Add Subcategory
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedCategoryId && (
              <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <p className="text-sm text-indigo-700 font-medium">
                  Adding subcategory to:
                  <span className="font-bold ml-1">
                    {categories.find((c) => c.id === selectedCategoryId)?.name}
                  </span>
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="subcategory-name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Subcategory Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="subcategory-name"
                  type="text"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-800 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                  placeholder="Enter subcategory name..."
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSubmitting) {
                      handleAddSubcategory();
                    }
                    if (e.key === "Escape" && !isSubmitting) {
                      handleCloseModal();
                    }
                  }}
                  autoFocus
                />
                {newSubName.trim() && (
                  <p className="mt-2 text-xs text-gray-600">
                    Preview:{" "}
                    <span className="font-medium">{newSubName.trim()}</span>
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSubcategory}
                  disabled={isSubmitting || !newSubName.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-800 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Subcategory</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;