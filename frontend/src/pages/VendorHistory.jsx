import React, { useEffect, useState } from "react";

export default function VendorHistory() {
  const [list, setList] = useState([]);
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    fetch(`http://localhost:5000/api/purchase/history/vendor/${email}`)
      .then(res => res.json())
      .then(data => setList(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Sales History</h2>

      {list.length === 0 ? (
        <p>No sales yet.</p>
      ) : (
        list.map((p) => (
          <div key={p._id} className="border p-4 rounded mb-3 flex justify-between">
            <div>
              <p><b>Credit:</b> {p.creditName}</p>
              <p><b>Buyer:</b> {p.buyerName}</p>
              <p><b>Total Earned:</b> ₹{p.totalPrice}</p>
              <p><b>Date:</b> {new Date(p.date).toLocaleString()}</p>
            </div>
            <a
              href={`http://localhost:5000/invoices/${p.invoiceFilename}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              View Invoice
            </a>
          </div>
        ))
      )}
    </div>
  );
}
