import React, { useEffect, useState } from "react";

export default function VendorSalesHistory() {
  const seller = localStorage.getItem("userName");
  const [sales, setSales] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/purchase/history/vendor/${seller}`)
      .then(res => res.json())
      .then(data => data.success ? setSales(data.sold) : alert("Failed to load vendor history"));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Sales History</h2>

      {sales.length === 0 && <p>No credits sold yet</p>}

      {sales.map(item => (
        <div key={item._id} className="border p-4 rounded mb-3 flex justify-between items-center">
          <div>
            <p className="font-semibold">{item.creditName}</p>
            <p>Buyer: {item.buyerName}</p>
            <p>₹{item.price} • {new Date(item.date).toLocaleString()}</p>
          </div>
          <a
            href={item.invoicePath}
            target="_blank"
            className="bg-blue-600 text-white px-4 py-2 rounded">
            View Invoice
          </a>
        </div>
      ))}
    </div>
  );
}
