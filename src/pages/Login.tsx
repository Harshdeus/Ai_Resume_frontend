import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Briefcase, Mail, Lock, ArrowRight } from "lucide-react";
import { setToken, getToken } from "../utils/auth";

const API = "http://127.0.0.1:8000";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const existingToken = getToken();
    if (existingToken) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("email", email.trim());
      form.append("password", password);

      const res = await fetch(`${API}/login`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      if (!data.access_token) {
        throw new Error("Token not received from server");
      }

      setToken(data.access_token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        localStorage.removeItem("user");
      }

      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">HR Matcher</h1>
            <p className="text-sm text-slate-500">Recruitment workspace</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400" />

          <div className="p-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
              Welcome Back
            </h2>

            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link to="/forgot-password" className="text-blue-600">
                Forgot Password?
              </Link>

              <p className="mt-4">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-600 font-bold">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}