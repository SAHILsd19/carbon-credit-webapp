import { useEffect, useState } from "react";

export default function VerificationHistory() {
  const [rows, setRows] = useState([]);
  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    fetch(`http://localhost:5000/api/history/${email}`)
      .then(res => res.json())
      .then(data => setRows(data.records || []))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Verification History</h2>

      <table className="w-full border">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">Date</th>
            <th className="p-2">Project ID</th>
            <th className="p-2">Score</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-2">{new Date(row.generatedAt).toLocaleString()}</td>
              <td className="p-2">{row.projectId}</td>
              <td className="p-2">{row.score}</td>
              <td className={`p-2 font-semibold ${row.status === "Verified" ? "text-green-600" : "text-red-600"}`}>
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
