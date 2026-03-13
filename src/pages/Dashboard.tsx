import React, { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Users,
  Briefcase,
  FileSearch,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";

const BACKEND_URL = "http://127.0.0.1:8000";

type DashboardStat = {
  label: string;
  value: string;
  icon: any;
  color: string;
  bg: string;
  trend: string;
  trendUp: boolean;
};

type CandidateApiRow = {
  id: number;
  candidate_name: string;
  experience: string;
  score: number;
  extracted_on: string;
  position: string;
  user_id?: number;
};

type ResumeApiRow = {
  Id: number;
  InputResume: string;
  OutputResume: string;
  JDScore: number;
  OutputScore: number;
  Email: string;
  Time: string;
};

type JdApiRow = {
  id: number;
  company_name: string;
  position: string;
  years_of_experience: string;
  status: string;
  active_till_date?: string | null;
};

type MeResponse = {
  id: number;
  username: string;
  email: string;
  role: string;
};

function getAuthHeaders() {
  const token = localStorage.getItem("token") || "";
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function formatRelativeTime(dateString?: string | null) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 60) return `${Math.max(diffMin, 1)} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay === 1) return "Yesterday";
  return `${diffDay} days ago`;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<MeResponse | null>(null);
  const [jdRows, setJdRows] = useState<JdApiRow[]>([]);
  const [resumeRows, setResumeRows] = useState<ResumeApiRow[]>([]);
  const [candidateRows, setCandidateRows] = useState<CandidateApiRow[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [meRes, jdRes, dashRes, candidateRes] = await Promise.all([
        fetch(`${BACKEND_URL}/me`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
        fetch(`${BACKEND_URL}/get_all_jd`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
        fetch(`${BACKEND_URL}/dashboard`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
        fetch(`${BACKEND_URL}/api/candidates`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
      ]);

      const meJson = await meRes.json();
      const jdJson = await jdRes.json();
      const dashJson = await dashRes.json();
      const candidateJson = await candidateRes.json();

      if (!meRes.ok) throw new Error(meJson?.detail || "Failed to fetch user");
      if (!jdRes.ok) throw new Error(jdJson?.detail || "Failed to fetch JDs");
      if (!dashRes.ok) throw new Error(dashJson?.detail || "Failed to fetch dashboard data");
      if (!candidateRes.ok) throw new Error(candidateJson?.detail || "Failed to fetch candidates");

      setCurrentUser(meJson);
      setJdRows(Array.isArray(jdJson?.job_descriptions) ? jdJson.job_descriptions : []);
      setResumeRows(Array.isArray(dashJson) ? dashJson : []);
      setCandidateRows(Array.isArray(candidateJson) ? candidateJson : []);
    } catch (error) {
      console.error("Dashboard fetch failed:", error);
      setCurrentUser(null);
      setJdRows([]);
      setResumeRows([]);
      setCandidateRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const totalJds = jdRows.length;
  const openJds = jdRows.filter((j) => (j.status || "").toLowerCase() === "activate" || (j.status || "").toLowerCase() === "open").length;
  const resumesAnalyzed = resumeRows.length;
  const totalCandidates = candidateRows.length;

  const avgMatchScore = useMemo(() => {
    if (!resumeRows.length) return 0;
    const total = resumeRows.reduce((sum, row) => sum + Number(row?.JDScore || 0), 0);
    return Math.round(total / resumeRows.length);
  }, [resumeRows]);

  const highMatchRate = useMemo(() => {
    if (!candidateRows.length) return 0;
    const high = candidateRows.filter((c) => Number(c.score) >= 80).length;
    return Math.round((high / candidateRows.length) * 100);
  }, [candidateRows]);

  const recentActivity = useMemo(() => {
    return [...candidateRows]
      .sort((a, b) => {
        const da = new Date(a.extracted_on || "").getTime();
        const db = new Date(b.extracted_on || "").getTime();
        return db - da;
      })
      .slice(0, 4)
      .map((row) => ({
        id: row.id,
        candidate: row.candidate_name || "Not Found",
        position: row.position || "Not Found",
        score: Math.round(Number(row.score || 0)),
        time: formatRelativeTime(row.extracted_on),
      }));
  }, [candidateRows]);

  const stats: DashboardStat[] = [
    {
      label: "Total JDs",
      value: String(totalJds),
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: `${openJds} open`,
      trendUp: true,
    },
    {
      label: "Resumes Analyzed",
      value: String(resumesAnalyzed),
      icon: FileSearch,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      trend: "Live data",
      trendUp: true,
    },
    {
      label: "Total Candidates",
      value: String(totalCandidates),
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: `${highMatchRate}% high match`,
      trendUp: true,
    },
    {
      label: "Avg. Match Score",
      value: `${avgMatchScore}%`,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: avgMatchScore >= 50 ? "Healthy" : "Needs review",
      trendUp: avgMatchScore >= 50,
    },
  ];

  const username = currentUser?.username || "User";
  const roleLabel =
    currentUser?.role === "admin"
      ? "HR Admin"
      : currentUser?.role
      ? currentUser.role.toUpperCase()
      : "HR";

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {roleLabel}
          </h1>
          <p className="text-slate-500 mt-1">
            {currentUser ? `Signed in as ${username}. Here's what's happening in your recruitment pipeline.` : "Here's what's happening with your recruitment pipeline today."}
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-bold ${
                  stat.trendUp ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {stat.trendUp ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </h3>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Comparisons</h3>
            <Link
              to="/resume-compare"
              className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              New Compare
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-10 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-slate-500 font-medium">Loading dashboard...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-10 text-center text-slate-500 font-medium">
                No recent comparisons found.
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                      {activity.candidate
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{activity.candidate}</h4>
                      <p className="text-sm text-slate-500">{activity.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div
                        className={`text-sm font-black ${
                          activity.score >= 80
                            ? "text-emerald-600"
                            : activity.score >= 50
                            ? "text-amber-600"
                            : "text-rose-600"
                        }`}
                      >
                        {activity.score}% Match
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-50 text-center">
            <Link
              to="/candidate-list"
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              View All Candidates
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 p-8 rounded-2xl shadow-xl shadow-blue-600/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Ready to hire?</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                Start a new resume comparison to find the perfect candidate for your open positions.
              </p>
              <Link
                to="/resume-compare"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg"
              >
                Start Matching
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Pipeline Status</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Open JDs</span>
                  <span className="text-blue-600">
                    {openJds} / {totalJds}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: totalJds ? `${Math.round((openJds / totalJds) * 100)}%` : "0%",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-400">High Match Rate</span>
                  <span className="text-emerald-600">{highMatchRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${highMatchRate}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Avg. Match Score</span>
                  <span className="text-amber-600">{avgMatchScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${avgMatchScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}