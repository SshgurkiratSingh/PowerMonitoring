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
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      if (response.ok) {
        login();
        router.push("/");
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("An error occurred during login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md bg-slate-900/70 backdrop-blur-md border border-slate-700">
        <CardHeader className="flex flex-col items-center gap-3 p-6">
          <h1 className="text-2xl font-bold text-white">CCMS Portal Login</h1>
          <p className="text-sm text-slate-400">
            Enter your view password to access the portal
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-white"
              classNames={{
                label: "text-slate-400",
                input: "bg-slate-800/50 border-slate-700",
              }}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              color="primary"
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white"
            >
              Login
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}