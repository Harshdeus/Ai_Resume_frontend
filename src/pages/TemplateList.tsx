import React, { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { clsx } from "clsx";

const BACKEND_URL = "http://127.0.0.1:8000";

type DashboardRow = {
  Id: number;
  InputResume: string;
  OutputResume: string;
  JDScore: number;
  OutputScore: number;
  Email: string;
  Time: string | null;
};

function getAuthHeaders() {
  const token = localStorage.getItem("token") || "";
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export default function TemplateList() {
  const [rows, setRows] = useState<DashboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/dashboard`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || `Failed: ${res.status}`);
      }

      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch template list:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((r) => {
      return (
        (r.InputResume || "").toLowerCase().includes(query) ||
        (r.OutputResume || "").toLowerCase().includes(query) ||
        (r.Email || "").toLowerCase().includes(query)
      );
    });
  }, [rows, q]);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Template List</h1>
          <p className="text-slate-500 mt-1">Fetched from MySQL via /dashboard API</p>
        </div>

        <button
          onClick={fetchRows}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by resume name / output / email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div className="text-xs font-bold text-slate-500">
            {filtered.length} row(s)
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-slate-600 font-semibold">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No data found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left">
                  <th className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Id</th>
                  <th className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Input Resume</th>
                  <th className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Output Resume</th>
                  <th className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">JD Score</th>
                  <th className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Output Score</th>
                  <th className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest">Time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const jd = Number(r.JDScore || 0);
                  return (
                    <tr key={r.Id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">{r.Id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{r.InputResume}</td>
                      <td className="px-6 py-4 text-slate-600">{r.OutputResume}</td>
                      <td className="px-6 py-4">
                        <span
                          className={clsx(
                            "px-3 py-1 rounded-full text-xs font-black border",
                            jd >= 80
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : jd >= 50
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          )}
                        >
                          {jd}%
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{r.OutputScore}%</td>
                      <td className="px-6 py-4 text-slate-700">{r.Email}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {r.Time ? new Date(r.Time).toLocaleString() : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}