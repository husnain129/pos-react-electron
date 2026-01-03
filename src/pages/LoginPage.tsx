import { AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Alert, AlertDescription } from "../components/alert";
import { Button } from "../components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { usersAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";

import logo from "../assets/logo.png";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const response = await usersAPI.login(username, password);

      if (response.data) {
        login(response.data);
        await Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: `Welcome back, ${
            response.data.fullname || response.data.username
          }!`,
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#17411c] rounded-full flex items-center justify-center">
              <img
                src={logo}
                width={100}
                height={100}
                alt="Creative Hands Logo"
              />
              {/* <span className="text-white font-bold text-3xl">CH</span> */}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#17411c]">
            Creative Hands POS
          </CardTitle>
          <CardDescription>By TEVTA - Point of Sale System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#17411c] hover:bg-[#1a4f22]"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              Default credentials: admin / admin
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
