import React, { useEffect, useState } from "react";

export default function CCTSold() {
  const [list, setList] = useState([]);
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!email) return;
    fetch(`http://localhost:5000/api/purchase/history/sold/${email}`)
      .then((res) => res.json())
      .then((data) => setList(data))
      .catch((err) => console.log(err));
  }, [email]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">CCT Sold History</h2>

      {list.length === 0 ? (
        <p>No credits sold yet.</p>
      ) : (
        list.map((p) => (
          <div
            key={p._id}
            className="border p-4 rounded mb-3 flex justify-between items-center"
          >
            <div>
              <p><b>Credit:</b> {p.creditName}</p>
              <p><b>Buyer:</b> {p.buyerName} ({p.buyerEmail})</p>
              <p><b>Amount Received:</b> ₹{p.totalAmount}</p>
              <p><b>Date:</b> {new Date(p.date).toLocaleString()}</p>
            </div>

            {/* PDF Button */}
            {p.pdfPath ? (
              <button
                onClick={() =>
                  window.open(`http://localhost:5000${p.pdfPath}`, "_blank")
                }
                className="text-blue-600 underline"
              >
                View Invoice
              </button>
            ) : (
              <span className="text-gray-500 italic">PDF not available</span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
