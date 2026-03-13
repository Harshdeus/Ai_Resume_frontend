import React, { useMemo, useState, useEffect } from "react";
import {
  Building2,
  Download,
  Eye,
  History,
  Printer,
  Share2,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { clsx } from "clsx";

const BACKEND_URL = "http://127.0.0.1:8000";

type Template = {
  id: string;
  name: string;
  usageCount: number;
  features: string[];
  mapping: any;
  version?: string;
  description?: string;
  lastUpdated?: string;
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
    const key = t.name.trim().toLowerCase();
    if (!map.has(key)) map.set(key, t);
  }
  return Array.from(map.values());
}

function getAuthHeaders() {
  const token = localStorage.getItem("token") || "";
  return {
    Authorization: `Bearer ${token}`,
  };
}

function handleUnauthorized() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState("preview");

  const [previewKey, setPreviewKey] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);

  const [previewBlobUrl, setPreviewBlobUrl] = useState<string>("");

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/company_templates`, {
          headers: getAuthHeaders(),
        });

        if (res.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!res.ok) return;

        const rows: Array<{ id: number; company_name: string }> = await res.json();

        const fromDb: Template[] = rows
          .map((r) => (r.company_name || "").trim())
          .filter(Boolean)
          .map((name) => {
            const id = slugifyId(name) || `company_${Math.random().toString(16).slice(2)}`;
            return {
              id,
              name,
              lastUpdated: new Date().toISOString().slice(0, 10),
              usageCount: 0,
              features: ["Custom template"],
              mapping: {
                header: { name: "Name" },
                sections: ["Summary", "Experience", "Education", "Skills"],
              },
            };
          });

        setTemplates((prev) => {
          const merged = mergeTemplatesUniqueByName(defaultTemplates, mergeTemplatesUniqueByName(prev, fromDb));
          return merged;
        });

        if (fromDb.length > 0) {
          setSelectedTemplate((prev) => prev ?? fromDb[0]);
        }
      } catch {
        // silent fail
      }
    };

    loadCompanies();
  }, []);

  const loadPreview = async () => {
    setPreviewLoading(true);
    setPreviewError(false);

    try {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl("");
      }

      const res = await fetch(`${BACKEND_URL}/view_resume?t=${previewKey}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error("Preview request failed");
      }

      const blob = await res.blob();

      if (blob.type && !blob.type.includes("pdf")) {
        const text = await blob.text().catch(() => "");
        console.error("Preview did not return PDF:", text);
        throw new Error("Preview is not a PDF");
      }

      const objectUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(objectUrl);
    } catch (error) {
      console.error("Preview load error:", error);
      setPreviewError(true);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "preview") {
      loadPreview();
    }

    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey, activeTab]);

  const handleDownload = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/download_resume`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error("Download failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "resume_template.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download template.");
    }
  };

  const refreshPreview = () => {
    setPreviewKey((k) => k + 1);
  };

  const previewUrl = useMemo(() => previewBlobUrl, [previewBlobUrl]);

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="h-full flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedTemplate?.name || "Template Preview"}
                  </h2>
                  {selectedTemplate?.version ? (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {selectedTemplate.version}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <History className="w-3 h-3" /> Updated {selectedTemplate?.lastUpdated || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200">
                <Share2 className="w-4 h-4" />
              </button> */}
              {/* <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200">
                <Printer className="w-4 h-4" />
              </button> */}

              <div className="w-px h-6 bg-slate-200 mx-2"></div>

              <button
                onClick={refreshPreview}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm"
                title="Refresh Preview"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          <div className="flex items-center gap-8 mt-8">
            {[{ id: "preview", label: "Live Preview", icon: Eye }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-2 pb-4 text-sm font-bold transition-all relative",
                  activeTab === tab.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-8 bg-slate-50/30">
            {activeTab === "preview" && (
              <div className="w-full">
                <div className="bg-white shadow-2xl border border-slate-200 rounded-xl overflow-hidden min-h-[800px] relative w-full">
                  {previewLoading && !previewError && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="flex items-center gap-2 text-slate-600 font-semibold">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading preview...
                      </div>
                    </div>
                  )}

                  {previewError && (
                    <div className="p-10 flex flex-col items-center justify-center text-center min-h-[800px]">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-amber-700" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Preview failed to load</h3>
                      <p className="text-sm text-slate-600 mt-2 max-w-md">
                        Your{" "}
                        <code className="px-1 py-0.5 bg-slate-100 rounded">/view_resume</code>{" "}
                        endpoint didn’t return a previewable PDF response.
                      </p>
                      <button
                        onClick={refreshPreview}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                      </button>
                    </div>
                  )}

                  {!previewError && previewUrl && (
                    <iframe
                      key={previewKey}
                      src={previewUrl}
                      title="Resume Live Preview"
                      className="w-full min-h-[800px] h-[calc(100vh-260px)]"
                      style={{ border: "none" }}
                    />
                  )}
                </div>

                <div className="mt-4 text-center text-[11px] text-slate-400 font-medium uppercase tracking-widest">
                  Live preview rendered from backend:{" "}
                  <span className="font-mono normal-case">{BACKEND_URL}/view_resume</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}