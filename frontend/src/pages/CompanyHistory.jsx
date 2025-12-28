import React, { useEffect, useState } from "react";

export default function CompanyHistory() {
  const [list, setList] = useState([]);
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!email) return;
    fetch(`http://localhost:5000/api/purchase/history/company/${email}`)
      .then((res) => res.json())
      .then((data) => setList(data))
      .catch((err) => console.log(err));
  }, [email]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Purchase History</h2>

      {list.length === 0 ? (
        <p>No purchases yet.</p>
      ) : (
        list.map((p) => (
          <div
            key={p._id}
            className="border p-4 rounded mb-3 flex justify-between items-center"
          >
            <div>
              <p><b>Credit:</b> {p.creditName}</p>
              <p><b>Amount Paid:</b> ₹{p.totalAmount}</p>
              <p><b>Date:</b> {new Date(p.date).toLocaleString()}</p>
            </div>

            {/* View PDF Button */}
            {p.pdfPath ? (
              <button
                onClick={() =>
                  window.open(`http://localhost:5000${p.pdfPath}`, "_blank")
                }
                className="text-blue-600 underline cursor-pointer"
              >
                View PDF
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
