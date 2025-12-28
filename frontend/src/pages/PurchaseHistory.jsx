import React, { useState, useEffect } from "react";

export default function PurchaseHistory() {
  const email = localStorage.getItem("userEmail");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/history/${email}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("History fetch error:", err);
        setLoading(false);
      });
  }, [email]);

  if (loading) return <h2 className="text-center mt-20">Loading...</h2>;

  if (!email) return <h2 className="text-center mt-20">❌ Not Logged In</h2>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📜 Purchase History</h1>

      {history.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No purchases found.</p>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {history.map((h, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow border">
              <p className="font-semibold text-gray-800 text-lg">{h.creditName}</p>
              <p className="text-sm text-gray-600">Vendor: {h.seller}</p>
              <p className="text-sm text-gray-600">Vintage: {h.year}</p>
              <p className="text-sm text-gray-600">
                Bought On: {new Date(h.date).toLocaleString()}
              </p>

              <a
                href={`http://localhost:5000/invoices/${h.pdfFilename}`}
                className="inline-block mt-3 bg-green-600 hover:bg-green-700 px-4 py-2 text-white rounded-md"
                target="_blank"
              >
                <button
  onClick={() => window.open(`http://localhost:5000/${p.invoicePath}`, "_blank")}
  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
>
  View Invoice PDF
</button>

              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
