import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { 
  Search, 
  Trash2, 
  UserCheck, 
  Users, 
  Shield, 
  Crown, 
  Eye,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Edit3,
  MoreVertical,
  Mail,
  Calendar,
  Activity,
  UserPlus,
  Settings,
  Briefcase
} from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLogin?: string;
  status?: 'active' | 'inactive';
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editedRoles, setEditedRoles] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingRoles, setSavingRoles] = useState<{ [key: number]: boolean }>({});
  const [deletingUsers, setDeletingUsers] = useState<{ [key: number]: boolean }>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchUsers = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      setError("");
      
      const response = await axios.get("http://localhost:5005/api/Users");
      const formattedUsers = response.data.map((user: any) => ({
        id: user.userID,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt || new Date().toISOString(),
        lastLogin: user.lastLogin,
        status: user.status || 'active',
      }));
      setUsers(formattedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please check your connection and try again.");
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`
    );
    
    if (confirmed) {
      setDeletingUsers(prev => ({ ...prev, [userId]: true }));
      try {
        await axios.delete(`http://localhost:5005/api/Users/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
        toast.success(`User "${user.username}" deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(`Failed to delete user "${user.username}". Please try again.`, {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setDeletingUsers(prev => ({ ...prev, [userId]: false }));
      }
    }
  };

  const handleSelectChange = (userId: number, newRole: string) => {
    setEditedRoles((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const handleSaveRole = async (userId: number) => {
    const newRole = editedRoles[userId];
    if (!newRole) return;

    const user = users.find(u => u.id === userId);
    if (!user) return;

    setSavingRoles(prev => ({ ...prev, [userId]: true }));
    try {
      // Fixed: Changed endpoint to match backend route
      await axios.put(
        `http://localhost:5005/api/Users/update-role/${userId}`,
        JSON.stringify(newRole),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success(`Role updated for "${user.username}" successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      setEditedRoles((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (err) {
      console.error("Error updating role:", err);
      toast.error(`Failed to update role for "${user.username}". Please try again.`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setSavingRoles(prev => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);
    const matchesRole = roleFilter === "" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Crown className="w-4 h-4 text-purple-600" />;
      case 'staff':
        return <Briefcase className="w-4 h-4 text-orange-600" />;
      case 'customer':
        return <UserCheck className="w-4 h-4 text-blue-800" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'staff':
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 'customer':
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role.toLowerCase() === 'admin').length,
    staff: users.filter(u => u.role.toLowerCase() === 'staff').length,
    customers: users.filter(u => u.role.toLowerCase() === 'customer').length,
    active: users.filter(u => u.status === 'active').length,
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={setSidebarCollapsed} 
        />
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        } flex items-center justify-center`}>
          <div className="text-center space-y-4">
            <div className="relative">
              <RefreshCw className="animate-spin text-6xl text-indigo-500 mx-auto" />
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Loading Users</h3>
              <p className="text-gray-600">Fetching user data...</p>
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
      
      <div className={`flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-72'
      } bg-gray-50`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
            </div>
            
            <div className="flex items-center space-x-4">
                                      
              
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{userStats.total}</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrators</p>
                  <p className="text-3xl font-bold text-purple-600">{userStats.admins}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Staff Members</p>
                  <p className="text-3xl font-bold text-orange-600">{userStats.staff}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Briefcase className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customers</p>
                  <p className="text-3xl font-bold text-blue-800">{userStats.customers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <UserCheck className="w-6 h-6 text-blue-800" />
                </div>
              </div>
            </div>
            
            {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-emerald-600">{userStats.active}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div> */}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Filter className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by user ID, username, or email..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <div className="relative">
                <select
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 appearance-none bg-white"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="staff">Staff Members</option>
                  <option value="customer">Customers</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
              {(searchTerm || roleFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("");
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Users List</h3>
                </div>
                <div className="text-sm text-gray-500">
                  {filteredUsers.length} users
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role & Status
                    </th>
                   
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                              <div className="text-xs text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{user.email}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <select
                                className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${getRoleColor(editedRoles[user.id] ?? user.role)}`}
                                value={editedRoles[user.id] ?? user.role}
                                onChange={(e) => handleSelectChange(user.id, e.target.value)}
                              >
                                <option value="admin">Administrator</option>
                                <option value="staff">Staff Member</option>
                                <option value="customer">Customer</option>
                              </select>
                              {getRoleIcon(editedRoles[user.id] ?? user.role)}
                            </div>
                            {editedRoles[user.id] && editedRoles[user.id] !== user.role && (
                              <div className="flex items-center space-x-1 text-xs text-amber-600">
                                <Edit3 className="w-3 h-3" />
                                <span>Modified</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                       
                        
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {editedRoles[user.id] && editedRoles[user.id] !== user.role ? (
                              <button
                                onClick={() => handleSaveRole(user.id)}
                                disabled={savingRoles[user.id]}
                                className="inline-flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md text-xs font-medium"
                                title="Save Role Change"
                              >
                                {savingRoles[user.id] ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                <span>Save</span>
                              </button>
                            ) : (
                              <>
                                

                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500">
                              {searchTerm || roleFilter
                                ? "No users match your current search criteria. Try adjusting your filters."
                                : "No users have been registered yet. Users will appear here once they sign up."}
                            </p>
                          </div>
                          {(searchTerm || roleFilter) && (
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setRoleFilter("");
                              }}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                            >
                              <Filter className="w-4 h-4" />
                              <span>Clear Filters</span>
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
    </div>
  );
};

export default UserManagement;