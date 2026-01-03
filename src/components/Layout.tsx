import {
  Grid3x3,
  Home,
  LogOut,
  Package,
  Receipt,
  School,
  ShoppingCart,
  User,
  Users,
} from "lucide-react";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { Button } from "../components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { useAuthStore } from "../store/authStore";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home, perm: null },
    { path: "/pos", label: "POS", icon: ShoppingCart, perm: null },
    {
      path: "/products",
      label: "Products",
      icon: Package,
      perm: "perm_products",
    },
    {
      path: "/categories",
      label: "Categories",
      icon: Grid3x3,
      perm: "perm_categories",
    },
    {
      path: "/institutes",
      label: "Institutes",
      icon: School,
      perm: "perm_products",
    },
    {
      path: "/transactions",
      label: "Transactions",
      icon: Receipt,
      perm: "perm_transactions",
    },
    { path: "/users", label: "Users", icon: Users, perm: "perm_users" },
  ];

  const hasPermission = (perm: string | null) => {
    if (!perm || !user) return true;
    return user[perm as keyof typeof user] === 1;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#17411c] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center p-2">
                <img
                  src={logo}
                  alt="Creative Hands Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wide">
                  Creative Hands
                </h1>
                <p className="text-sm text-green-100">
                  By TEVTA - Point of Sale System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {user?.fullname || user?.username}
                </p>
                <p className="text-xs text-green-100">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white text-[#17411c] hover:bg-green-50"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            {menuItems.map((item) => {
              if (!hasPermission(item.perm)) return null;

              const isActive = location.pathname === item.path;

              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? "bg-[#17411c] text-white hover:bg-[#17411c]/90 hover:text-white"
                      : "text-gray-700 hover:text-[#17411c] hover:bg-green-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
