interface UserInfo {
  email: string;
  name: string;
  role: string;
  userId?: string;
  username?: string;
}

// Function to decode JWT token and extract user info
export const decodeToken = (token: string): UserInfo | null => {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decodedPayload = atob(
      paddedPayload.replace(/-/g, "+").replace(/_/g, "/")
    );
    const parsedPayload = JSON.parse(decodedPayload);

    console.log("🔍 Decoded token payload:", parsedPayload);

    // Extract user information from token
    // Common JWT claims: email, sub (user ID), name, role, etc.
    return {
      email:
        parsedPayload.email ||
        parsedPayload.Email ||
        parsedPayload.unique_name ||
        "user@liyara.com",
      name:
        parsedPayload.name ||
        parsedPayload.Name ||
        parsedPayload.given_name ||
        parsedPayload.username ||
        parsedPayload.Username ||
        "User",
      username:
        parsedPayload.username ||
        parsedPayload.Username ||
        parsedPayload.unique_name ||
        parsedPayload.name ||
        parsedPayload.Name ||
        "User",
      role: (
        parsedPayload.role ||
        parsedPayload.Role ||
        parsedPayload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        "Customer"
      )
        .toString()
        .toLowerCase()
        .replace(/^\w/, (c: string) => c.toUpperCase()),
      userId:
        parsedPayload.sub ||
        parsedPayload.Sub ||
        parsedPayload.nameid ||
        parsedPayload.NameId ||
        parsedPayload.userId ||
        parsedPayload.UserId ||
        parsedPayload.id ||
        parsedPayload.Id,
    };
  } catch (error) {
    console.error("❌ Error decoding token:", error);
    return null;
  }
};

// Get user info from stored token
export const getUserFromToken = (): {
  userId: string | null;
  username: string;
  email: string;
  role: string;
} => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("⚠️ No token found in localStorage");
    return {
      userId: null,
      username: "Guest",
      email: "",
      role: "Guest",
    };
  }

  const decoded = decodeToken(token);

  if (!decoded) {
    console.log("⚠️ Failed to decode token");
    return {
      userId: null,
      username: "Guest",
      email: "",
      role: "Guest",
    };
  }

  console.log("✅ Successfully decoded user info:", {
    userId: decoded.userId,
    username: decoded.username,
    email: decoded.email,
    role: decoded.role,
  });

  return {
    userId: decoded.userId || null,
    username: decoded.username || decoded.name || "User",
    email: decoded.email || "",
    role: decoded.role || "Customer",
  };
};

// Get user display name with fallbacks
export const getUserDisplayName = (): string => {
  const { username } = getUserFromToken();

  // If we have a username from token, use it
  if (username && username !== "Guest" && username !== "User") {
    return username;
  }

  // Fallback to localStorage user data
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.username) {
        return userData.username;
      }
      if (userData.name) {
        return userData.name;
      }
    }
  } catch (error) {
    console.error("Error parsing stored user data:", error);
  }

  // Final fallback
  return username || "User";
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = decodeToken(token);
    if (!decoded) return false;

    // Check if token is expired (if exp claim exists)
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp < currentTime) {
          console.log("⚠️ Token has expired");
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
};

// Get user initials for avatar
export const getUserInitials = (name?: string): string => {
  const displayName = name || getUserDisplayName();
  return displayName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("cart");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userID");
  localStorage.removeItem("user");
  console.log("🚪 User logged out successfully");
};

export default {
  decodeToken,
  getUserFromToken,
  getUserDisplayName,
  isLoggedIn,
  getUserInitials,
  logout,
};