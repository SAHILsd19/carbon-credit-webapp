// src/pages/CarbonMarketplace.jsx
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../blockchain/contractConfig.js";

export default function CarbonMarketplace() {
  const [credits, setCredits] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  const [walletAddress, setWalletAddress] = useState(localStorage.getItem("walletAddress") || "");
  const [walletBalance, setWalletBalance] = useState("0");
  const [networkName, setNetworkName] = useState("");
  const [showWalletPopup, setShowWalletPopup] = useState(false);

  // CONNECT WALLET
  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not installed");
    if (walletAddress) return setShowWalletPopup(!showWalletPopup);

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      setWalletAddress(address);
      localStorage.setItem("walletAddress", address);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setWalletBalance(Number(ethers.formatEther(balance)).toFixed(4));

      const network = await provider.getNetwork();
      setNetworkName(network.name);
      setShowWalletPopup(true);
    } catch (error) {
      console.log("Wallet error:", error);
    }
  };

  // RESTORE WALLET
  useEffect(() => {
    const saved = localStorage.getItem("walletAddress");
    if (saved) {
      (async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const bal = await provider.getBalance(saved);
        setWalletBalance(Number(ethers.formatEther(bal)).toFixed(4));
        const net = await provider.getNetwork();
        setNetworkName(net.name);
      })();
    }
  }, []);

  // LOAD LISTINGS FROM BACKEND
  const fetchCredits = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/credits");
      const data = await res.json();
      setCredits(data);
      setFiltered(data);
    } catch (err) {
      console.log("API not responding:", err);
    }
  };
  useEffect(() => {
    fetchCredits();
  }, []);

  // 🔥 BUY FRACTIONS WITH INR → MATIC CONVERSION
const buyCredit = async (credit) => {
  try {
    if (!walletAddress) return alert("Please connect wallet first");
    if (!credit.tokenId) return alert("❌ This credit is not minted yet");

    const tons = Number(credit.userTons);
    if (!tons || tons <= 0) return alert("❌ Enter tons to buy");
    if (tons > credit.available) return alert("❌ Exceeds available tons");

    // Convert ₹ → MATIC
    const pricePerTon = Number(credit.price);
    const maticRate = 0.001;
    const totalMatic = tons * pricePerTon * maticRate;
    const totalWei = ethers.parseEther(totalMatic.toString());

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // 🔥 Smart contract purchase
    const tx = await contract.buyFractions(credit.tokenId, tons, { value: totalWei });
    const receipt = await tx.wait();

    // 🔥 Store purchase + generate PDF + send email
    const purchaseRes = await fetch("http://localhost:5000/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creditId: credit._id,
        tons,
        buyerName: localStorage.getItem("userName"),
        buyerEmail: localStorage.getItem("userEmail"),
        transactionHash: receipt.hash,
      }),
    });

    const result = await purchaseRes.json(); // <-- NOW result is defined

    // 🟢 Success message from backend
    alert(result.message || "🎉 Purchase Successful!");

    fetchCredits();

  } catch (err) {
    console.error("Purchase error:", err);
    alert("❌ Transaction failed — check console");
  }
};


  // FILTER SYSTEM
  useEffect(() => {
    let list = credits.filter((c) => !c.sold);
    if (search.trim())
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.sellerEmail.toLowerCase().includes(search.toLowerCase())
      );
    if (minPrice) list = list.filter((c) => c.price >= Number(minPrice));
    if (maxPrice) list = list.filter((c) => c.price <= Number(maxPrice));
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    setFiltered(list);
  }, [search, minPrice, maxPrice, sort, credits]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* WALLET POPUP */}
      {showWalletPopup && (
        <div className="fixed top-20 right-6 bg-white shadow-xl border rounded-xl p-4 w-72 z-50">
          <p className="font-bold text-gray-800">Wallet Info</p>
          <p className="text-sm mt-1">Network: {networkName}</p>
          <p className="text-sm">Balance: {walletBalance} MATIC</p>

          <button
            onClick={() =>
              window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{ eth_accounts: {} }],
              })
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded mt-2"
          >
            🔄 Switch Wallet
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("walletAddress");
              setWalletAddress("");
              setShowWalletPopup(false);
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded mt-2"
          >
            ❌ Disconnect
          </button>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <span className="text-2xl font-bold text-gray-800">🌱 CarbonMarket</span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-96 bg-gray-100 px-4 py-2 rounded-full text-sm outline-none"
            placeholder="Search carbon credits / vendors"
          />

          <nav className="flex gap-6 text-gray-600 font-medium">
            <a href="/marketplace">Marketplace</a>
            <a href="/verification">Verification Dashboard</a>
            <a href="/portfolio">Portfolio</a>

            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              {walletAddress
                ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : "Connect Wallet"}
            </button>
            <a href="/history/company" className="text-sm underline">
              View Purchase History
            </a>
          </nav>
        </div>
      </header>

      {/* GRID DISPLAY */}
      <div className="max-w-7xl mx-auto p-6">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-20">🚫 No credits found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div key={item._id} className="bg-white rounded-xl shadow p-6">
                <p className="text-lg font-bold">{item.seller || item.sellerEmail}</p>
                <p className="text-gray-700 font-medium">{item.name}</p>

                <div className="mt-4 space-y-1 text-sm">
                  <p><strong>Available:</strong> {(item.availableTons ?? item.available) || 0} tons</p>
                  <p><strong>Price per Ton:</strong> ₹{item.price}</p>
                </div>

<input
  type="number"
  min="1"
  max={item.available}
  placeholder="Enter tons to buy"
  value={item.userTons || ""}
  onChange={(e) => {
    const value = Number(e.target.value);
    setFiltered((prev) =>
      prev.map((p) => p._id === item._id ? { ...p, userTons: value } : p)
    );
  }}
  className="border w-full px-2 py-1 rounded mt-2 text-sm"
/>

<button
  onClick={() => buyCredit(item)}
  disabled={(item.availableTons ?? item.available) <= 0}
  className={`w-full mt-4 py-2 font-semibold rounded-md transition 
    ${(item.availableTons ?? item.available) <= 0
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700 text-white"}`}
>
  {(item.availableTons ?? item.available) <= 0 ? "Sold Out" : "Buy Credits"}
</button>



              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
