import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FileSearch,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  ChevronRight,
  X,
  Check,
  Search as SearchIcon,
  Search,
  Plus,
  FileText,
  Trash2,
} from "lucide-react";
import { clsx } from "clsx";
import { JD } from "../types";
import { getAuthHeaders, removeToken } from "../utils/auth";

const BACKEND_URL = "http://127.0.0.1:8000";

// localStorage key for persisting Resume Compare state
const RESUME_COMPARE_STATE_KEY = "resume_compare_state_v2";

type JdMode = "select" | "paste" | "upload";

function forceLogout() {
  localStorage.removeItem("user");
  removeToken();
  window.location.href = "/login";
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

// Extract number like 78.21 from "Resume matches JD by 78.21%"
function extractPercentFromText(text: string): number | null {
  if (!text) return null;
  const m = text.match(/(\d+(\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

// UPDATED: Supports jd_file upload (PDF/DOCX/TXT) + jd_text
async function postCompareInputResumeWithJd(params: {
  cvFile: File;
  jdText?: string;
  jdFile?: File;
  status?: string;
  activeTillDate?: string;
}) {
  const fd = new FormData();
  fd.append("file", params.cvFile);

  if (params.jdFile) {
    fd.append("jd_file", params.jdFile);
    fd.append("jd_text", " ");
  } else {
    fd.append("jd_text", params.jdText || "");
  }

  if (params.status) fd.append("status", params.status);
  if (params.activeTillDate) fd.append("active_till_date", params.activeTillDate);

  const res = await fetch(`${BACKEND_URL}/compare_input_resume_with_jd`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: fd,
  });

  if (res.status === 401) {
    forceLogout();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let msg = `Compare failed: ${res.status}`;
    try {
      const err = await res.json();
      msg = err?.detail || err?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

/* ===========================
   Templates
   =========================== */

type Template = {
  id: string;
  name: string;
  usageCount: number;
  features: string[];
  mapping: any;
  version?: string;
  description?: string;
  lastUpdated?: string;
  dbId?: number;
};

const defaultTemplates: Template[] = [];

function slugifyId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function mergeTemplatesUniqueByName(base: Template[], incoming: Template[]) {
  const map = new Map<string, Template>();
  for (const t of [...incoming, ...base]) {
    const key = (t.name || "").trim().toLowerCase();
    if (!map.has(key)) map.set(key, t);
  }
  return Array.from(map.values());
}

export default function ResumeCompare() {
  const [jds, setJds] = useState<JD[]>([]);
  const [jdSelectionMode, setJdSelectionMode] = useState<JdMode>("select");

  // SELECT
  const [selectedJdId, setSelectedJdId] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [positionQuery, setPositionQuery] = useState("");
  const [expQuery, setExpQuery] = useState("");
  const [openTillQuery, setOpenTillQuery] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  // PASTE
  const [pastedJdText, setPastedJdText] = useState("");

  // UPLOAD
  const [jdFile, setJdFile] = useState<File | null>(null);

  // CV
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Result
  const [isComparing, setIsComparing] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const selectBoxRef = useRef<HTMLDivElement | null>(null);

  // Templates state
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [templateApiLoading, setTemplateApiLoading] = useState(false);
  const [templateSuccess, setTemplateSuccess] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyErr, setNewCompanyErr] = useState<string | null>(null);
  const [addCompanyLoading, setAddCompanyLoading] = useState(false);

  const hydratedRef = useRef(false);
  const skipFirstModeEffectRef = useRef(true);

  useEffect(() => {
    fetchJDs();
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!selectBoxRef.current) return;
      if (!selectBoxRef.current.contains(e.target as Node)) setIsSuggestionsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (skipFirstModeEffectRef.current) {
      skipFirstModeEffectRef.current = false;
      return;
    }

    setMatchScore(null);
    setShowConfirmModal(false);

    if (jdSelectionMode !== "select") {
      setSelectedJdId("");
      setCompanyQuery("");
      setPositionQuery("");
      setExpQuery("");
      setOpenTillQuery("");
      setIsSuggestionsOpen(false);
    }
    if (jdSelectionMode !== "paste") setPastedJdText("");
    if (jdSelectionMode !== "upload") setJdFile(null);
  }, [jdSelectionMode]);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/company_templates`, {
          headers: getAuthHeaders(),
        });

        if (res.status === 401) {
          forceLogout();
          return;
        }

        if (!res.ok) return;

        const rows: Array<{ id: number; company_name: string }> = await res.json();

        const fromDb: Template[] = rows
          .map((r) => ({ dbId: r.id, name: (r.company_name || "").trim() }))
          .filter((r) => r.name)
          .map((r) => {
            const id = slugifyId(r.name) || `company_${Math.random().toString(16).slice(2)}`;
            return {
              id,
              dbId: r.dbId,
              name: r.name,
              lastUpdated: new Date().toISOString().slice(0, 10),
              usageCount: 0,
              features: ["Custom template"],
              mapping: {
                header: { name: "Name" },
                sections: ["Summary", "Experience", "Education", "Skills"],
              },
              version: "custom",
              description: "Custom template",
            };
          });

        setTemplates((prev) => {
          const merged = mergeTemplatesUniqueByName(defaultTemplates, mergeTemplatesUniqueByName(prev, fromDb));
          return merged;
        });

        if (fromDb.length > 0) {
          setSelectedTemplate((prev) => prev ?? fromDb[0]);
          setSelectedTemplateName((prev) => prev || fromDb[0].name);
        }
      } catch {}
    };

    loadCompanies();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RESUME_COMPARE_STATE_KEY);
      if (raw) {
        const s = JSON.parse(raw);

        if (s?.jdSelectionMode) setJdSelectionMode(s.jdSelectionMode);
        if (typeof s?.selectedJdId === "string") setSelectedJdId(s.selectedJdId);

        if (typeof s?.companyQuery === "string") setCompanyQuery(s.companyQuery);
        if (typeof s?.positionQuery === "string") setPositionQuery(s.positionQuery);
        if (typeof s?.expQuery === "string") setExpQuery(s.expQuery);
        if (typeof s?.openTillQuery === "string") setOpenTillQuery(s.openTillQuery);
        if (typeof s?.pastedJdText === "string") setPastedJdText(s.pastedJdText);

        if (typeof s?.matchScore === "number") setMatchScore(s.matchScore);

        if (typeof s?.selectedTemplateName === "string" && s.selectedTemplateName.trim()) {
          setSelectedTemplateName(s.selectedTemplateName.trim());
        }
      }
    } catch {}

    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!selectedTemplateName) return;
    const found = templates.find((t) => (t.name || "").toLowerCase() === selectedTemplateName.toLowerCase());
    if (found && found.id !== selectedTemplate?.id) {
      setSelectedTemplate(found);
    }
  }, [templates, selectedTemplateName, selectedTemplate?.id]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    try {
      localStorage.setItem(
        RESUME_COMPARE_STATE_KEY,
        JSON.stringify({
          jdSelectionMode,
          selectedJdId,
          companyQuery,
          positionQuery,
          expQuery,
          openTillQuery,
          pastedJdText,
          matchScore,
          selectedTemplateName,
        })
      );
    } catch {}
  }, [
    jdSelectionMode,
    selectedJdId,
    companyQuery,
    positionQuery,
    expQuery,
    openTillQuery,
    pastedJdText,
    matchScore,
    selectedTemplateName,
  ]);

  const filteredTemplates = useMemo(() => {
    const q = templateSearchQuery.toLowerCase();
    return templates.filter((t) => {
      const name = (t.name || "").toLowerCase();
      return name.includes(q);
    });
  }, [templateSearchQuery, templates]);

  const setTemplateOnBackend = async (templateName: string) => {
    try {
      setTemplateApiLoading(true);

      const res = await fetch(`${BACKEND_URL}/convert_template`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: templateName }),
      });

      if (res.status === 401) {
        forceLogout();
        return false;
      }

      if (!res.ok) {
        let detail = "";
        try {
          const data = await res.json();
          detail = data?.detail ? ` - ${data.detail}` : "";
        } catch {}
        throw new Error(`Template API failed (${res.status})${detail}`);
      }

      await res.json();
      setSelectedTemplateName(templateName);
      return true;
    } catch (e: any) {
      alert(e?.message || "Failed to apply template");
      return false;
    } finally {
      setTemplateApiLoading(false);
    }
  };

  const deleteCompanyTemplate = async (t: Template) => {
    const ok = window.confirm(`Delete "${t.name}" from templates list?`);
    if (!ok) return;

    try {
      if (t.dbId) {
        const res = await fetch(`${BACKEND_URL}/company_templates/${t.dbId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (res.status === 401) {
          forceLogout();
          return;
        }

        if (!res.ok) {
          let msg = `Delete failed: ${res.status}`;
          try {
            const data = await res.json();
            msg = data?.detail || data?.message || msg;
          } catch {}
          throw new Error(msg);
        }
      }

      setTemplates((prev) => prev.filter((x) => x.id !== t.id));

      if (selectedTemplate?.id === t.id) {
        const remaining = templates.filter((x) => x.id !== t.id);
        const fallback = remaining[0] || null;
        setSelectedTemplate(fallback);
        setSelectedTemplateName(fallback?.name || "");
      }
    } catch (e: any) {
      alert(e?.message || "Failed to delete template");
    }
  };

  const addCompany = async () => {
    const name = newCompanyName.trim();
    if (!name) {
      setNewCompanyErr("Company name is required.");
      return;
    }

    const id = slugifyId(name);
    if (!id) {
      setNewCompanyErr("Invalid company name.");
      return;
    }

    const exists = templates.some(
      (t) => t.id.toLowerCase() === id.toLowerCase() || t.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      setNewCompanyErr("This company already exists.");
      return;
    }

    try {
      setAddCompanyLoading(true);
      setNewCompanyErr(null);

      const res = await fetch(`${BACKEND_URL}/company_templates`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_name: name }),
      });

      if (res.status === 401) {
        forceLogout();
        return;
      }

      if (!res.ok) {
        let detail = "";
        try {
          const data = await res.json();
          detail = data?.detail ? ` - ${data.detail}` : "";
        } catch {}
        throw new Error(`Create company failed (${res.status})${detail}`);
      }

      const saved = await res.json();
      const savedName = (saved?.company_name || name).trim();
      const savedId = typeof saved?.id === "number" ? saved.id : undefined;

      const created: Template = {
        id: slugifyId(savedName) || id,
        dbId: savedId,
        name: savedName,
        lastUpdated: new Date().toISOString().slice(0, 10),
        usageCount: 0,
        features: ["Custom template"],
        mapping: {
          header: { name: "Name" },
          sections: ["Summary", "Experience", "Education", "Skills"],
        },
        version: "custom",
        description: "Custom template",
      };

      setTemplates((prev) => [created, ...prev]);
      setSelectedTemplate(created);
      setSelectedTemplateName(created.name);

      setNewCompanyName("");
      setNewCompanyErr(null);
      setIsAddOpen(false);
    } catch (e: any) {
      setNewCompanyErr(e?.message || "Failed to create company");
    } finally {
      setAddCompanyLoading(false);
    }
  };

  const fetchJDs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/get_all_jd`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        forceLogout();
        return;
      }

      if (!res.ok) throw new Error(`Failed to fetch JDs: ${res.status}`);
      const json = await res.json();
      const list = Array.isArray(json?.job_descriptions) ? json.job_descriptions : [];

      const mapped: JD[] = list.map((jd: any) => {
        const rawStatus = (jd?.status ?? "").toString().trim().toLowerCase();
        const status: "Open" | "Closed" =
          rawStatus === "activate" || rawStatus === "active" || rawStatus === "open" ? "Open" : "Closed";

        const openTillDate =
          typeof jd?.active_till_date === "string" && jd.active_till_date ? jd.active_till_date.split(" ")[0] : "";

        return {
          id: Number(jd?.id),
          companyName: (jd?.company_name ?? "").toString(),
          position: (jd?.position ?? "").toString(),
          yearsOfExperience: (jd?.years_of_experience ?? "").toString(),
          openTillDate,
          status,
          description: (jd?.jd ?? jd?.jd_description ?? jd?.description ?? "").toString(),
        } as JD;
      });

      setJds(mapped);
    } catch (e) {
      console.error(e);
      setJds([]);
    }
  };

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setCvFile(e.target.files[0]);
  };

  const handleJdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setJdFile(e.target.files[0]);
  };

  const dCompany = useDebouncedValue(companyQuery, 150);
  const dPosition = useDebouncedValue(positionQuery, 150);
  const dExp = useDebouncedValue(expQuery, 150);
  const dDate = useDebouncedValue(openTillQuery, 150);

  const selectedJd = useMemo(() => jds.find((j) => String(j.id) === String(selectedJdId)), [jds, selectedJdId]);

  const shouldShowSuggestions = useMemo(() => {
    const c = dCompany.trim().length >= 2;
    const p = dPosition.trim().length >= 2;
    const e = dExp.trim().length >= 1;
    const d = dDate.trim().length >= 1;
    return c || p || e || d;
  }, [dCompany, dPosition, dExp, dDate]);

  const filteredSuggestions = useMemo(() => {
    const cq = dCompany.trim().toLowerCase();
    const pq = dPosition.trim().toLowerCase();
    const eq = dExp.trim().toLowerCase();
    const dq = dDate.trim();

    let list = jds;

    if (cq.length >= 2) list = list.filter((jd) => (jd.companyName || "").toLowerCase().includes(cq));
    if (pq.length >= 2) list = list.filter((jd) => (jd.position || "").toLowerCase().includes(pq));
    if (eq.length >= 1) list = list.filter((jd) => (jd.yearsOfExperience || "").toLowerCase().includes(eq));
    if (dq.length >= 1) {
      list = list.filter((jd) => {
        const od = (jd.openTillDate || "").trim();
        return od === dq || od.startsWith(dq);
      });
    }

    return list.slice(0, 8);
  }, [jds, dCompany, dPosition, dExp, dDate]);

  const handlePickJd = (jd: JD) => {
    setSelectedJdId(String(jd.id));
    setIsSuggestionsOpen(false);

    setCompanyQuery(jd.companyName || "");
    setPositionQuery(jd.position || "");
    setExpQuery(jd.yearsOfExperience || "");
    setOpenTillQuery(jd.openTillDate || "");
  };

  const handleClearSelected = () => {
    setSelectedJdId("");
    setCompanyQuery("");
    setPositionQuery("");
    setExpQuery("");
    setOpenTillQuery("");
    setIsSuggestionsOpen(false);
  };

  const handleCompare = async () => {
    if (!cvFile) return;

    setIsComparing(true);
    setEmailSent(false);

    try {
      let jdTextToSend = "";

      if (jdSelectionMode === "select") {
        if (!selectedJdId || !selectedJd) throw new Error("Please select a JD.");
        if (!selectedJd.description || !selectedJd.description.trim()) {
          throw new Error("Selected JD has no description text. Please edit JD and save full description, or use Paste mode.");
        }
        jdTextToSend = selectedJd.description;
      }

      if (jdSelectionMode === "paste") {
        if (!pastedJdText.trim()) throw new Error("Please paste JD text.");
        jdTextToSend = pastedJdText;
      }

      if (jdSelectionMode === "upload") {
        if (!jdFile) throw new Error("Please upload a JD file.");
      }

      const result = await postCompareInputResumeWithJd({
        cvFile,
        jdText: jdSelectionMode === "upload" ? undefined : jdTextToSend,
        jdFile: jdSelectionMode === "upload" ? jdFile : undefined,
        status: "Activate",
        activeTillDate: openTillQuery || undefined,
      });

      let score: number | null = null;

      if (typeof result?.Score1 === "string") score = extractPercentFromText(result.Score1);
      if (score === null && typeof result?.Similarity_score_percent === "string") {
        score = extractPercentFromText(result.Similarity_score_percent);
      }

      if (score === null) {
        console.log("Backend response:", result);
        throw new Error("Backend did not return Score1 / Similarity_score_percent in expected format.");
      }

      setMatchScore(score);
      if (score <= 50) setShowConfirmModal(true);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Comparison failed.");
    } finally {
      setIsComparing(false);
    }
  };

  const handleConfirmConvert = async () => {
    setIsConverting(true);
    try {
      setShowConfirmModal(false);
      alert("Proceeding...");
    } catch (error) {
      console.error(error);
      alert("Conversion failed.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleSendEmail = async () => {
    if (matchScore === null) return;

    try {
      setIsSendingEmail(true);

      const fd = new FormData();
      fd.append("score", String(matchScore));

      const res = await fetch(`${BACKEND_URL}/send_notification`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: fd,
      });

      if (res.status === 401) {
        forceLogout();
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || data?.message || "Failed to send email");
      }

      alert(data?.message || "Email sent successfully");
      setEmailSent(true);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const isCompareDisabled =
    isComparing ||
    !cvFile ||
    (jdSelectionMode === "select" && !selectedJdId) ||
    (jdSelectionMode === "paste" && !pastedJdText.trim()) ||
    (jdSelectionMode === "upload" && !jdFile);

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resume Compare</h1>
        <p className="text-slate-500 mt-1">Compare candidate resumes against job descriptions to find the best match.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
                1
              </div>
              <h2 className="text-xl font-bold text-slate-900">Job Description Selection</h2>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-x-6 gap-y-4">
                {(["select", "paste", "upload"] as JdMode[]).map((m) => (
                  <label key={m} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="jd-mode"
                        className="peer hidden"
                        checked={jdSelectionMode === m}
                        onChange={() => setJdSelectionMode(m)}
                      />
                      <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400" />
                      <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {m === "select"
                        ? "Select JD from List"
                        : m === "paste"
                        ? "Paste JD Manually"
                        : "Upload JD (PDF/DOCX/TXT)"}
                    </span>
                  </label>
                ))}
              </div>

              {jdSelectionMode === "select" && (
                <div ref={selectBoxRef} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Search Job Descriptions
                    </label>

                    {selectedJdId ? (
                      <button
                        type="button"
                        onClick={handleClearSelected}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <SearchIcon className="w-4 h-4" />
                      </div>
                      <input
                        value={companyQuery}
                        onChange={(e) => {
                          setCompanyQuery(e.target.value);
                          setIsSuggestionsOpen(true);
                          setSelectedJdId("");
                        }}
                        onFocus={() => setIsSuggestionsOpen(true)}
                        placeholder="Company name (type 2+ letters)"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <SearchIcon className="w-4 h-4" />
                      </div>
                      <input
                        value={positionQuery}
                        onChange={(e) => {
                          setPositionQuery(e.target.value);
                          setIsSuggestionsOpen(true);
                          setSelectedJdId("");
                        }}
                        onFocus={() => setIsSuggestionsOpen(true)}
                        placeholder="Position (type 2+ letters)"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
                      />
                    </div>

                    <input
                      value={expQuery}
                      onChange={(e) => {
                        setExpQuery(e.target.value);
                        setIsSuggestionsOpen(true);
                        setSelectedJdId("");
                      }}
                      onFocus={() => setIsSuggestionsOpen(true)}
                      placeholder="Years of experience (e.g. 5+)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
                    />

                    <input
                      type="date"
                      value={openTillQuery}
                      onChange={(e) => {
                        setOpenTillQuery(e.target.value);
                        setIsSuggestionsOpen(true);
                        setSelectedJdId("");
                      }}
                      onFocus={() => setIsSuggestionsOpen(true)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
                    />
                  </div>

                  {isSuggestionsOpen && (
                    <div className="relative">
                      <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suggestions</p>
                          <p className="text-xs text-slate-400 font-medium">
                            {shouldShowSuggestions ? `${filteredSuggestions.length} result(s)` : "Type to search"}
                          </p>
                        </div>

                        {!shouldShowSuggestions ? (
                          <div className="px-4 py-4 text-sm text-slate-500">
                            Start typing (2+ letters) in Company/Position to see recommendations.
                          </div>
                        ) : filteredSuggestions.length === 0 ? (
                          <div className="px-4 py-4 text-sm text-slate-500">No matching JDs found.</div>
                        ) : (
                          <div className="max-h-72 overflow-auto">
                            {filteredSuggestions.map((jd) => {
                              const isActive = String(jd.id) === String(selectedJdId);
                              return (
                                <button
                                  key={String(jd.id)}
                                  type="button"
                                  onClick={() => handlePickJd(jd)}
                                  className={clsx(
                                    "w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3",
                                    isActive && "bg-blue-50"
                                  )}
                                >
                                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                    {(jd.companyName || "J")[0]?.toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                      <div>
                                        <p className="text-sm font-bold text-slate-900">
                                          {jd.companyName} — {jd.position}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                          Exp: {jd.yearsOfExperience} • Open till: {jd.openTillDate}
                                        </p>
                                      </div>
                                      {isActive ? (
                                        <span className="text-xs font-black text-blue-600 bg-white border border-blue-200 px-2 py-1 rounded-lg">
                                          Selected
                                        </span>
                                      ) : (
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                                          Choose
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedJd && (
                    <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3 mt-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-blue-900">{selectedJd.position}</h4>
                          <p className="text-sm text-blue-700 font-medium">{selectedJd.companyName}</p>
                        </div>
                        <span className="px-2 py-1 bg-white text-blue-600 text-[10px] font-black uppercase rounded border border-blue-200">
                          {selectedJd.yearsOfExperience}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600/80 line-clamp-3 leading-relaxed">
                        {selectedJd.description || "(No JD text stored in backend)"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {jdSelectionMode === "paste" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paste JD Description</label>
                  <textarea
                    rows={8}
                    value={pastedJdText}
                    onChange={(e) => setPastedJdText(e.target.value)}
                    placeholder="Paste the job requirements here..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium text-slate-700 text-sm"
                  />
                </div>
              )}

              {jdSelectionMode === "upload" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Upload JD File (PDF / DOCX / TXT)
                  </label>

                  <div className="relative group">
                    <input
                      type="file"
                      id="jd-upload"
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      onChange={handleJdFileChange}
                    />
                    <label
                      htmlFor="jd-upload"
                      className={clsx(
                        "w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300",
                        jdFile
                          ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                      )}
                    >
                      <div
                        className={clsx(
                          "p-3 rounded-full transition-colors duration-300",
                          jdFile
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                        )}
                      >
                        {jdFile ? <CheckCircle2 className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
                      </div>
                      <div className="text-center">
                        <p className={clsx("text-base font-bold", jdFile ? "text-emerald-900" : "text-slate-700")}>
                          {jdFile ? jdFile.name : "Click to upload JD"}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">Supports PDF / DOCX / TXT</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
                2
              </div>
              <h2 className="text-xl font-bold text-slate-900">Upload Resume (CV)</h2>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="relative group">
                <input type="file" id="cv-upload" className="hidden" accept=".pdf,.docx" onChange={handleCvFileChange} />
                <label
                  htmlFor="cv-upload"
                  className={clsx(
                    "w-full py-16 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300",
                    cvFile
                      ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                  )}
                >
                  <div
                    className={clsx(
                      "p-4 rounded-full transition-colors duration-300",
                      cvFile
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                    )}
                  >
                    {cvFile ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                  </div>
                  <div className="text-center">
                    <p className={clsx("text-lg font-bold", cvFile ? "text-emerald-900" : "text-slate-700")}>
                      {cvFile ? cvFile.name : "Click to upload CV"}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">Supports PDF or DOCX format</p>
                  </div>
                </label>
              </div>

              <button
                onClick={handleCompare}
                disabled={isCompareDisabled}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest"
              >
                {isComparing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Analyzing Match...
                  </>
                ) : (
                  <>
                    <FileSearch className="w-6 h-6" />
                    Compare Resume
                  </>
                )}
              </button>
            </div>
          </section>
        </div>

        {matchScore !== null ? (
          <div className="space-y-6">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
                  3
                </div>
                <h2 className="text-xl font-bold text-slate-900">Template</h2>
              </div>

              <div className="w-full flex flex-col gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={templateSearchQuery}
                        onChange={(e) => setTemplateSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAddOpen(true);
                        setNewCompanyErr(null);
                      }}
                      className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all flex items-center justify-center text-slate-700"
                      title="Add company"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar max-h-[520px]">
                  {filteredTemplates.map((template) => {
                    const isSelected = selectedTemplate?.id === template.id;
                    const canDelete = !!template.dbId;

                    return (
                      <div key={template.id} className="relative">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setSelectedTemplateName(template.name);
                            setTemplateSuccess("");
                          }}
                          className={clsx(
                            "w-full text-left p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden",
                            isSelected
                              ? "bg-white border-blue-600 shadow-md ring-1 ring-blue-600"
                              : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={clsx(
                                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                              )}
                            >
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 truncate">{template.name}</h3>
                                <span className="text-[10px] font-mono text-slate-400">{template.version}</span>
                              </div>
                              <p className="text-xs text-slate-500 truncate mt-0.5">{template.description}</p>
                            </div>
                          </div>
                          {isSelected && <div className="absolute top-0 right-0 w-1 h-full bg-blue-600" />}
                        </button>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => deleteCompanyTemplate(template)}
                            className="absolute top-3 right-3 p-2 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all"
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={async () => {
                    if (!selectedTemplateName) return;
                    const ok = await setTemplateOnBackend(selectedTemplateName);
                    if (ok) {
                      setTemplateSuccess("Successfully selected this template");
                      setTimeout(() => setTemplateSuccess(""), 3000);
                    }
                  }}
                  disabled={templateApiLoading || !selectedTemplateName}
                  className={clsx(
                    "w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all shadow-sm border",
                    templateApiLoading
                      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-blue-300"
                  )}
                  title="Apply selected template"
                >
                  {templateApiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Apply Template
                    </>
                  )}
                </button>

                {templateSuccess && (
                  <div className="mt-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                    {templateSuccess}
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div />
        )}
      </div>

      {matchScore !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-8 border-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-black text-blue-600">{matchScore}%</span>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Match Score</p>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-2xl font-bold text-slate-900">Analysis Complete</h3>
                </div>
                <p className="text-slate-600 leading-relaxed max-w-2xl">Backend response parsed successfully.</p>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || emailSent || matchScore === null}
                  className={clsx(
                    "w-full py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg",
                    isSendingEmail || emailSent
                      ? "bg-slate-300 text-white cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                  )}
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : emailSent ? (
                    <>
                      Sent Email
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Send Email
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-amber-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Low Match Score</h3>
                <p className="text-slate-500">
                  The resume matches less than <span className="font-bold text-slate-900">50%</span> of the job
                  description. Do you want to continue?
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmConvert}
                  disabled={isConverting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Yes, Proceed
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add Company Template</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"
                title="Close"
                disabled={addCompanyLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Company name</label>
                <input
                  autoFocus
                  value={newCompanyName}
                  onChange={(e) => {
                    setNewCompanyName(e.target.value);
                    setNewCompanyErr(null);
                  }}
                  placeholder="e.g. Deloitte"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCompany();
                  }}
                  disabled={addCompanyLoading}
                />
                {newCompanyErr && <p className="text-sm text-rose-600 font-semibold">{newCompanyErr}</p>}
                <p className="text-xs text-slate-500">
                  This will add the company in the templates list and persist it in DB. Backend template is applied only
                  when you click <span className="font-bold">Apply Template</span>.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
                  disabled={addCompanyLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={addCompany}
                  disabled={addCompanyLoading}
                  className={clsx(
                    "flex-1 py-3 font-bold rounded-2xl transition-all flex items-center justify-center gap-2",
                    addCompanyLoading ? "bg-blue-200 text-white cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  {addCompanyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  {addCompanyLoading ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}