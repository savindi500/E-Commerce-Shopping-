export interface Product {
  ProductID: number;
  name: string;
  CategoryID: number;
  SubCategoryID?: number;
  Stock: number;
  price: number;
  Colors: number[] | string[];
  Sizes: number[];
  images: string[] | string | { path?: string; url?: string; image?: string };
  description?: string;
  rating?: number; // Added as optional
  reviewCount?: number; // Added as optional
  reviews?: Review[]; // Added as optional
}
export interface Review {
  reviewID: number;
  productID: number;
  userName: string;
  reviewText: string;
  reviewDate: string;
  likes: number;
  dislikes: number;
  rating: number;
}
export interface ActiveFilters {
  category: string;
  size: string;
  color: string;
  priceMin: string;
  priceMax: string;
}

export interface CartItem {
  ProductID: number;
  Name: string;
  Price: number;
  Quantity: number;
  ImageUrl?: string;
  Size: string;
  Color: string;
  Id: number;
  UserID: number;
}

export const COLOR_MAP: Record<number, { name: string; hex: string }> = {
  1: { name: "Red", hex: "#ef4444" },
  2: { name: "Pink", hex: "#ec4899" },
  3: { name: "Blue", hex: "#3b82f6" },
  4: { name: "Yellow", hex: "#f59e0b" },
  5: { name: "Green", hex: "#10b981" },
  6: { name: "Black", hex: "#000000" },
  7: { name: "White", hex: "#ffffff" },
  8: { name: "Gray", hex: "#6b7280" },
  9: { name: "Purple", hex: "#8b5cf6" },
  10: { name: "Orange", hex: "#f97316" },
  11: { name: "Beige", hex: "#d4b483" },
  12: { name: "Brown", hex: "#78350f" },
  13: { name: "Navy", hex: "#1e3a8a" },
  14: { name: "Maroon", hex: "#7f1d1d" },
  15: { name: "Teal", hex: "#0d9488" },
  16: { name: "Gold", hex: "#facc15" },
  17: { name: "Silver", hex: "#a8a29e" },
};

// Create reverse mapping from color name to ID
export const COLOR_NAME_TO_ID: Record<string, number> = Object.entries(
  COLOR_MAP
).reduce((acc, [id, { name }]) => {
  acc[name.toLowerCase()] = parseInt(id, 10);
  return acc;
}, {} as Record<string, number>);

export const SIZE_MAP: Record<number, string> = {
  1: "S",
  2: "M",
  3: "L",
  4: "XL",
  5: "XXL",
};

export const CATEGORIES = [
  { label: "Shorts", value: "18" },
  { label: "Frocks", value: "19" },
  { label: "Tops", value: "20" },
  { label: "Denim", value: "21" },
];
