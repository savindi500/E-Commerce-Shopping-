import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ProductCard from "./ProductCard";
import { FaSpinner } from "react-icons/fa";
import { Product } from "../types/Product";

const API_BASE_URL = "http://localhost:5005";

interface BackendProduct {
  productID: number;
  name: string;
  categoryID: number;
  categoryName: string;
  subCategoryID: number;
  subCategoryName: string;
  stock: number;
  status: string;
  price: number;
  colors: Array<{ colorID: number; name: string }>;
  sizes: Array<{ sizeID: number; name: string }>;
  images: Array<{ imageID: number; path: string }>;
  slug: string;
}

const SearchResults: React.FC = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getQueryParam = () => {
    const params = new URLSearchParams(location.search);
    return params.get("query") || "";
  };
useEffect(() => {
  // Scroll to top when component mounts or route changes
  window.scrollTo(0, 0);
}, [location.pathname, location.search]); 
  const query = getQueryParam();

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<BackendProduct[]>(
          `${API_BASE_URL}/api/Product/Search`,
          {
            params: { keyword: query.trim() },
          }
        );

        const transformedProducts = response.data.map((prod): Product => {
          // Convert backend format to your Product interface
          return {
            ProductID: prod.productID,
            name: prod.name,
            CategoryID: prod.categoryID,
            SubCategoryID: prod.subCategoryID,
            Stock: prod.stock,
            price: prod.price,
            Colors: prod.colors.map((c) => c.colorID), // Extract just color IDs
            Sizes: prod.sizes.map((s) => s.sizeID), // Extract just size IDs
            images: prod.images.map((img) => `${API_BASE_URL}${img.path}`), // Convert to full URLs
            description: prod.status, // Using status as description if needed
            
          };
        });

        setProducts(transformedProducts);
      } catch (err: any) {
        console.error("Error fetching search results:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load search results. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <section className="pt-20 md:pt-24 lg:pt-28 pb-8 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-10 sticky top-16 md:top-20 bg-gray-50 z-10 py-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Search Results for "<span className="text-blue-800">{query}</span>"
          </h2>
          <p className="text-gray-600">
            {products.length} {products.length === 1 ? "result" : "results"}{" "}
            found
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-48 sm:h-64">
            <FaSpinner className="animate-spin text-3xl text-indigo-600" />
          </div>
        )}

        {error && <div className="text-red-500 text-center py-12">{error}</div>}

        {!loading && !error && products.length === 0 && (
          <div className="text-gray-500 text-center py-12">
            No products found for "{query}"
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={`product-${product.ProductID}`}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchResults;