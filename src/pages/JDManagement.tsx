import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Upload,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { JD } from "../types";
import { clsx } from "clsx";
import { getAuthHeaders, removeToken } from "../utils/auth";

const BACKEND_URL = "http://127.0.0.1:8000";
const CREATE_JD_ENDPOINT = `${BACKEND_URL}/create_jd`;
const UPDATE_JD_ENDPOINT = (id: string) => `${BACKEND_URL}/job_descriptions/${id}`;
const DELETE_JD_ENDPOINT = (id: string) => `${BACKEND_URL}/delete_jd/${id}`;

// =========================================================
// LOCAL STORAGE
// =========================================================
const LS_KEY = "jd_local_store_v1";
const MAX_FILE_BYTES = 2.5 * 1024 * 1024;

type StoredFile = {
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
};

type StoredJD = {
  id: string;
  description: string;
  file?: StoredFile;
};

type WorkMode = "Work from office" | "Work from Home" | "Hybrid";
type EmploymentType = "Full-time" | "Freelance" | "Contract";

type ExtendedJD = JD & {
  workMode?: WorkMode | "";
  employmentType?: EmploymentType | "";
  minBudget?: string;
  maxBudget?: string;
};

type JDFormState = Omit<ExtendedJD, "id">;

function safeJsonParse<T>(v: string | null, fallback: T): T {
  try {
    if (!v) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function readStore(): StoredJD[] {
  return safeJsonParse<StoredJD[]>(localStorage.getItem(LS_KEY), []);
}

function writeStore(rows: StoredJD[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

function upsertStoredJD(row: StoredJD) {
  const rows = readStore();
  const idx = rows.findIndex((x) => x.id === row.id);
  if (idx >= 0) rows[idx] = row;
  else rows.push(row);
  writeStore(rows);
}

function getStoredJD(id: string): StoredJD | null {
  const rows = readStore();
  return rows.find((x) => x.id === id) || null;
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("File read failed"));
    r.readAsDataURL(file);
  });
}

function sanitizeBudgetInput(value: string) {
  return value.replace(/\D/g, "");
}

function forceLogout() {
  localStorage.removeItem("user");
  removeToken();
  window.location.href = "/login";
}

// JD preview: 3–4 words + ...
function jdPreview(text: string, maxWords = 4) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const words = clean.split(" ");
  if (words.length <= maxWords) return clean;
  return words.slice(0, maxWords).join(" ") + "...";
}

export default function JDManagement() {
  const [jds, setJds] = useState<ExtendedJD[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Closed">("All");

  const [formData, setFormData] = useState<JDFormState>({
    companyName: "",
    position: "",
    yearsOfExperience: "",
    openTillDate: "",
    status: "Open",
    description: "",
    workMode: "",
    employmentType: "",
    minBudget: "",
    maxBudget: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isCompanyDdOpen, setIsCompanyDdOpen] = useState(false);
  const companyBoxRef = useRef<HTMLDivElement | null>(null);

  const [jdFile, setJdFile] = useState<File | null>(null);

  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editingJD, setEditingJD] = useState<ExtendedJD | null>(null);

  const [editForm, setEditForm] = useState<JDFormState>({
    companyName: "",
    position: "",
    yearsOfExperience: "",
    openTillDate: "",
    status: "Open",
    description: "",
    workMode: "",
    employmentType: "",
    minBudget: "",
    maxBudget: "",
  });

  const [isEditCompanyDdOpen, setIsEditCompanyDdOpen] = useState(false);
  const editCompanyBoxRef = useRef<HTMLDivElement | null>(null);

  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewJD, setViewJD] = useState<ExtendedJD | null>(null);
  const [viewText, setViewText] = useState("");
  const [viewPdfUrl, setViewPdfUrl] = useState("");
  const [viewError, setViewError] = useState<string | null>(null);
  const [viewFileName, setViewFileName] = useState<string>("");
  const [viewFileType, setViewFileType] = useState<string>("");
  const [viewFileTooLarge, setViewFileTooLarge] = useState(false);

  useEffect(() => {
    fetchJDs();
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!companyBoxRef.current) return;
      if (!companyBoxRef.current.contains(e.target as Node)) setIsCompanyDdOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!editCompanyBoxRef.current) return;
      if (!editCompanyBoxRef.current.contains(e.target as Node)) setIsEditCompanyDdOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!actionMenuRef.current) return;
      if (!actionMenuRef.current.contains(e.target as Node)) setOpenActionId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenActionId(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (viewPdfUrl?.startsWith("blob:")) URL.revokeObjectURL(viewPdfUrl);
    };
  }, [viewPdfUrl]);

  const readBody = async (res: Response) => {
    const contentType = res.headers.get("content-type") || "";
    try {
      if (contentType.includes("application/json")) return JSON.stringify(await res.json());
      return await res.text();
    } catch {
      return "";
    }
  };

  const handleUnauthorized = (res: Response) => {
    if (res.status === 401) {
      forceLogout();
      return true;
    }
    return false;
  };

  const fetchJDs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/get_all_jd`, {
        headers: getAuthHeaders(),
      });

      if (handleUnauthorized(res)) return;

      if (!res.ok) throw new Error(`Failed to fetch JDs: ${res.status}`);

      const json = await res.json();
      const list = Array.isArray(json?.job_descriptions) ? json.job_descriptions : [];

      const mapped: ExtendedJD[] = list.map((jd: any) => {
        const rawStatus = (jd?.status ?? "").toString().trim();
        const normalized = rawStatus.toLowerCase();

        const status: "Open" | "Closed" =
          normalized === "activate" || normalized === "active" || normalized === "open" ? "Open" : "Closed";

        const openTillDate =
          typeof jd?.active_till_date === "string" && jd.active_till_date ? jd.active_till_date.split(" ")[0] : "";

        const backendDesc = (jd?.jd ?? jd?.jd_description ?? jd?.description ?? "").toString();

        return {
          id: String(jd?.id ?? ""),
          companyName: (jd?.company_name ?? "").toString(),
          position: (jd?.position ?? "").toString(),
          yearsOfExperience: (jd?.years_of_experience ?? "").toString(),
          openTillDate,
          status,
          description: backendDesc,
          workMode: (jd?.work_mode ?? "").toString() as WorkMode | "",
          employmentType: (jd?.employment_type ?? "").toString() as EmploymentType | "",
          minBudget: (jd?.min_budget_lpa ?? jd?.budget_min ?? "").toString(),
          maxBudget: (jd?.max_budget_lpa ?? jd?.budget_max ?? "").toString(),
        };
      });

      setJds(mapped);
    } catch (error) {
      console.error("Failed to fetch JDs:", error);
      setJds([]);
    } finally {
      setIsLoading(false);
    }
  };

  const companyOptions = useMemo(() => {
    const s = new Set<string>();
    for (const jd of jds) {
      const name = (jd.companyName || "").trim();
      if (name) s.add(name);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [jds]);

  const filteredCompanyOptions = useMemo(() => {
    const q = (formData.companyName || "").trim().toLowerCase();
    if (!q) return companyOptions.slice(0, 10);
    return companyOptions.filter((c) => c.toLowerCase().includes(q)).slice(0, 10);
  }, [companyOptions, formData.companyName]);

  const filteredEditCompanyOptions = useMemo(() => {
    const q = (editForm.companyName || "").trim().toLowerCase();
    if (!q) return companyOptions.slice(0, 10);
    return companyOptions.filter((c) => c.toLowerCase().includes(q)).slice(0, 10);
  }, [companyOptions, editForm.companyName]);

  const handlePickCompany = (name: string) => {
    setFormData((prev) => ({ ...prev, companyName: name }));
    setIsCompanyDdOpen(false);
  };

  const handlePickEditCompany = (name: string) => {
    setEditForm((prev) => ({ ...prev, companyName: name }));
    setIsEditCompanyDdOpen(false);
  };

  const readJDTextFromFile = async (file: File): Promise<string> => {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (ext === "txt") return await file.text();
    return "";
  };

  const createJdFromFrontend = async () => {
    const backendStatus = formData.status === "Open" ? "Activate" : "Closed";

    const fd = new FormData();
    fd.append("company_name", (formData.companyName || "").trim());
    fd.append("position", (formData.position || "").trim());
    fd.append("years_of_experience", (formData.yearsOfExperience || "").trim());
    fd.append("status", backendStatus);

    fd.append("work_mode", (formData.workMode || "").trim());
    fd.append("employment_type", (formData.employmentType || "").trim());
    fd.append("min_budget_lpa", (formData.minBudget || "").trim());
    fd.append("max_budget_lpa", (formData.maxBudget || "").trim());

    if ((formData.openTillDate || "").trim()) {
      fd.append("open_till_date", formData.openTillDate.trim());
      fd.append("active_till_date", `${formData.openTillDate.trim()} 00:00:00`);
    }

    let jdTextToSend = (formData.description || "").trim();
    if (!jdTextToSend && jdFile) jdTextToSend = (await readJDTextFromFile(jdFile)).trim();

    // backend create_jd reads jd_text
    fd.append("jd_text", jdTextToSend);

    if (jdFile) {
      fd.append("jd_file", jdFile);
    }

    const res = await fetch(CREATE_JD_ENDPOINT, {
      method: "POST",
      headers: getAuthHeaders(),
      body: fd,
    });

    if (handleUnauthorized(res)) return;

    if (!res.ok) {
      const err = await readBody(res);
      throw new Error(`Create JD failed: ${res.status}\n${err}`);
    }

    let createdId = "";
    try {
      const contentType = (res.headers.get("content-type") || "").toLowerCase();
      if (contentType.includes("application/json")) {
        const data = await res.clone().json();
        createdId = String(data?.id || data?.jd_id || data?.job_description_id || "");
      }
    } catch {}

    if (!createdId) {
      try {
        const r = await fetch(`${BACKEND_URL}/get_all_jd`, {
          headers: getAuthHeaders(),
        });

        if (handleUnauthorized(r)) return;

        if (r.ok) {
          const j = await r.json();
          const first = Array.isArray(j?.job_descriptions) ? j.job_descriptions[0] : null;
          if (first?.id != null) createdId = String(first.id);
        }
      } catch {}
    }

    if (!createdId) createdId = `local_${Date.now()}`;

    let finalDesc = (formData.description || "").trim();
    if (!finalDesc && jdFile) finalDesc = (await readJDTextFromFile(jdFile)).trim();

    const row: StoredJD = { id: createdId, description: finalDesc };

    if (jdFile) {
      const fileMeta: StoredFile = { name: jdFile.name, type: jdFile.type || "", size: jdFile.size };

      if (jdFile.size <= MAX_FILE_BYTES) {
        try {
          fileMeta.dataUrl = await fileToDataUrl(jdFile);
        } catch {}
      }

      row.file = fileMeta;
    }

    upsertStoredJD(row);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createJdFromFrontend();

      setShowForm(false);
      setIsCompanyDdOpen(false);

      setFormData({
        companyName: "",
        position: "",
        yearsOfExperience: "",
        openTillDate: "",
        status: "Open",
        description: "",
        workMode: "",
        employmentType: "",
        minBudget: "",
        maxBudget: "",
      });

      setJdFile(null);
      await fetchJDs();
    } catch (error: any) {
      console.error("Failed to create JD:", error);
      alert(error?.message || "Failed to create JD (unknown error).");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJDs = jds.filter((jd) => {
    const matchesSearch =
      jd.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jd.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || jd.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openEditModal = (jd: ExtendedJD) => {
    const stored = getStoredJD(jd.id);
    setEditingJD(jd);
    setEditForm({
      companyName: jd.companyName || "",
      position: jd.position || "",
      yearsOfExperience: jd.yearsOfExperience || "",
      openTillDate: jd.openTillDate || "",
      status: jd.status || "Open",
      description: stored?.description || jd.description || "",
      workMode: jd.workMode || "",
      employmentType: jd.employmentType || "",
      minBudget: jd.minBudget || "",
      maxBudget: jd.maxBudget || "",
    });
    setIsEditOpen(true);
    setOpenActionId(null);
    setIsEditCompanyDdOpen(false);
  };

  const saveEdit = async () => {
    if (!editingJD) return;

    setEditSaving(true);
    try {
      const backendStatus = editForm.status === "Open" ? "Activate" : "Closed";

      const fd = new FormData();
      fd.append("company_name", (editForm.companyName || "").trim());
      fd.append("position", (editForm.position || "").trim());
      fd.append("years_of_experience", (editForm.yearsOfExperience || "").trim());
      fd.append("status", backendStatus);

      fd.append("work_mode", (editForm.workMode || "").trim());
      fd.append("employment_type", (editForm.employmentType || "").trim());
      fd.append("min_budget_lpa", (editForm.minBudget || "").trim());
      fd.append("max_budget_lpa", (editForm.maxBudget || "").trim());

      fd.append("jd_description", (editForm.description || "").trim());
      fd.append("description", (editForm.description || "").trim());

      if ((editForm.openTillDate || "").trim()) {
        fd.append("active_till_date", `${editForm.openTillDate.trim()}T00:00:00`);
      } else {
        fd.append("active_till_date", "");
      }

      const res = await fetch(UPDATE_JD_ENDPOINT(editingJD.id), {
        method: "PUT",
        headers: getAuthHeaders(),
        body: fd,
      });

      if (handleUnauthorized(res)) return;

      if (!res.ok) {
        const err = await readBody(res);
        throw new Error(`Update JD failed: ${res.status}\n${err}`);
      }

      const prev = getStoredJD(editingJD.id);
      upsertStoredJD({
        id: editingJD.id,
        description: (editForm.description || "").trim(),
        file: prev?.file,
      });

      setIsEditOpen(false);
      setEditingJD(null);
      setIsEditCompanyDdOpen(false);
      await fetchJDs();
    } catch (e: any) {
      alert(e?.message || "Update failed");
    } finally {
      setEditSaving(false);
    }
  };

  const deleteJD = async (jd: ExtendedJD) => {
    const ok = window.confirm(`Delete JD for "${jd.companyName}" - "${jd.position}"?`);
    if (!ok) return;

    setOpenActionId(null);
    setDeleteLoadingId(jd.id);
    try {
      const res = await fetch(DELETE_JD_ENDPOINT(jd.id), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (handleUnauthorized(res)) return;

      if (!res.ok) {
        const err = await readBody(res);
        throw new Error(`Delete JD failed: ${res.status}\n${err}`);
      }

      const rows = readStore().filter((x) => x.id !== jd.id);
      writeStore(rows);

      setJds((prev) => prev.filter((x) => x.id !== jd.id));
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const openViewModal = async (jd: ExtendedJD) => {
    setIsViewOpen(true);
    setViewJD(jd);
    setViewLoading(true);
    setViewError(null);
    setViewFileName("");
    setViewFileType("");
    setViewFileTooLarge(false);

    if (viewPdfUrl?.startsWith("blob:")) URL.revokeObjectURL(viewPdfUrl);
    setViewPdfUrl("");
    setViewText("");

    try {
      const stored = getStoredJD(jd.id);

      const fullText = (stored?.description || jd.description || "").toString();
      setViewText(fullText);

      if (!stored && !fullText.trim()) {
        setViewError("No JD text found. Backend is not returning jd AND localStorage has no saved JD.");
        return;
      }

      if (stored?.file) {
        setViewFileName(stored.file.name || "");
        setViewFileType(stored.file.type || "");

        if (!stored.file.dataUrl) {
          if ((stored.file.size || 0) > MAX_FILE_BYTES) setViewFileTooLarge(true);
        } else {
          const mime = (stored.file.type || "").toLowerCase();
          const nameLower = (stored.file.name || "").toLowerCase();

          if (mime.includes("pdf") || nameLower.endsWith(".pdf")) {
            setViewPdfUrl(stored.file.dataUrl);
          } else {
            setViewPdfUrl("");
          }
        }
      }
    } catch (e: any) {
      setViewError(e?.message || "Failed to load JD");
    } finally {
      setViewLoading(false);
    }
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
    setViewJD(null);
    setViewError(null);
    setViewText("");
    setViewFileName("");
    setViewFileType("");
    setViewFileTooLarge(false);
    if (viewPdfUrl?.startsWith("blob:")) URL.revokeObjectURL(viewPdfUrl);
    setViewPdfUrl("");
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowForm(false)}
            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Create New Job Description</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2" ref={companyBoxRef}>
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Company Name</label>

                <div className="relative">
                  <input
                    required
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => {
                      setFormData({ ...formData, companyName: e.target.value });
                      setIsCompanyDdOpen(true);
                    }}
                    onFocus={() => setIsCompanyDdOpen(true)}
                    placeholder="e.g. Google"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />

                  {isCompanyDdOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Companies</p>
                        <p className="text-xs text-slate-400 font-medium">{companyOptions.length} total</p>
                      </div>

                      {companyOptions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">No companies yet. Type to add a new one.</div>
                      ) : filteredCompanyOptions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">No match. You can use “{formData.companyName}”.</div>
                      ) : (
                        <div className="max-h-56 overflow-auto">
                          {filteredCompanyOptions.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => handlePickCompany(name)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                {name[0]?.toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-slate-800">{name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500">Tip: Select an existing company or type a new company name.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Position</label>
                <input
                  required
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Years of Experience</label>
                <input
                  required
                  type="text"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  placeholder="e.g. 5+ years"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Open Till Date</label>
                <input
                  required
                  type="date"
                  value={formData.openTillDate}
                  onChange={(e) => setFormData({ ...formData, openTillDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Work Mode</label>
                <select
                  required
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value as WorkMode })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="">Select work mode</option>
                  <option value="Work from office">Work from office</option>
                  <option value="Work from Home">Work from Home</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Employment Type</label>
                <select
                  required
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as EmploymentType })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="">Select employment type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Budget</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Min Budget</p>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        value={formData.minBudget}
                        onChange={(e) => setFormData({ ...formData, minBudget: sanitizeBudgetInput(e.target.value) })}
                        placeholder="20"
                        className="w-full px-4 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">LPA</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Max Budget</p>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        value={formData.maxBudget}
                        onChange={(e) => setFormData({ ...formData, maxBudget: sanitizeBudgetInput(e.target.value) })}
                        placeholder="22"
                        className="w-full px-4 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">LPA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Open" | "Closed" })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Upload JD File (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    id="jd-file"
                    onChange={(e) => setJdFile(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="jd-file"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-500 text-sm">{jdFile ? jdFile.name : "Choose PDF, Word, or TXT file..."}</span>
                  </label>
                </div>
                <p className="text-xs text-slate-500">Note: For PDF/DOCX, browser can’t read text. Prefer pasting JD text in the textarea.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">JD Description</label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Paste the full job description here..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setIsCompanyDdOpen(false);
                }}
                className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Create Job Description
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">JD Management</h1>
          <p className="text-slate-500 mt-1">Manage and track all your job descriptions in one place.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New JD
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-sm font-medium outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
  <tr>
    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Company Name</th>
    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Position</th>
    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Experience</th>
    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Work Mode</th>
    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employment Type</th>
    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">JD</th>
    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Open Till</th>
    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
  </tr>
</thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">Loading Job Descriptions...</p>
                  </td>
                </tr>
              ) : filteredJDs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No job descriptions found.</p>
                  </td>
                </tr>
              ) : (
                filteredJDs.map((jd) => (
                  <tr key={jd.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {jd.companyName?.[0] ?? ""}
                        </div>
                        <span className="text-sm font-bold text-slate-900">{jd.companyName}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">{jd.position}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{jd.yearsOfExperience}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{jd.workMode || "—"}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{jd.employmentType || "—"}</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {jdPreview(getStoredJD(jd.id)?.description || jd.description || "") || "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{jd.openTillDate}</td>

                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                          jd.status === "Open" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {jd.status === "Open" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {jd.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => openViewModal(jd)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View JD"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setOpenActionId((prev) => (prev === jd.id ? null : jd.id))}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg"
                        aria-label="More actions"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openActionId === jd.id && (
                        <div
                          ref={actionMenuRef}
                          className="absolute right-6 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50"
                        >
                          <button
                            type="button"
                            onClick={() => openEditModal(jd)}
                            className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 hover:bg-slate-50"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteJD(jd)}
                            disabled={deleteLoadingId === jd.id}
                            className={clsx(
                              "w-full px-4 py-3 text-left text-sm flex items-center gap-2",
                              deleteLoadingId === jd.id ? "bg-rose-50 text-rose-400 cursor-not-allowed" : "hover:bg-rose-50 text-rose-600"
                            )}
                          >
                            {deleteLoadingId === jd.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredJDs.length}</span> of{" "}
            <span className="font-bold text-slate-900">{jds.length}</span> JDs
          </p>

          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-blue-600/20">
              1
            </button>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {isViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">View JD</h3>
                <p className="text-sm text-slate-500">
                  {viewJD?.companyName} — {viewJD?.position}
                </p>
              </div>
              <button type="button" onClick={closeViewModal} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {viewLoading ? (
                <div className="py-16 text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">Loading JD...</p>
                </div>
              ) : viewError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">{viewError}</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-bold text-slate-500 uppercase">Company</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">{viewJD?.companyName || "—"}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-bold text-slate-500 uppercase">Position</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">{viewJD?.position || "—"}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-bold text-slate-500 uppercase">Experience</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">{viewJD?.yearsOfExperience || "—"}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-bold text-slate-500 uppercase">Open Till</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">{viewJD?.openTillDate || "—"}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-bold text-slate-500 uppercase">Work Mode</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">{viewJD?.workMode || "—"}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-bold text-slate-500 uppercase">Employment Type</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">{viewJD?.employmentType || "—"}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-bold text-slate-500 uppercase">Min Budget</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">{viewJD?.minBudget ? `${viewJD.minBudget} LPA` : "—"}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-bold text-slate-500 uppercase">Max Budget</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">{viewJD?.maxBudget ? `${viewJD.maxBudget} LPA` : "—"}</div>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 md:col-span-2">
                      <div className="text-xs font-bold text-slate-500 uppercase">Status</div>
                      <div className="mt-1">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                            viewJD?.status === "Open" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                          )}
                        >
                          {viewJD?.status === "Open" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {viewJD?.status || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                      JD Description
                    </div>
                    <div className="max-h-[55vh] overflow-auto p-4 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                      {viewText?.trim() ? viewText : "No JD text/PDF available for this record."}
                    </div>
                  </div>

                  {viewFileName && (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">Attached File</div>
                      <div className="text-sm text-slate-700">{viewFileName}</div>
                      {viewFileTooLarge && (
                        <div className="mt-2 text-xs text-amber-600">
                          File preview not stored because file size is too large for local preview.
                        </div>
                      )}
                    </div>
                  )}

                  {viewPdfUrl && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        PDF Preview
                      </div>
                      <iframe src={viewPdfUrl} title="JD PDF Preview" className="w-full h-[500px]" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit Job Description</h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setIsEditCompanyDdOpen(false);
                }}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2" ref={editCompanyBoxRef}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Company Name</label>

                <div className="relative">
                  <input
                    value={editForm.companyName}
                    onChange={(e) => {
                      setEditForm((p) => ({ ...p, companyName: e.target.value }));
                      setIsEditCompanyDdOpen(true);
                    }}
                    onFocus={() => setIsEditCompanyDdOpen(true)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />

                  {isEditCompanyDdOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Companies</p>
                        <p className="text-xs text-slate-400 font-medium">{companyOptions.length} total</p>
                      </div>

                      {companyOptions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">No companies yet.</div>
                      ) : filteredEditCompanyOptions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">No match. You can use “{editForm.companyName}”.</div>
                      ) : (
                        <div className="max-h-56 overflow-auto">
                          {filteredEditCompanyOptions.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => handlePickEditCompany(name)}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                {name[0]?.toUpperCase()}
                              </div>
                              <span className="text-sm font-semibold text-slate-800">{name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Position</label>
                <input
                  value={editForm.position}
                  onChange={(e) => setEditForm((p) => ({ ...p, position: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Experience</label>
                  <input
                    value={editForm.yearsOfExperience}
                    onChange={(e) => setEditForm((p) => ({ ...p, yearsOfExperience: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Open Till</label>
                  <input
                    type="date"
                    value={editForm.openTillDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, openTillDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Work Mode</label>
                  <select
                    value={editForm.workMode}
                    onChange={(e) => setEditForm((p) => ({ ...p, workMode: e.target.value as WorkMode }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Select work mode</option>
                    <option value="Work from office">Work from office</option>
                    <option value="Work from Home">Work from Home</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Employment Type</label>
                  <select
                    value={editForm.employmentType}
                    onChange={(e) => setEditForm((p) => ({ ...p, employmentType: e.target.value as EmploymentType }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Select employment type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Budget</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Min Budget</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={editForm.minBudget}
                        onChange={(e) => setEditForm((p) => ({ ...p, minBudget: sanitizeBudgetInput(e.target.value) }))}
                        placeholder="20"
                        className="w-full px-4 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">LPA</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Max Budget</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={editForm.maxBudget}
                        onChange={(e) => setEditForm((p) => ({ ...p, maxBudget: sanitizeBudgetInput(e.target.value) }))}
                        placeholder="22"
                        className="w-full px-4 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">LPA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">JD Description</label>
                <textarea
                  rows={6}
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Edit full job description..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setIsEditCompanyDdOpen(false);
                }}
                disabled={editSaving}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEdit}
                disabled={editSaving}
                className={clsx(
                  "px-6 py-2.5 text-white font-bold rounded-xl transition-all flex items-center gap-2",
                  editSaving ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {editSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}