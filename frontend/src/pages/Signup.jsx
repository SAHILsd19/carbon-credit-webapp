// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "company",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!data.success) return alert(data.message);

      // Save user details
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userRole", data.user.role);

      // Correct redirect
      if (data.user.role === "vendor") navigate("/vendor");
      else navigate("/marketplace");
    } catch (err) {
      alert("Signup API not reachable");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-100 to-slate-200 flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 space-y-6 border border-green-200">
        <div className="text-center space-y-1">
          <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-500 flex items-center justify-center text-3xl shadow-lg">
            🌱
          </div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-gray-500">
            Join the world's trusted Carbon Credit Marketplace
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 font-medium">Full Name</label>
            <input
              name="name"
              type="text"
              placeholder="John Carter"
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium">Sign up as</label>
            <select
              name="role"
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="company">Company (Buyer)</option>
              <option value="vendor">Vendor (Seller)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
