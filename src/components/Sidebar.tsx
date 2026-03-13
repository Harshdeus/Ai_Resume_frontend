import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FileSearch,
  Users,
  ChevronRight,
  FileText,
  List,
} from "lucide-react";
import { clsx } from "clsx";
import { getAuthHeaders, removeToken } from "../utils/auth";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/jd-management", label: "JD Management", icon: Briefcase },
  { path: "/resume-compare", label: "Resume Compare", icon: FileSearch },
  { path: "/candidate-list", label: "Candidate List", icon: Users },
  { path: "/templates", label: "Templates", icon: FileText },
  { path: "/template-list", label: "Template List", icon: List },
];

const API = "http://127.0.0.1:8000";

export default function Sidebar() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username = storedUser?.username || "HR Admin";
  const email = storedUser?.email || "admin@company.com";

  const handleLogout = async () => {
    try {
      await fetch(`${API}/logout`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");
      removeToken();
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20 shadow-xl">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">HR Matcher</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-inner">
            {username?.charAt(0)?.toUpperCase() || "H"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">{username}</span>
            <span className="text-xs text-slate-400 truncate">{email}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}