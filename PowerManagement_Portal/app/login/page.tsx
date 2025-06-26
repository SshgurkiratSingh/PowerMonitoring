"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/auth-context";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const { success, error } = await login(password);
      
      if (success) {
        router.replace("/dashboard");
      } else {
        setError(error || "Invalid password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md bg-slate-900/70 backdrop-blur-md border border-slate-700 shadow-xl">
        <CardHeader className="flex flex-col items-center gap-3 p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            CCMS Portal Login
          </h1>
          <p className="text-sm text-slate-400 text-center">
            Enter your view password to access the portal
          </p>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="text-white"
              classNames={{
                label: "text-slate-400",
                input: [
                  "bg-slate-800/50",
                  "border-slate-700",
                  "focus:border-sky-500",
                  "focus:ring-sky-500/20",
                ].join(" "),
              }}
            />
            {error && (
              <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={isLoading || !password}
              className={`w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium py-2 px-4 rounded-lg
                transition-all duration-200 hover:from-sky-600 hover:to-blue-700
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}