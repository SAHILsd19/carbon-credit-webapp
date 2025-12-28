import React, { useState } from "react";

export default function VerificationDashboard() {
  const [year, setYear] = useState("");
  const [scope1, setScope1] = useState("");
  const [scope2, setScope2] = useState("");
  const [industry, setIndustry] = useState("");

  const [score, setScore] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [status, setStatus] = useState("Awaiting Assessment");
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);

  const industryRisk = {
    Energy: 0.12,
    Manufacturing: 0.10,
    Transportation: 0.08,
    Agriculture: 0.05,
    Technology: 0.03,
  };

  const handleVerify = async () => {
    if (!year || !scope1 || !scope2 || !industry)
      return alert("Please enter all required fields");

    const payload = {
      accounting_year: Number(year),
      reported_scope_1_metric_tonnes_co2e: Number(scope1),
      reported_scope_2_metric_tonnes_co2e: Number(scope2),
      industry,
    };

    setLoading(true);
    setStatus("Processing with Compliance Engine…");
    setScore(null);

    try {
      const res = await fetch("http://localhost:5000/api/anomaly/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      setLoading(false);

      // base score (from ML model)
      let base = result.score ?? 0;

      // Industry score penalty
      const penalty = (industryRisk[industry] ?? 0) * 100;
      let finalScore = Math.max(0, Math.round(base - penalty));

      const conf = Math.round(100 - Math.abs(result.ifScore * 100)) || 0;
      const stat =
        finalScore >= 70 ? "Verified" :
        finalScore >= 45 ? "Review Recommended" :
        "Rejected";

      setScore(finalScore);
      setConfidence(conf);
      setStatus(stat);

      if (stat === "Rejected") {
        setFindings([
          { type: "red", title: "High ESG Non-Compliance", msg: "Emission values deviate strongly from industry norms." },
          { type: "red", title: "Sector-specific Irregularity", msg: `Patterns observed in ${industry} sector indicate potential misreporting.` },
          { type: "yellow", title: "Immediate Audit Required", msg: "Manual review is mandatory for carbon credit approval." },
        ]);
      } else if (stat === "Review Recommended") {
        setFindings([
          { type: "yellow", title: "Minor Anomaly Detected", msg: "Dataset partially inconsistent with historical baselines." },
          { type: "green", title: "Low Manipulation Probability", msg: "No strong indication of fraudulent alteration." },
        ]);
      } else {
        setFindings([
          { type: "green", title: "ESG-Aligned Emission Pattern", msg: `${industry} sector benchmarks successfully met.` },
          { type: "green", title: "High Data Authenticity", msg: "Model confirms report reliability and compliance." },
        ]);
      }
    } catch {
      setLoading(false);
      alert("Internal Verification Server Error — Try again later");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-12 px-6">
      <header className="max-w-6xl mx-auto mb-10">
        <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
          Carbon Emission Compliance Assessment
        </h1>
        <p className="text-gray-600 text-lg mt-1">
          Automated ESG-aligned anomaly detection with industry-dependent scoring
        </p>
      </header>

      {/* Input Section */}
      <section className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-14">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Report Submission
        </h2>

        <div className="grid grid-cols-4 gap-6">
          <Input label="Accounting Year" value={year} onChange={setYear} />
          <Input label="Scope-1 Emissions (tCO₂e)" value={scope1} onChange={setScope1} />
          <Input label="Scope-2 Emissions (tCO₂e)" value={scope2} onChange={setScope2} />

          {/* NEW DROPDOWN */}
          <Dropdown
            label="Industry"
            value={industry}
            onChange={setIndustry}
            options={["Energy", "Manufacturing", "Transportation", "Agriculture", "Technology"]}
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`w-full mt-8 py-3 rounded-lg text-lg font-medium transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#0F4C81] hover:bg-[#09365C] text-white"
          }`}
        >
          {loading ? "Running Compliance Checks…" : "Run Verification"}
        </button>
      </section>

      {/* Scores */}
      {score !== null && (
        <section className="max-w-6xl mx-auto grid grid-cols-2 gap-8 mb-12">
          <ScoreCard label="Verification Score" value={score} subtitle={status} status={status} />
          <ScoreCard label="Model Confidence Index" value={`${confidence}%`} subtitle={status} status={status} />
        </section>
      )}

      {/* Findings */}
      {findings.length > 0 && (
        <section className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-8 mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Compliance Insights Summary</h2>
          {findings.map((f, i) => (
            <Finding key={i} type={f.type} title={f.title} msg={f.msg} />
          ))}
        </section>
      )}
    </div>
  );
}

/* COMPONENTS */
function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F4C81]"
      />
    </div>
  );
}

function Dropdown({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-3 w-full border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0F4C81]"
      >
        <option value="">Select Industry</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function ScoreCard({ label, value, subtitle, status }) {
  const isGood = status === "Verified";
  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-8 text-center ${isGood ? "text-green-600" : "text-red-600"}`}>
      <h3 className="text-lg font-medium text-gray-600 mb-3">{label}</h3>
      <div className="text-6xl font-bold">{value}</div>
      {subtitle && <p className="mt-2 text-gray-700 text-lg">{subtitle}</p>}
    </div>
  );
}

function Finding({ type, title, msg }) {
  const colors = {
    green: "border-green-500 bg-green-50",
    yellow: "border-yellow-500 bg-yellow-50",
    red: "border-red-500 bg-red-50",
  }[type];

  return (
    <div className={`border-l-4 px-4 py-3 rounded-md my-3 ${colors}`}>
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-gray-700 text-sm">{msg}</p>
    </div>
  );
}
