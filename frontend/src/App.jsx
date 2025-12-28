import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VendorDashboard from "./pages/VendorDashboard";
import CarbonMarketplace from "./pages/CarbonMarketplace";
import CompanyHistory from "./pages/CompanyHistory";
import VendorHistory from "./pages/VendorHistory";
import SalesHistory from "./pages/SalesHistory";
import CCTSold from "./pages/CCTSold";
import portfolio from "./pages/Portfolio";
import { useState, useEffect } from "react";
import Portfolio from "./pages/Portfolio";
import VerificationDashboard from "./pages/VerificationDashboard";
import VerificationHistory from "./pages/VerificationHistory";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/verification" element={<VerificationDashboard />} />
        {/* Buyer Dashboard */}
        <Route path="/marketplace" element={<CarbonMarketplace />} />
 
        {/* Vendor Dashboard */}
        <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/history/vendor" element={<SalesHistory />} />

        {/* History Pages */}
        <Route path="/history/company" element={<CompanyHistory />} />
        <Route path="/history/vendor" element={<VendorHistory />} />
        <Route path="/history/sold" element={<CCTSold />} />
      <Route path="/verification-history" element={<VerificationHistory />} />

      </Routes>
    </BrowserRouter>
  );
}
