import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Upload,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { JD } from '../types';
import { clsx } from 'clsx';

const BACKEND_URL = 'http://127.0.0.1:8000';
const CREATE_JD_ENDPOINT = `${BACKEND_URL}/create_jd`;

export default function JDManagement() {
  const [jds, setJds] = useState<JD[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Closed'>('All');

  // Form state
  const [formData, setFormData] = useState<Omit<JD, 'id'>>({
    companyName: '',
    position: '',
    yearsOfExperience: '',
    openTillDate: '',
    status: 'Open',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Company dropdown state (Create JD form) ----
  const [isCompanyDdOpen, setIsCompanyDdOpen] = useState(false);
  const companyBoxRef = useRef<HTMLDivElement | null>(null);

  // ✅ ADDED: JD file state (Optional upload in form)
  const [jdFile, setJdFile] = useState<File | null>(null);

  useEffect(() => {
    fetchJDs();
  }, []);

  // Close company dropdown on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!companyBoxRef.current) return;
      if (!companyBoxRef.current.contains(e.target as Node)) {
        setIsCompanyDdOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // ✅ integrate /get_all_jd and map backend fields -> frontend JD fields
  const fetchJDs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/get_all_jd`);
      if (!res.ok) throw new Error(`Failed to fetch JDs: ${res.status}`);

      const json = await res.json();
      const list = Array.isArray(json?.job_descriptions) ? json.job_descriptions : [];

      const mapped: JD[] = list.map((jd: any) => {
        const rawStatus = (jd?.status ?? '').toString().trim();
        const normalized = rawStatus.toLowerCase();

        const status: 'Open' | 'Closed' =
          normalized === 'activate' || normalized === 'active' || normalized === 'open'
            ? 'Open'
            : 'Closed';

        const openTillDate =
          typeof jd?.active_till_date === 'string' && jd.active_till_date
            ? jd.active_till_date.split(' ')[0]
            : '';

        return {
          id: String(jd?.id ?? ''),
          companyName: (jd?.company_name ?? '').toString(),
          position: (jd?.position ?? '').toString(),
          yearsOfExperience: (jd?.years_of_experience ?? '').toString(),
          openTillDate,
          status,
          description: '',
        };
      });

      setJds(mapped);
    } catch (error) {
      console.error('Failed to fetch JDs:', error);
      setJds([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Unique company list from existing JDs
  const companyOptions = useMemo(() => {
    const s = new Set<string>();
    for (const jd of jds) {
      const name = (jd.companyName || '').trim();
      if (name) s.add(name);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [jds]);

  const filteredCompanyOptions = useMemo(() => {
    const q = (formData.companyName || '').trim().toLowerCase();
    if (!q) return companyOptions.slice(0, 10);
    return companyOptions.filter((c) => c.toLowerCase().includes(q)).slice(0, 10);
  }, [companyOptions, formData.companyName]);

  const handlePickCompany = (name: string) => {
    setFormData((prev) => ({ ...prev, companyName: name }));
    setIsCompanyDdOpen(false);
  };

  const readBody = async (res: Response) => {
    const contentType = res.headers.get('content-type') || '';
    try {
      if (contentType.includes('application/json')) {
        return JSON.stringify(await res.json());
      }
      return await res.text();
    } catch {
      return '';
    }
  };

  // ✅ ADDED: read JD text from uploaded file (pdf/docx/txt) so we can send plain text to backend /create_jd
  const readJDTextFromFile = async (file: File): Promise<string> => {
    const ext = (file.name.split('.').pop() || '').toLowerCase();

    // TXT can be read in browser
    if (ext === 'txt') {
      return await file.text();
    }

    // For PDF/DOCX: browser can't extract text reliably.
    // We'll only send metadata + description typed by user.
    // If you want full extraction, create backend endpoint to parse JD file.
    return '';
  };

  // ✅ ADDED: actually stores JD from JD Management form to MySQL using /create_jd
  const createJdFromFrontend = async () => {
    const backendStatus = formData.status === 'Open' ? 'Activate' : 'Closed';

    const fd = new FormData();
    fd.append('company_name', (formData.companyName || '').trim());
    fd.append('position', (formData.position || '').trim());
    fd.append('years_of_experience', (formData.yearsOfExperience || '').trim());
    fd.append('status', backendStatus);

    // You already store active_till_date in DB, but your /create_jd (as suggested) can accept open_till_date.
    // We'll send both keys so backend can accept whichever you implemented.
    if ((formData.openTillDate || '').trim()) {
      fd.append('open_till_date', formData.openTillDate.trim()); // preferred (YYYY-MM-DD)
      fd.append('active_till_date', `${formData.openTillDate.trim()} 00:00:00`); // fallback
    }

    // JD text: prefer textarea; if empty and file uploaded, try read (txt only)
    let jdTextToSend = (formData.description || '').trim();
    if (!jdTextToSend && jdFile) {
      jdTextToSend = (await readJDTextFromFile(jdFile)).trim();
    }

    // Send both keys to be safe
    fd.append('jd_description', jdTextToSend);
    fd.append('description', jdTextToSend);

    const res = await fetch(CREATE_JD_ENDPOINT, {
      method: 'POST',
      body: fd,
    });

    if (!res.ok) {
      const err = await readBody(res);
      throw new Error(`Create JD failed: ${res.status}\n${err}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createJdFromFrontend();

      setShowForm(false);
      setIsCompanyDdOpen(false);

      setFormData({
        companyName: '',
        position: '',
        yearsOfExperience: '',
        openTillDate: '',
        status: 'Open',
        description: '',
      });

      // ✅ reset JD file
      setJdFile(null);

      // refresh list so new JDs show up immediately
      await fetchJDs();
    } catch (error: any) {
      console.error('Failed to create JD:', error);
      alert(error?.message || 'Failed to create JD (unknown error).');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJDs = jds.filter((jd) => {
    const matchesSearch =
      jd.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jd.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || jd.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              {/* ✅ Company Name with dropdown */}
              <div className="space-y-2" ref={companyBoxRef}>
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Company Name
                </label>

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
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          Companies
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          {companyOptions.length} total
                        </p>
                      </div>

                      {companyOptions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">
                          No companies yet. Type to add a new one.
                        </div>
                      ) : filteredCompanyOptions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">
                          No match. You can use “{formData.companyName}”.
                        </div>
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

                <p className="text-xs text-slate-500">
                  Tip: Select an existing company or type a new company name.
                </p>
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
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Open' | 'Closed' })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Upload JD File (Optional)
                </label>
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
                    <span className="text-slate-500 text-sm">
                      {jdFile ? jdFile.name : 'Choose PDF, Word, or TXT file...'}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-slate-500">
                  Note: For PDF/DOCX, browser can’t read text. Prefer pasting JD text in the textarea.
                </p>
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Open Till</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">Loading Job Descriptions...</p>
                  </td>
                </tr>
              ) : filteredJDs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
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
                          {jd.companyName?.[0] ?? ''}
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
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{jd.openTillDate}</td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                          jd.status === 'Open' ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {jd.status === 'Open' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {jd.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Users className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredJDs.length}</span> of{' '}
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
    </div>
  );
}