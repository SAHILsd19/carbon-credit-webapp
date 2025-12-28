// src/pages/VendorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../blockchain/contractConfig.js";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", available: "", year: "" });

  const vendorName = localStorage.getItem("userName");
  const vendorEmail = localStorage.getItem("userEmail");

  // Wallet States
  const [walletAddress, setWalletAddress] = useState(localStorage.getItem("walletAddress") || "");
  const [walletBalance, setWalletBalance] = useState("0");
  const [networkName, setNetworkName] = useState("");
  const [showWalletPopup, setShowWalletPopup] = useState(false);

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not installed!");
    if (walletAddress) return setShowWalletPopup(!showWalletPopup);

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      setWalletAddress(address);
      localStorage.setItem("walletAddress", address);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setWalletBalance(Number(ethers.formatEther(balance)).toFixed(4));

      const net = await provider.getNetwork();
      setNetworkName(net.name);
      setShowWalletPopup(true);
    } catch (err) {
      console.log("Wallet Error:", err);
    }
  };

  // Auto restore wallet
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

  // Load credits
  const loadCredits = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/credits/vendor/${vendorEmail}`);
      const data = await res.json();
      setCredits(data);
    } catch {
      console.log("Failed to fetch vendor credits");
    }
  };

  useEffect(() => {
    loadCredits();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Add Credit
  const addCredit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.available || !form.year)
      return alert("All fields required");

    const newCredit = {
      seller: vendorName,
      sellerEmail: vendorEmail,
      name: form.name,
      year: Number(form.year),
      available: Number(form.available),
      price: Number(form.price),
      sold: false,
    };

    const res = await fetch("http://localhost:5000/api/credits", 
 {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCredit),
    });

    if (res.ok) {
      alert("Credit added!");
      setForm({ name: "", price: "", available: "", year: "" });
      loadCredits();
    }
  };

  // Delete Credit
  const deleteCredit = async (id) => {
    await fetch(`http://localhost:5000/api/credits/${id}`, { method: "DELETE" });
    loadCredits();
  };

  // Mark Sold
  const markSold = async (id) => {
    await fetch(`http://localhost:5000/api/credits/markSold/${id}`, { method: "PUT" });
    loadCredits();
  };

  // Mint Token (blockchain)
const mintToken = async (credit) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // 🟢 Convert ₹ to MATIC (1 ₹ = 0.001 MATIC)
    const pricePerTonMatic = credit.price * 0.001;
    const pricePerTonWei = ethers.parseEther(pricePerTonMatic.toString());

    const tx = await contract.mintCredit(
      credit.available,      // totalTons
      pricePerTonWei,        // ❗ pricePerTon in Wei
      Math.floor(Date.now() / 1000) + 31536000, // expiry (1 year)
      credit.sellerEmail,
      `https://carbonmeta.io/metadata/${credit._id}.json`
    );

    const receipt = await tx.wait();
    const tokenId = Number(receipt.logs[0].args.tokenId);

    alert("🌱 Minting Successful — tokenId: " + tokenId);

    // Save updated tokenId + converted MATIC price to DB
    await fetch(`http://localhost:5000/api/credits/updateToken/${credit._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenId,
        minted: true,
        price: pricePerTonMatic   // store MATIC in DB, NOT ₹
      }),
    });

    loadCredits();
  } catch (err) {
    console.error("Mint Error:", err);
    alert("❌ Mint failed — see console");
  }
};



  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Wallet Popup */}
      {showWalletPopup && (
        <div className="fixed top-24 left-72 bg-white text-gray-900 shadow-2xl p-4 w-72 rounded-xl z-50">
          <p className="font-bold text-lg">Wallet Details</p>
          <p className="text-sm mt-1">Network: {networkName}</p>
          <p className="text-sm">Balance: {walletBalance} MATIC</p>
          <button
            onClick={() =>
              window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{ eth_accounts: {} }],
              })
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-3 px-3 py-2 rounded"
          >
            🔄 Switch Wallet
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("walletAddress");
              setWalletAddress("");
              setShowWalletPopup(false);
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white mt-2 px-3 py-2 rounded"
          >
            ❌ Disconnect
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/90 flex items-center justify-center text-xl">🌱</div>
          <div>
            <p className="font-semibold">CarbonMarket</p>
            <p className="text-xs text-slate-400">Vendor Console</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 text-sm">
          <button
            onClick={connectWallet}
            className="w-full px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium"
          >
            {walletAddress
              ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : "Connect Wallet"}
          </button>

          <div className="px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-300 font-medium flex items-center justify-between">
            Dashboard <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full">LIVE</span>
          </div>

          <button
            onClick={() => navigate("/history/vendor")}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800"
          >
            📄 CCT Sold History
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Vendor Dashboard</h1>
            <p className="text-sm text-slate-400">Add carbon credit listings for companies to purchase.</p>
          </div>
          <div className="text-xs bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
            {credits.length} active listings
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Credit Form */}
          <section className="lg:col-span-1 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h2 className="text-lg font-semibold mb-1">Add New Carbon Credit</h2>
            <form className="space-y-3" onSubmit={addCredit}>
              <input name="name" value={form.name} onChange={handleChange} className="w-full bg-slate-900 border p-2 rounded" placeholder="Project Name" />
              <input name="price" value={form.price} onChange={handleChange} className="w-full bg-slate-900 border p-2 rounded" placeholder="Price per ton" />
              <input name="available" value={form.available} onChange={handleChange} className="w-full bg-slate-900 border p-2 rounded" placeholder="Available Tons" />
              <input name="year" value={form.year} onChange={handleChange} className="w-full bg-slate-900 border p-2 rounded" placeholder="Vintage Year" />
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 py-2 rounded font-semibold">+ Add Credit</button>
            </form>
          </section>

          {/* Credit Listings */}
          <section className="lg:col-span-2 space-y-4">
            {credits.filter(c => !c.sold).length === 0 ? (
              <p className="text-gray-400">No active listings.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {credits.filter(c => !c.sold).map((c) => (
                  <div key={c._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <h3 className="font-bold">{c.name}</h3>
                    <p>Vintage {c.year} • {c.available} tons</p>
                    <p className="text-green-400 font-semibold mt-1">₹{c.price}</p>

                    {/* MINT STATUS */}
                    {c.tokenId ? (
                      <p className="text-xs text-blue-400 mt-2">🔗 Token Minted — ID: {c.tokenId}</p>
                    ) : (
                      <p className="text-xs text-yellow-400 mt-2">⏳ Not Minted Yet</p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between mt-4">
                      <button className="text-red-400" onClick={() => deleteCredit(c._id)}>Delete</button>
                      <button className="text-emerald-400" onClick={() => markSold(c._id)}>Mark Sold</button>
                    </div>

                    {/* Mint Button */}
                    {!c.tokenId && (
                      <button
                        onClick={() => mintToken(c)}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-1 rounded"
                      >
                        🌐 Mint on Blockchain
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
