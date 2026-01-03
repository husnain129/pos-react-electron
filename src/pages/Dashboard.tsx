import {
  Grid3x3,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";
import { useDashboardData } from "../hooks/useQueries";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardData();

  const quickActions = [
    {
      title: "New Sale",
      description: "Start a new transaction",
      icon: ShoppingCart,
      color: "bg-green-600",
      action: () => navigate("/pos"),
    },
    {
      title: "Products",
      description: "Manage inventory",
      icon: Package,
      color: "bg-blue-600",
      action: () => navigate("/products"),
    },
    {
      title: "Transactions",
      description: "View sales history",
      icon: Receipt,
      color: "bg-purple-600",
      action: () => navigate("/transactions"),
    },
    {
      title: "Categories",
      description: "Manage categories",
      icon: Grid3x3,
      color: "bg-orange-600",
      action: () => navigate("/categories"),
    },
  ];

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17411c] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome to Creative Hands POS System
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Sales
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Rs {Number(stats?.todaySales || 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalTransactions || 0} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.lowStockProducts || 0} low stock items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Transactions
                </CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalTransactions || 0}
                </div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Alert
                </CardTitle>
                <Package className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {stats?.lowStockProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Products below 10 units
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Quick Actions */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={action.action}
                >
                  <CardHeader>
                    <div
                      className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}
                    >
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
