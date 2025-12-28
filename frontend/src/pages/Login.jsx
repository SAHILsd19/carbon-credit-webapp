import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("No user found, please signup first!");

    if (email === user.email && password === user.password) {
      alert("Login Successful!");

      if (user.role === "vendor") navigate("/vendor");
      else navigate("/marketplace");
    } else {
      alert("Incorrect email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-emerald-50 via-blue-50 to-teal-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Welcome Back</h2>

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 border rounded"
        />

        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 w-full rounded-lg">
          Login
        </button>

        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 underline">Sign Up</a>
        </p>
      </form>
    </div>
  );
}
