// src/pages/ProductDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";

interface ProductImage {
  imageID: number;
  path: string;
}

interface ProductDetailsType {
  productID: number;
  name: string;
  categoryName: string;
  subCategoryName: string;
  stock: number;
  price: number;
  description: string;
  status: string;
  colors: string[];
  sizes: string[];
  images: ProductImage[];
}

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetailsType | null>(null);
  const [error, setError] = useState("");
  const [mainImage, setMainImage] = useState<ProductImage | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setError("No product ID found in URL.");
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5005/api/Product/GetProductDetails/${productId}`
        );
        setProduct(res.data);
        if (res.data.images?.length > 0) {
          setMainImage(res.data.images[0]);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details.");
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleToggleCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  if (error) {
    return (
      <div className="flex h-screen">
        <AdminSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        <div
          className={`flex-1 p-4 text-red-600 overflow-auto transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-72"
          }`}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen">
        <AdminSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        <div
          className={`flex-1 p-4 text-gray-600 overflow-auto transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-72"
          }`}
        >
          Loading product details...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div
        className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Product Details
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
            >
              Back to Products
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Product Header */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {product.name}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.status === "In Stock"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Product ID: {product.productID}
              </p>
            </div>

            <div className="md:flex">
              {/* Image Gallery */}
              <div className="md:w-1/2 p-6 border-r">
                <div
                  className="rounded-lg overflow-hidden bg-gray-100 mb-4 flex items-center justify-center"
                  style={{ height: "350px" }}
                >
                  {mainImage ? (
                    <img
                      src={`http://localhost:5005${mainImage}`}
                      alt="Main product"
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <div className="text-gray-400">No Image Available</div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(product.images ?? []).map((img, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer border-2 rounded-md overflow-hidden transition-all ${
                        mainImage?.imageID === img.imageID
                          ? "border-blue-500"
                          : "border-transparent hover:border-gray-300"
                      }`}
                      onClick={() => setMainImage(img)}
                    >
                      <img
                        src={`http://localhost:5005${img}`}
                        alt={`Thumbnail ${index}`}
                        className="w-full h-20 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Category
                      </h3>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {product.categoryName}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Subcategory
                      </h3>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {product.subCategoryName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Price
                      </h3>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        RS.{product.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Stock
                      </h3>
                      <p
                        className={`mt-1 text-sm font-medium ${
                          product.stock > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {product.stock} units
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Colors
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(product.colors ?? []).map((color, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Sizes</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(product.sizes ?? []).map((size, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-800 border border-gray-200"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Description
                    </h3>
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                      {product.description}
                    </p>
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

export default ProductDetails;
