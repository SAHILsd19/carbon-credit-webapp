import React, { useEffect, useState } from "react";

export default function Portfolio() {
  const [list, setList] = useState([]);
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!email) return;
    fetch(`http://localhost:5000/api/purchase/history/user/${email}`)
      .then(res => res.json())
      .then(data => setList(data))
      .catch(err => console.log(err));
  }, [email]);

  // Calculate portfolio total value
  const totalValue = list.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Heading */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🌍 Carbon Credit Portfolio
        </h1>

        {/* Portfolio Value Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
          <h2 className="text-lg font-semibold text-gray-700">Total Portfolio Value</h2>
          <p className="text-4xl font-bold text-green-600 mt-1">
            ₹{totalValue.toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Total valuation of carbon credits you currently own.
          </p>
        </div>

        {/* List */}
        {list.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center text-gray-500 text-lg font-medium">
            🚫 You have not purchased any carbon credits yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md border p-6 hover:shadow-lg transition"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                    🌱
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">{p.creditName}</p>
                    <p className="text-gray-500 text-sm">{p.sellerName} • Verified Vendor</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Tons Owned:</strong> {p.tons} tons</p>
                  <p>
                    <strong>Price per Ton:</strong>{" "}
                    <span className="text-green-600 font-semibold">₹{p.price}</span>
                  </p>
                  <p><strong>Total Paid:</strong> ₹{p.totalAmount?.toLocaleString()}</p>
                  <p><strong>Purchase Date:</strong> {new Date(p.date).toLocaleDateString()}</p>
                </div>

                {/* Invoice + Token Status */}
                <div className="mt-5 border-t pt-4 flex items-center justify-between">

                  

                 
                    
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
