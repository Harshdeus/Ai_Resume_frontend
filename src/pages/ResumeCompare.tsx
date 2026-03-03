// // import React, { useState, useEffect } from 'react';
// // import { 
// //   FileSearch, 
// //   Upload, 
// //   FileText, 
// //   CheckCircle2, 
// //   AlertCircle,
// //   Loader2,
// //   TrendingUp,
// //   ChevronRight,
// //   X,
// //   Check
// // } from 'lucide-react';
// // import { JD } from '../types';
// // import { jdService, compareService } from '../services/api';
// // import { clsx } from 'clsx';

// // export default function ResumeCompare() {
// //   const [jds, setJds] = useState<JD[]>([]);
// //   const [jdSelectionMode, setJdSelectionMode] = useState<'select' | 'paste'>('select');
// //   const [selectedJdId, setSelectedJdId] = useState('');
// //   const [pastedJdText, setPastedJdText] = useState('');
// //   const [cvFile, setCvFile] = useState<File | null>(null);
// //   const [isComparing, setIsComparing] = useState(false);
// //   const [matchScore, setMatchScore] = useState<number | null>(null);
// //   const [showConfirmModal, setShowConfirmModal] = useState(false);
// //   const [isConverting, setIsConverting] = useState(false);

// //   useEffect(() => {
// //     fetchJDs();
// //   }, []);

// //   const fetchJDs = async () => {
// //     try {
// //       const data = await jdService.getAll();
// //       setJds(data);
// //     } catch (error) {
// //       console.error('Failed to fetch JDs:', error);
// //     }
// //   };

// //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (e.target.files && e.target.files[0]) {
// //       setCvFile(e.target.files[0]);
// //     }
// //   };

// //   const handleCompare = async () => {
// //     if (!cvFile) return;
// //     if (jdSelectionMode === 'select' && !selectedJdId) return;
// //     if (jdSelectionMode === 'paste' && !pastedJdText) return;

// //     setIsComparing(true);
// //     try {
// //       const result = await compareService.compare(
// //         cvFile, 
// //         jdSelectionMode === 'select' ? selectedJdId : undefined,
// //         jdSelectionMode === 'paste' ? pastedJdText : undefined
// //       );
// //       setMatchScore(result.matchScore);
      
// //       if (result.matchScore <= 50) {
// //         setShowConfirmModal(true);
// //       }
// //     } catch (error) {
// //       console.error('Comparison failed:', error);
// //     } finally {
// //       setIsComparing(false);
// //     }
// //   };

// //   const handleConfirmConvert = async () => {
// //     if (!cvFile) return;
// //     setIsConverting(true);
// //     try {
// //       await compareService.convertToTemplate(cvFile);
// //       setShowConfirmModal(false);
// //       alert('Resume successfully converted to template!');
// //     } catch (error) {
// //       console.error('Conversion failed:', error);
// //     } finally {
// //       setIsConverting(false);
// //     }
// //   };

// //   const selectedJd = jds.find(j => j.id === selectedJdId);

// //   return (
// //     <div className="space-y-8 pb-20">
// //       <div>
// //         <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resume Compare</h1>
// //         <p className="text-slate-500 mt-1">Compare candidate resumes against job descriptions to find the best match.</p>
// //       </div>

// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
// //         {/* Step 1: JD Selection */}
// //         <div className="space-y-6">
// //           <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full">
// //             <div className="flex items-center gap-3 mb-6">
// //               <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
// //                 1
// //               </div>
// //               <h2 className="text-xl font-bold text-slate-900">Job Description Selection</h2>
// //             </div>

// //             <div className="space-y-6">
// //               <div className="flex gap-6">
// //                 <label className="flex items-center gap-3 cursor-pointer group">
// //                   <div className="relative flex items-center justify-center">
// //                     <input 
// //                       type="radio" 
// //                       name="jd-mode" 
// //                       className="peer hidden" 
// //                       checked={jdSelectionMode === 'select'}
// //                       onChange={() => setJdSelectionMode('select')}
// //                     />
// //                     <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
// //                     <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
// //                   </div>
// //                   <span className="text-sm font-bold text-slate-700">Select JD from List</span>
// //                 </label>
// //                 <label className="flex items-center gap-3 cursor-pointer group">
// //                   <div className="relative flex items-center justify-center">
// //                     <input 
// //                       type="radio" 
// //                       name="jd-mode" 
// //                       className="peer hidden"
// //                       checked={jdSelectionMode === 'paste'}
// //                       onChange={() => setJdSelectionMode('paste')}
// //                     />
// //                     <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
// //                     <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
// //                   </div>
// //                   <span className="text-sm font-bold text-slate-700">Paste JD Manually</span>
// //                 </label>
// //               </div>

// //               {jdSelectionMode === 'select' ? (
// //                 <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
// //                   <div className="space-y-2">
// //                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stored Job Descriptions</label>
// //                     <select 
// //                       value={selectedJdId}
// //                       onChange={e => setSelectedJdId(e.target.value)}
// //                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none font-medium text-slate-700"
// //                     >
// //                       <option value="">-- Choose a JD --</option>
// //                       {jds.map(jd => (
// //                         <option key={jd.id} value={jd.id}>{jd.companyName} - {jd.position}</option>
// //                       ))}
// //                     </select>
// //                   </div>

// //                   {selectedJd && (
// //                     <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
// //                       <div className="flex justify-between items-start">
// //                         <div>
// //                           <h4 className="font-bold text-blue-900">{selectedJd.position}</h4>
// //                           <p className="text-sm text-blue-700 font-medium">{selectedJd.companyName}</p>
// //                         </div>
// //                         <span className="px-2 py-1 bg-white text-blue-600 text-[10px] font-black uppercase rounded border border-blue-200">
// //                           {selectedJd.yearsOfExperience}
// //                         </span>
// //                       </div>
// //                       <p className="text-xs text-blue-600/80 line-clamp-3 leading-relaxed">
// //                         {selectedJd.description}
// //                       </p>
// //                     </div>
// //                   )}
// //                 </div>
// //               ) : (
// //                 <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
// //                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Paste JD Description</label>
// //                   <textarea 
// //                     rows={8}
// //                     value={pastedJdText}
// //                     onChange={e => setPastedJdText(e.target.value)}
// //                     placeholder="Paste the job requirements here..."
// //                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium text-slate-700 text-sm"
// //                   />
// //                 </div>
// //               )}
// //             </div>
// //           </section>
// //         </div>

// //         {/* Step 2: Upload CV */}
// //         <div className="space-y-6">
// //           <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
// //             <div className="flex items-center gap-3 mb-6">
// //               <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
// //                 2
// //               </div>
// //               <h2 className="text-xl font-bold text-slate-900">Upload Resume (CV)</h2>
// //             </div>

// //             <div className="flex-1 flex flex-col justify-center space-y-6">
// //               <div className="relative group">
// //                 <input 
// //                   type="file" 
// //                   id="cv-upload" 
// //                   className="hidden" 
// //                   accept=".pdf,.docx"
// //                   onChange={handleFileChange}
// //                 />
// //                 <label 
// //                   htmlFor="cv-upload"
// //                   className={clsx(
// //                     "w-full py-16 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300",
// //                     cvFile 
// //                       ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" 
// //                       : "bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
// //                   )}
// //                 >
// //                   <div className={clsx(
// //                     "p-4 rounded-full transition-colors duration-300",
// //                     cvFile ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
// //                   )}>
// //                     {cvFile ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
// //                   </div>
// //                   <div className="text-center">
// //                     <p className={clsx(
// //                       "text-lg font-bold",
// //                       cvFile ? "text-emerald-900" : "text-slate-700 group-hover:text-blue-900"
// //                     )}>
// //                       {cvFile ? cvFile.name : 'Click to upload CV'}
// //                     </p>
// //                     <p className="text-sm text-slate-400 mt-1">Supports PDF or DOCX format</p>
// //                   </div>
// //                 </label>
// //               </div>

// //               <button 
// //                 onClick={handleCompare}
// //                 disabled={isComparing || !cvFile || (jdSelectionMode === 'select' && !selectedJdId) || (jdSelectionMode === 'paste' && !pastedJdText)}
// //                 className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest"
// //               >
// //                 {isComparing ? (
// //                   <>
// //                     <Loader2 className="w-6 h-6 animate-spin" />
// //                     Analyzing Match...
// //                   </>
// //                 ) : (
// //                   <>
// //                     <FileSearch className="w-6 h-6" />
// //                     Compare Resume
// //                   </>
// //                 )}
// //               </button>
// //             </div>
// //           </section>
// //         </div>
// //       </div>

// //       {/* Results Section */}
// //       {matchScore !== null && (
// //         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
// //           <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
// //             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
// //             <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
// //               <div className="relative">
// //                 <div className="w-40 h-40 rounded-full border-8 border-slate-100 flex items-center justify-center">
// //                   <div className="text-center">
// //                     <span className="text-4xl font-black text-blue-600">{matchScore}%</span>
// //                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Match Score</p>
// //                   </div>
// //                 </div>
// //                 <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center">
// //                   <TrendingUp className="w-6 h-6 text-emerald-500" />
// //                 </div>
// //               </div>
              
// //               <div className="flex-1 space-y-4">
// //                 <div className="flex items-center gap-2">
// //                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />
// //                   <h3 className="text-2xl font-bold text-slate-900">Analysis Complete</h3>
// //                 </div>
// //                 <p className="text-slate-600 leading-relaxed max-w-2xl">
// //                   The candidate's resume has been analyzed against the job description. The match score is based on skills, experience, and technical requirements found in both documents.
// //                 </p>
// //                 <div className="flex flex-wrap gap-3">
// //                   <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
// //                     <Check className="w-4 h-4 text-emerald-500" />
// //                     <span className="text-xs font-bold text-slate-700">Skills Matched</span>
// //                   </div>
// //                   <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
// //                     <Check className="w-4 h-4 text-emerald-500" />
// //                     <span className="text-xs font-bold text-slate-700">Experience Verified</span>
// //                   </div>
// //                   <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
// //                     <Check className="w-4 h-4 text-emerald-500" />
// //                     <span className="text-xs font-bold text-slate-700">Education Check</span>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="flex flex-col gap-3 min-w-[200px]">
// //                 <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
// //                   <FileText className="w-4 h-4" />
// //                   View Report
// //                 </button>
// //                 <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
// //                   Save Candidate
// //                   <ChevronRight className="w-4 h-4" />
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Confirmation Modal */}
// //       {showConfirmModal && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
// //           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
// //             <div className="p-8 text-center space-y-6">
// //               <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
// //                 <AlertCircle className="w-10 h-10 text-amber-500" />
// //               </div>
// //               <div className="space-y-2">
// //                 <h3 className="text-2xl font-bold text-slate-900">Low Match Score</h3>
// //                 <p className="text-slate-500">
// //                   The resume matches less than <span className="font-bold text-slate-900">50%</span> of the job description. Do you want to continue with template conversion?
// //                 </p>
// //               </div>
// //               <div className="flex flex-col gap-3">
// //                 <button 
// //                   onClick={handleConfirmConvert}
// //                   disabled={isConverting}
// //                   className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
// //                 >
// //                   {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
// //                   Yes, Proceed to Conversion
// //                 </button>
// //                 <button 
// //                   onClick={() => setShowConfirmModal(false)}
// //                   className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
// //                 >
// //                   <X className="w-5 h-5" />
// //                   No, Cancel
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// import React, { useState, useEffect } from 'react';
// import {
//   FileSearch,
//   Upload,
//   FileText,
//   CheckCircle2,
//   AlertCircle,
//   Loader2,
//   TrendingUp,
//   ChevronRight,
//   X,
//   Check,
//   Link as LinkIcon,
// } from 'lucide-react';
// import { JD } from '../types';
// import { jdService, compareService } from '../services/api';
// import { clsx } from 'clsx';

// type JdMode = 'select' | 'paste' | 'upload' | 'url';

// export default function ResumeCompare() {
//   const [jds, setJds] = useState<JD[]>([]);
//   const [jdSelectionMode, setJdSelectionMode] = useState<JdMode>('select');

//   // Select mode
//   const [selectedJdId, setSelectedJdId] = useState('');

//   // Paste mode
//   const [pastedJdText, setPastedJdText] = useState('');

//   // Upload mode
//   const [jdFile, setJdFile] = useState<File | null>(null);

//   // URL mode
//   const [jdUrl, setJdUrl] = useState('');
//   const [isFetchingUrl, setIsFetchingUrl] = useState(false);
//   const [urlFetchedTextPreview, setUrlFetchedTextPreview] = useState('');

//   // CV
//   const [cvFile, setCvFile] = useState<File | null>(null);

//   // Result
//   const [isComparing, setIsComparing] = useState(false);
//   const [matchScore, setMatchScore] = useState<number | null>(null);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [isConverting, setIsConverting] = useState(false);

//   useEffect(() => {
//     fetchJDs();
//   }, []);

//   // Clear mode-specific inputs when mode changes (keeps UX clean)
//   useEffect(() => {
//     setMatchScore(null);
//     setShowConfirmModal(false);

//     if (jdSelectionMode !== 'select') setSelectedJdId('');
//     if (jdSelectionMode !== 'paste') setPastedJdText('');
//     if (jdSelectionMode !== 'upload') setJdFile(null);
//     if (jdSelectionMode !== 'url') {
//       setJdUrl('');
//       setUrlFetchedTextPreview('');
//       setIsFetchingUrl(false);
//     }
//   }, [jdSelectionMode]);

//   const fetchJDs = async () => {
//     try {
//       const data = await jdService.getAll();
//       setJds(data);
//     } catch (error) {
//       console.error('Failed to fetch JDs:', error);
//     }
//   };

//   const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setCvFile(e.target.files[0]);
//     }
//   };

//   const handleJdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setJdFile(e.target.files[0]);
//     }
//   };

//   const htmlToText = (html: string) => {
//     // quick & safe-ish HTML -> text conversion for JD URLs
//     const doc = new DOMParser().parseFromString(html, 'text/html');
//     const text = doc.body?.textContent || '';
//     return text.replace(/\n{3,}/g, '\n\n').trim();
//   };

//   const fetchJdFromUrl = async () => {
//     const url = jdUrl.trim();
//     if (!url) return;

//     setIsFetchingUrl(true);
//     setUrlFetchedTextPreview('');
//     try {
//       const res = await fetch(url);
//       const raw = await res.text();
//       const cleaned = htmlToText(raw);

//       // Keep a short preview for UI
//       setUrlFetchedTextPreview(cleaned.slice(0, 1200));
//     } catch (err) {
//       console.error('Failed to fetch JD URL:', err);
//       alert('Failed to fetch JD from URL. Please check the link and try again.');
//     } finally {
//       setIsFetchingUrl(false);
//     }
//   };

//   const handleCompare = async () => {
//     if (!cvFile) return;

//     // Validation per mode
//     if (jdSelectionMode === 'select' && !selectedJdId) return;
//     if (jdSelectionMode === 'paste' && !pastedJdText.trim()) return;
//     if (jdSelectionMode === 'upload' && !jdFile) return;
//     if (jdSelectionMode === 'url' && !jdUrl.trim()) return;

//     setIsComparing(true);
//     try {
//       // Preferred (if your backend already supports these):
//       // - compareService.compareWithJdFile(cvFile, jdFile)
//       // - compareService.compareWithJdUrl(cvFile, jdUrl)
//       //
//       // Fallback behavior:
//       // - URL mode: fetch and send as pasted text
//       // - Upload mode: if a compareWithJdFile exists use it; else try reading as text if it's .txt

//       let result: any = null;

//       if (jdSelectionMode === 'select') {
//         result = await compareService.compare(cvFile, selectedJdId, undefined);
//       } else if (jdSelectionMode === 'paste') {
//         result = await compareService.compare(cvFile, undefined, pastedJdText);
//       } else if (jdSelectionMode === 'upload') {
//         const svc: any = compareService as any;

//         if (typeof svc.compareWithJdFile === 'function') {
//           result = await svc.compareWithJdFile(cvFile, jdFile);
//         } else {
//           // Best-effort fallback: only works for text-based files
//           if (jdFile && (jdFile.type === 'text/plain' || jdFile.name.toLowerCase().endsWith('.txt'))) {
//             const text = await jdFile.text();
//             result = await compareService.compare(cvFile, undefined, text);
//           } else {
//             alert(
//               'Your API service does not expose compareWithJdFile(). Add that method in compareService to send the JD file to backend.\n\nFallback only supports .txt JD files.'
//             );
//             setIsComparing(false);
//             return;
//           }
//         }
//       } else if (jdSelectionMode === 'url') {
//         const svc: any = compareService as any;

//         if (typeof svc.compareWithJdUrl === 'function') {
//           result = await svc.compareWithJdUrl(cvFile, jdUrl.trim());
//         } else {
//           // Fallback: fetch URL -> text -> compare as pasted JD
//           setIsFetchingUrl(true);
//           try {
//             const res = await fetch(jdUrl.trim());
//             const raw = await res.text();
//             const cleaned = htmlToText(raw);
//             result = await compareService.compare(cvFile, undefined, cleaned);
//           } finally {
//             setIsFetchingUrl(false);
//           }
//         }
//       }

//       setMatchScore(result.matchScore);

//       if (result.matchScore <= 50) {
//         setShowConfirmModal(true);
//       }
//     } catch (error) {
//       console.error('Comparison failed:', error);
//     } finally {
//       setIsComparing(false);
//     }
//   };

//   const handleConfirmConvert = async () => {
//     if (!cvFile) return;
//     setIsConverting(true);
//     try {
//       await compareService.convertToTemplate(cvFile);
//       setShowConfirmModal(false);
//       alert('Resume successfully converted to template!');
//     } catch (error) {
//       console.error('Conversion failed:', error);
//     } finally {
//       setIsConverting(false);
//     }
//   };

//   const selectedJd = jds.find((j) => j.id === selectedJdId);

//   const isCompareDisabled =
//     isComparing ||
//     isFetchingUrl ||
//     !cvFile ||
//     (jdSelectionMode === 'select' && !selectedJdId) ||
//     (jdSelectionMode === 'paste' && !pastedJdText.trim()) ||
//     (jdSelectionMode === 'upload' && !jdFile) ||
//     (jdSelectionMode === 'url' && !jdUrl.trim());

//   return (
//     <div className="space-y-8 pb-20">
//       <div>
//         <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resume Compare</h1>
//         <p className="text-slate-500 mt-1">
//           Compare candidate resumes against job descriptions to find the best match.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Step 1: JD Selection */}
//         <div className="space-y-6">
//           <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
//                 1
//               </div>
//               <h2 className="text-xl font-bold text-slate-900">Job Description Selection</h2>
//             </div>

//             <div className="space-y-6">
//               {/* 4 buttons (radio) */}
//               <div className="flex flex-wrap gap-x-6 gap-y-4">
//                 {/* Select */}
//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <div className="relative flex items-center justify-center">
//                     <input
//                       type="radio"
//                       name="jd-mode"
//                       className="peer hidden"
//                       checked={jdSelectionMode === 'select'}
//                       onChange={() => setJdSelectionMode('select')}
//                     />
//                     <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
//                     <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
//                   </div>
//                   <span className="text-sm font-bold text-slate-700">Select JD from List</span>
//                 </label>

//                 {/* Paste */}
//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <div className="relative flex items-center justify-center">
//                     <input
//                       type="radio"
//                       name="jd-mode"
//                       className="peer hidden"
//                       checked={jdSelectionMode === 'paste'}
//                       onChange={() => setJdSelectionMode('paste')}
//                     />
//                     <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
//                     <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
//                   </div>
//                   <span className="text-sm font-bold text-slate-700">Paste JD Manually</span>
//                 </label>

//                 {/* Upload JD */}
//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <div className="relative flex items-center justify-center">
//                     <input
//                       type="radio"
//                       name="jd-mode"
//                       className="peer hidden"
//                       checked={jdSelectionMode === 'upload'}
//                       onChange={() => setJdSelectionMode('upload')}
//                     />
//                     <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
//                     <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
//                   </div>
//                   <span className="text-sm font-bold text-slate-700">Upload JD</span>
//                 </label>

//                 {/* Upload JD URL */}
//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <div className="relative flex items-center justify-center">
//                     <input
//                       type="radio"
//                       name="jd-mode"
//                       className="peer hidden"
//                       checked={jdSelectionMode === 'url'}
//                       onChange={() => setJdSelectionMode('url')}
//                     />
//                     <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
//                     <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
//                   </div>
//                   <span className="text-sm font-bold text-slate-700">Upload JD URL</span>
//                 </label>
//               </div>

//               {/* Mode panels */}
//               {jdSelectionMode === 'select' && (
//                 <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
//                   <div className="space-y-2">
//                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//                       Stored Job Descriptions
//                     </label>
//                     <select
//                       value={selectedJdId}
//                       onChange={(e) => setSelectedJdId(e.target.value)}
//                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none font-medium text-slate-700"
//                     >
//                       <option value="">-- Choose a JD --</option>
//                       {jds.map((jd) => (
//                         <option key={jd.id} value={jd.id}>
//                           {jd.companyName} - {jd.position}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {selectedJd && (
//                     <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h4 className="font-bold text-blue-900">{selectedJd.position}</h4>
//                           <p className="text-sm text-blue-700 font-medium">{selectedJd.companyName}</p>
//                         </div>
//                         <span className="px-2 py-1 bg-white text-blue-600 text-[10px] font-black uppercase rounded border border-blue-200">
//                           {selectedJd.yearsOfExperience}
//                         </span>
//                       </div>
//                       <p className="text-xs text-blue-600/80 line-clamp-3 leading-relaxed">
//                         {selectedJd.description}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {jdSelectionMode === 'paste' && (
//                 <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
//                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//                     Paste JD Description
//                   </label>
//                   <textarea
//                     rows={8}
//                     value={pastedJdText}
//                     onChange={(e) => setPastedJdText(e.target.value)}
//                     placeholder="Paste the job requirements here..."
//                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium text-slate-700 text-sm"
//                   />
//                 </div>
//               )}

//               {jdSelectionMode === 'upload' && (
//                 <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
//                   <div className="space-y-2">
//                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//                       Upload JD File
//                     </label>

//                     <div className="relative group">
//                       <input
//                         type="file"
//                         id="jd-upload"
//                         className="hidden"
//                         accept=".pdf,.docx,.txt"
//                         onChange={handleJdFileChange}
//                       />
//                       <label
//                         htmlFor="jd-upload"
//                         className={clsx(
//                           "w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300",
//                           jdFile
//                             ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
//                             : "bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
//                         )}
//                       >
//                         <div
//                           className={clsx(
//                             "p-3 rounded-full transition-colors duration-300",
//                             jdFile
//                               ? "bg-emerald-100 text-emerald-600"
//                               : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
//                           )}
//                         >
//                           {jdFile ? <CheckCircle2 className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
//                         </div>
//                         <div className="text-center">
//                           <p
//                             className={clsx(
//                               "text-base font-bold",
//                               jdFile ? "text-emerald-900" : "text-slate-700 group-hover:text-blue-900"
//                             )}
//                           >
//                             {jdFile ? jdFile.name : 'Click to upload JD'}
//                           </p>
//                           <p className="text-sm text-slate-400 mt-1">Supports PDF, DOCX, or TXT</p>
//                         </div>
//                       </label>
//                     </div>

//                     <p className="text-xs text-slate-500">
//                       Note: If your backend supports JD file compare, expose <span className="font-bold">compareWithJdFile</span>{' '}
//                       in <span className="font-bold">compareService</span>. Otherwise, fallback only works for TXT.
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {jdSelectionMode === 'url' && (
//                 <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
//                   <div className="space-y-2">
//                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//                       Job Description URL
//                     </label>
//                     <div className="flex gap-3">
//                       <div className="relative flex-1">
//                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
//                           <LinkIcon className="w-4 h-4" />
//                         </div>
//                         <input
//                           value={jdUrl}
//                           onChange={(e) => setJdUrl(e.target.value)}
//                           placeholder="https://company.com/jobs/role"
//                           className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
//                         />
//                       </div>

//                       <button
//                         type="button"
//                         onClick={fetchJdFromUrl}
//                         disabled={isFetchingUrl || !jdUrl.trim()}
//                         className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2"
//                       >
//                         {isFetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
//                         Fetch
//                       </button>
//                     </div>

//                     {urlFetchedTextPreview && (
//                       <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
//                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
//                           Preview (fetched)
//                         </p>
//                         <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-6">
//                           {urlFetchedTextPreview}
//                         </p>
//                       </div>
//                     )}

//                     <p className="text-xs text-slate-500">
//                       Note: If your backend supports JD URL compare, expose <span className="font-bold">compareWithJdUrl</span>{' '}
//                       in <span className="font-bold">compareService</span>. Otherwise, we fetch the page and send extracted text.
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </section>
//         </div>

//         {/* Step 2: Upload CV */}
//         <div className="space-y-6">
//           <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
//                 2
//               </div>
//               <h2 className="text-xl font-bold text-slate-900">Upload Resume (CV)</h2>
//             </div>

//             <div className="flex-1 flex flex-col justify-center space-y-6">
//               <div className="relative group">
//                 <input
//                   type="file"
//                   id="cv-upload"
//                   className="hidden"
//                   accept=".pdf,.docx"
//                   onChange={handleCvFileChange}
//                 />
//                 <label
//                   htmlFor="cv-upload"
//                   className={clsx(
//                     "w-full py-16 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300",
//                     cvFile
//                       ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
//                       : "bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
//                   )}
//                 >
//                   <div
//                     className={clsx(
//                       "p-4 rounded-full transition-colors duration-300",
//                       cvFile
//                         ? "bg-emerald-100 text-emerald-600"
//                         : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
//                     )}
//                   >
//                     {cvFile ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
//                   </div>
//                   <div className="text-center">
//                     <p
//                       className={clsx(
//                         "text-lg font-bold",
//                         cvFile ? "text-emerald-900" : "text-slate-700 group-hover:text-blue-900"
//                       )}
//                     >
//                       {cvFile ? cvFile.name : 'Click to upload CV'}
//                     </p>
//                     <p className="text-sm text-slate-400 mt-1">Supports PDF or DOCX format</p>
//                   </div>
//                 </label>
//               </div>

//               <button
//                 onClick={handleCompare}
//                 disabled={isCompareDisabled}
//                 className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest"
//               >
//                 {isComparing ? (
//                   <>
//                     <Loader2 className="w-6 h-6 animate-spin" />
//                     Analyzing Match...
//                   </>
//                 ) : (
//                   <>
//                     <FileSearch className="w-6 h-6" />
//                     Compare Resume
//                   </>
//                 )}
//               </button>
//             </div>
//           </section>
//         </div>
//       </div>

//       {/* Results Section */}
//       {matchScore !== null && (
//         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//           <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
//             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
//             <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
//               <div className="relative">
//                 <div className="w-40 h-40 rounded-full border-8 border-slate-100 flex items-center justify-center">
//                   <div className="text-center">
//                     <span className="text-4xl font-black text-blue-600">{matchScore}%</span>
//                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
//                       Match Score
//                     </p>
//                   </div>
//                 </div>
//                 <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center">
//                   <TrendingUp className="w-6 h-6 text-emerald-500" />
//                 </div>
//               </div>

//               <div className="flex-1 space-y-4">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />
//                   <h3 className="text-2xl font-bold text-slate-900">Analysis Complete</h3>
//                 </div>
//                 <p className="text-slate-600 leading-relaxed max-w-2xl">
//                   The candidate&apos;s resume has been analyzed against the job description. The match score is based on
//                   skills, experience, and technical requirements found in both documents.
//                 </p>
//                 <div className="flex flex-wrap gap-3">
//                   <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
//                     <Check className="w-4 h-4 text-emerald-500" />
//                     <span className="text-xs font-bold text-slate-700">Skills Matched</span>
//                   </div>
//                   <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
//                     <Check className="w-4 h-4 text-emerald-500" />
//                     <span className="text-xs font-bold text-slate-700">Experience Verified</span>
//                   </div>
//                   <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
//                     <Check className="w-4 h-4 text-emerald-500" />
//                     <span className="text-xs font-bold text-slate-700">Education Check</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col gap-3 min-w-[200px]">
//                 <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
//                   <FileText className="w-4 h-4" />
//                   View Report
//                 </button>
//                 <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
//                   Save Candidate
//                   <ChevronRight className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Confirmation Modal */}
//       {showConfirmModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
//             <div className="p-8 text-center space-y-6">
//               <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
//                 <AlertCircle className="w-10 h-10 text-amber-500" />
//               </div>
//               <div className="space-y-2">
//                 <h3 className="text-2xl font-bold text-slate-900">Low Match Score</h3>
//                 <p className="text-slate-500">
//                   The resume matches less than <span className="font-bold text-slate-900">50%</span> of the job
//                   description. Do you want to continue with template conversion?
//                 </p>
//               </div>
//               <div className="flex flex-col gap-3">
//                 <button
//                   onClick={handleConfirmConvert}
//                   disabled={isConverting}
//                   className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
//                 >
//                   {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
//                   Yes, Proceed to Conversion
//                 </button>
//                 <button
//                   onClick={() => setShowConfirmModal(false)}
//                   className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
//                 >
                  
//                   <X className="w-5 h-5" />
//                   No, Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import {
//   FileSearch,
//   Upload,
//   FileText,
//   CheckCircle2,
//   AlertCircle,
//   Loader2,
//   TrendingUp,
//   ChevronRight,
//   X,
//   Check,
//   Link as LinkIcon,
//   Search as SearchIcon,
// } from 'lucide-react';
// import { JD } from '../types';
// import { jdService, compareService } from '../services/api';
// import { clsx } from 'clsx';

// type JdMode = 'select' | 'paste' | 'upload' | 'url';

// function useDebouncedValue<T>(value: T, delayMs: number) {
//   const [debounced, setDebounced] = useState<T>(value);

//   useEffect(() => {
//     const t = window.setTimeout(() => setDebounced(value), delayMs);
//     return () => window.clearTimeout(t);
//   }, [value, delayMs]);

//   return debounced;
// }

// export default function ResumeCompare() {
//   const [jds, setJds] = useState<JD[]>([]);
//   const [jdSelectionMode, setJdSelectionMode] = useState<JdMode>('select');

//   // SELECT mode
//   const [selectedJdId, setSelectedJdId] = useState('');
//   const [companyQuery, setCompanyQuery] = useState('');
//   const [positionQuery, setPositionQuery] = useState('');
//   const [expQuery, setExpQuery] = useState('');
//   const [openTillQuery, setOpenTillQuery] = useState(''); // yyyy-mm-dd
//   const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

//   // PASTE mode
//   const [pastedJdText, setPastedJdText] = useState('');

//   // UPLOAD mode
//   const [jdFile, setJdFile] = useState<File | null>(null);

//   // URL mode
//   const [jdUrl, setJdUrl] = useState('');
//   const [isFetchingUrl, setIsFetchingUrl] = useState(false);
//   const [urlFetchedTextPreview, setUrlFetchedTextPreview] = useState('');

//   // CV
//   const [cvFile, setCvFile] = useState<File | null>(null);

//   // Result
//   const [isComparing, setIsComparing] = useState(false);
//   const [matchScore, setMatchScore] = useState<number | null>(null);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [isConverting, setIsConverting] = useState(false);

//   const selectBoxRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     fetchJDs();
//   }, []);

//   // Close suggestions on outside click
//   useEffect(() => {
//     const onDown = (e: MouseEvent) => {
//       if (!selectBoxRef.current) return;
//       if (!selectBoxRef.current.contains(e.target as Node)) {
//         setIsSuggestionsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', onDown);
//     return () => document.removeEventListener('mousedown', onDown);
//   }, []);

//   // Clear mode-specific inputs when mode changes
//   useEffect(() => {
//     setMatchScore(null);
//     setShowConfirmModal(false);

//     if (jdSelectionMode !== 'select') {
//       setSelectedJdId('');
//       setCompanyQuery('');
//       setPositionQuery('');
//       setExpQuery('');
//       setOpenTillQuery('');
//       setIsSuggestionsOpen(false);
//     }

//     if (jdSelectionMode !== 'paste') setPastedJdText('');
//     if (jdSelectionMode !== 'upload') setJdFile(null);
//     if (jdSelectionMode !== 'url') {
//       setJdUrl('');
//       setUrlFetchedTextPreview('');
//       setIsFetchingUrl(false);
//     }
//   }, [jdSelectionMode]);

//   const fetchJDs = async () => {
//     try {
//       const data = await jdService.getAll();
//       setJds(data);
//     } catch (error) {
//       console.error('Failed to fetch JDs:', error);
//     }
//   };

//   const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) setCvFile(e.target.files[0]);
//   };

//   const handleJdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) setJdFile(e.target.files[0]);
//   };

//   const htmlToText = (html: string) => {
//     const doc = new DOMParser().parseFromString(html, 'text/html');
//     const text = doc.body?.textContent || '';
//     return text.replace(/\n{3,}/g, '\n\n').trim();
//   };

//   const fetchJdFromUrl = async () => {
//     const url = jdUrl.trim();
//     if (!url) return;

//     setIsFetchingUrl(true);
//     setUrlFetchedTextPreview('');
//     try {
//       const res = await fetch(url);
//       const raw = await res.text();
//       const cleaned = htmlToText(raw);
//       setUrlFetchedTextPreview(cleaned.slice(0, 1200));
//     } catch (err) {
//       console.error('Failed to fetch JD URL:', err);
//       alert('Failed to fetch JD from URL. Please check the link and try again.');
//     } finally {
//       setIsFetchingUrl(false);
//     }
//   };

//   // Debounce typing so filtering feels smooth with large lists
//   const dCompany = useDebouncedValue(companyQuery, 150);
//   const dPosition = useDebouncedValue(positionQuery, 150);
//   const dExp = useDebouncedValue(expQuery, 150);
//   const dDate = useDebouncedValue(openTillQuery, 150);

//   const selectedJd = useMemo(() => jds.find((j) => j.id === selectedJdId), [jds, selectedJdId]);

//   const shouldShowSuggestions = useMemo(() => {
//     const c = dCompany.trim().length >= 2;
//     const p = dPosition.trim().length >= 2;
//     const e = dExp.trim().length >= 1; // experience can be short like "5"
//     const d = dDate.trim().length >= 1; // date is structured
//     return c || p || e || d;
//   }, [dCompany, dPosition, dExp, dDate]);

//   const filteredSuggestions = useMemo(() => {
//     const cq = dCompany.trim().toLowerCase();
//     const pq = dPosition.trim().toLowerCase();
//     const eq = dExp.trim().toLowerCase();
//     const dq = dDate.trim(); // yyyy-mm-dd

//     let list = jds;

//     if (cq.length >= 2) {
//       list = list.filter((jd) => (jd.companyName || '').toLowerCase().includes(cq));
//     }
//     if (pq.length >= 2) {
//       list = list.filter((jd) => (jd.position || '').toLowerCase().includes(pq));
//     }
//     if (eq.length >= 1) {
//       list = list.filter((jd) => (jd.yearsOfExperience || '').toLowerCase().includes(eq));
//     }
//     if (dq.length >= 1) {
//       list = list.filter((jd) => (jd.openTillDate || '').startsWith(dq) || (jd.openTillDate || '') === dq);
//     }

//     // Keep results compact
//     return list.slice(0, 8);
//   }, [jds, dCompany, dPosition, dExp, dDate]);

//   const handlePickJd = (jd: JD) => {
//     setSelectedJdId(jd.id);
//     setIsSuggestionsOpen(false);

//     // Optional: auto-fill inputs to reflect selection (helps confidence)
//     setCompanyQuery(jd.companyName || '');
//     setPositionQuery(jd.position || '');
//     setExpQuery(jd.yearsOfExperience || '');
//     setOpenTillQuery(jd.openTillDate || '');
//   };

//   const handleClearSelected = () => {
//     setSelectedJdId('');
//     setCompanyQuery('');
//     setPositionQuery('');
//     setExpQuery('');
//     setOpenTillQuery('');
//     setIsSuggestionsOpen(false);
//   };

//   const handleCompare = async () => {
//     if (!cvFile) return;

//     if (jdSelectionMode === 'select' && !selectedJdId) return;
//     if (jdSelectionMode === 'paste' && !pastedJdText.trim()) return;
//     if (jdSelectionMode === 'upload' && !jdFile) return;
//     if (jdSelectionMode === 'url' && !jdUrl.trim()) return;

//     setIsComparing(true);
//     try {
//       let result: any = null;

//       if (jdSelectionMode === 'select') {
//         result = await compareService.compare(cvFile, selectedJdId, undefined);
//       } else if (jdSelectionMode === 'paste') {
//         result = await compareService.compare(cvFile, undefined, pastedJdText);
//       } else if (jdSelectionMode === 'upload') {
//         const svc: any = compareService as any;

//         if (typeof svc.compareWithJdFile === 'function') {
//           result = await svc.compareWithJdFile(cvFile, jdFile);
//         } else {
//           if (jdFile && (jdFile.type === 'text/plain' || jdFile.name.toLowerCase().endsWith('.txt'))) {
//             const text = await jdFile.text();
//             result = await compareService.compare(cvFile, undefined, text);
//           } else {
//             alert(
//               'Your API service does not expose compareWithJdFile(). Add that method in compareService to send the JD file to backend.\n\nFallback only supports .txt JD files.'
//             );
//             setIsComparing(false);
//             return;
//           }
//         }
//       } else if (jdSelectionMode === 'url') {
//         const svc: any = compareService as any;

//         if (typeof svc.compareWithJdUrl === 'function') {
//           result = await svc.compareWithJdUrl(cvFile, jdUrl.trim());
//         } else {
//           setIsFetchingUrl(true);
//           try {
//             const res = await fetch(jdUrl.trim());
//             const raw = await res.text();
//             const cleaned = htmlToText(raw);
//             result = await compareService.compare(cvFile, undefined, cleaned);
//           } finally {
//             setIsFetchingUrl(false);
//           }
//         }
//       }

//       setMatchScore(result.matchScore);

//       if (result.matchScore <= 50) {
//         setShowConfirmModal(true);
//       }
//     } catch (error) {
//       console.error('Comparison failed:', error);
//     } finally {
//       setIsComparing(false);
//     }
//   };

//   const handleConfirmConvert = async () => {
//     if (!cvFile) return;
//     setIsConverting(true);
//     try {
//       await compareService.convertToTemplate(cvFile);
//       setShowConfirmModal(false);
//       alert('Resume successfully converted to template!');
//     } catch (error) {
//       console.error('Conversion failed:', error);
//     } finally {
//       setIsConverting(false);
//     }
//   };

//   const isCompareDisabled =
//     isComparing ||
//     isFetchingUrl ||
//     !cvFile ||
//     (jdSelectionMode === 'select' && !selectedJdId) ||
//     (jdSelectionMode === 'paste' && !pastedJdText.trim()) ||
//     (jdSelectionMode === 'upload' && !jdFile) ||
//     (jdSelectionMode === 'url' && !jdUrl.trim());

//   return (
//     <div className="space-y-8 pb-20">
//       <div>
//         <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resume Compare</h1>
//         <p className="text-slate-500 mt-1">
//           Compare candidate resumes against job descriptions to find the best match.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Step 1: JD Selection */}
//         <div className="space-y-6">
//           <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
//                 1
//               </div>
//               <h2 className="text-xl font-bold text-slate-900">Job Description Selection</h2>
//             </div>

//             <div className="space-y-6">
//               {/* Modes */}
//               <div className="flex flex-wrap gap-x-6 gap-y-4">
//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <div className="relative flex items-center justify-center">
//                     <input
//                       type="radio"
//                       name="jd-mode"
//                       className="peer hidden"
//                       checked={jdSelectionMode === 'select'}
//                       onChange={() => setJdSelectionMode('select')}
//                     />
//                     <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
//                     <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
//                   </div>
//                   <span className="text-sm font-bold text-slate-700">Select JD from List</span>
//                 </label>

//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <div className="relative flex items-center justify-center">
//                     <input
//                       type="radio"
//                       name="jd-mode"
//                       className="peer hidden"
//                       checked={jdSelectionMode === 'paste'}
//                       onChange={() => setJdSelectionMode('paste')}
//                     />
//                     <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
//                     <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
//                   </div>
//                   <span className="text-sm font-bold text-slate-700">Paste JD Manually</span>
//                 </label>

//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <div className="relative flex items-center justify-center">
//                     <input
//                       type="radio"
//                       name="jd-mode"
//                       className="peer hidden"
//                       checked={jdSelectionMode === 'upload'}
//                       onChange={() => setJdSelectionMode('upload')}
//                     />
//                     <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
//                     <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
//                   </div>
//                   <span className="text-sm font-bold text-slate-700">Upload JD</span>
//                 </label>

//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <div className="relative flex items-center justify-center">
//                     <input
//                       type="radio"
//                       name="jd-mode"
//                       className="peer hidden"
//                       checked={jdSelectionMode === 'url'}
//                       onChange={() => setJdSelectionMode('url')}
//                     />
//                     <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
//                     <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
//                   </div>
//                   <span className="text-sm font-bold text-slate-700">Upload JD URL</span>
//                 </label>
//               </div>

//               {/* SELECT: Search + typeahead */}
//               {jdSelectionMode === 'select' && (
//                 <div ref={selectBoxRef} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
//                   <div className="flex items-center justify-between">
//                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//                       Search Job Descriptions
//                     </label>

//                     {selectedJdId ? (
//                       <button
//                         type="button"
//                         onClick={handleClearSelected}
//                         className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all"
//                       >
//                         Clear
//                       </button>
//                     ) : null}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {/* Company */}
//                     <div className="relative">
//                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
//                         <SearchIcon className="w-4 h-4" />
//                       </div>
//                       <input
//                         value={companyQuery}
//                         onChange={(e) => {
//                           setCompanyQuery(e.target.value);
//                           setIsSuggestionsOpen(true);
//                           setSelectedJdId(''); // force re-pick after changing filters
//                         }}
//                         onFocus={() => setIsSuggestionsOpen(true)}
//                         placeholder="Company name (type 2+ letters)"
//                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
//                       />
//                     </div>

//                     {/* Position */}
//                     <div className="relative">
//                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
//                         <SearchIcon className="w-4 h-4" />
//                       </div>
//                       <input
//                         value={positionQuery}
//                         onChange={(e) => {
//                           setPositionQuery(e.target.value);
//                           setIsSuggestionsOpen(true);
//                           setSelectedJdId('');
//                         }}
//                         onFocus={() => setIsSuggestionsOpen(true)}
//                         placeholder="Position (type 2+ letters)"
//                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
//                       />
//                     </div>

//                     {/* Experience */}
//                     <input
//                       value={expQuery}
//                       onChange={(e) => {
//                         setExpQuery(e.target.value);
//                         setIsSuggestionsOpen(true);
//                         setSelectedJdId('');
//                       }}
//                       onFocus={() => setIsSuggestionsOpen(true)}
//                       placeholder="Years of experience (e.g. 5+)"
//                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
//                     />

//                     {/* Open till */}
//                     <input
//                       type="date"
//                       value={openTillQuery}
//                       onChange={(e) => {
//                         setOpenTillQuery(e.target.value);
//                         setIsSuggestionsOpen(true);
//                         setSelectedJdId('');
//                       }}
//                       onFocus={() => setIsSuggestionsOpen(true)}
//                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
//                     />
//                   </div>

//                   {/* Suggestions */}
//                   {isSuggestionsOpen && (
//                     <div className="relative">
//                       <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
//                         <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
//                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
//                             Suggestions
//                           </p>
//                           <p className="text-xs text-slate-400 font-medium">
//                             {shouldShowSuggestions ? `${filteredSuggestions.length} result(s)` : 'Type to search'}
//                           </p>
//                         </div>

//                         {!shouldShowSuggestions ? (
//                           <div className="px-4 py-4 text-sm text-slate-500">
//                             Start typing (2+ letters) in Company/Position to see recommendations.
//                           </div>
//                         ) : filteredSuggestions.length === 0 ? (
//                           <div className="px-4 py-4 text-sm text-slate-500">No matching JDs found.</div>
//                         ) : (
//                           <div className="max-h-72 overflow-auto">
//                             {filteredSuggestions.map((jd) => {
//                               const isActive = jd.id === selectedJdId;
//                               return (
//                                 <button
//                                   key={jd.id}
//                                   type="button"
//                                   onClick={() => handlePickJd(jd)}
//                                   className={clsx(
//                                     'w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3',
//                                     isActive && 'bg-blue-50'
//                                   )}
//                                 >
//                                   <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
//                                     {(jd.companyName || 'J')[0]?.toUpperCase()}
//                                   </div>
//                                   <div className="flex-1">
//                                     <div className="flex items-center justify-between gap-3">
//                                       <div>
//                                         <p className="text-sm font-bold text-slate-900">
//                                           {jd.companyName} — {jd.position}
//                                         </p>
//                                         <p className="text-xs text-slate-500 font-medium mt-0.5">
//                                           Exp: {jd.yearsOfExperience} • Open till: {jd.openTillDate}
//                                         </p>
//                                       </div>
//                                       {isActive ? (
//                                         <span className="text-xs font-black text-blue-600 bg-white border border-blue-200 px-2 py-1 rounded-lg">
//                                           Selected
//                                         </span>
//                                       ) : (
//                                         <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
//                                           Choose
//                                         </span>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </button>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {/* Selected JD preview (same as before) */}
//                   {selectedJd && (
//                     <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3 mt-2">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h4 className="font-bold text-blue-900">{selectedJd.position}</h4>
//                           <p className="text-sm text-blue-700 font-medium">{selectedJd.companyName}</p>
//                         </div>
//                         <span className="px-2 py-1 bg-white text-blue-600 text-[10px] font-black uppercase rounded border border-blue-200">
//                           {selectedJd.yearsOfExperience}
//                         </span>
//                       </div>
//                       <p className="text-xs text-blue-600/80 line-clamp-3 leading-relaxed">
//                         {selectedJd.description}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* PASTE */}
//               {jdSelectionMode === 'paste' && (
//                 <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
//                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//                     Paste JD Description
//                   </label>
//                   <textarea
//                     rows={8}
//                     value={pastedJdText}
//                     onChange={(e) => setPastedJdText(e.target.value)}
//                     placeholder="Paste the job requirements here..."
//                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium text-slate-700 text-sm"
//                   />
//                 </div>
//               )}

//               {/* UPLOAD */}
//               {jdSelectionMode === 'upload' && (
//                 <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
//                   <div className="space-y-2">
//                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//                       Upload JD File
//                     </label>

//                     <div className="relative group">
//                       <input
//                         type="file"
//                         id="jd-upload"
//                         className="hidden"
//                         accept=".pdf,.docx,.txt"
//                         onChange={handleJdFileChange}
//                       />
//                       <label
//                         htmlFor="jd-upload"
//                         className={clsx(
//                           'w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300',
//                           jdFile
//                             ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
//                             : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
//                         )}
//                       >
//                         <div
//                           className={clsx(
//                             'p-3 rounded-full transition-colors duration-300',
//                             jdFile
//                               ? 'bg-emerald-100 text-emerald-600'
//                               : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
//                           )}
//                         >
//                           {jdFile ? <CheckCircle2 className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
//                         </div>
//                         <div className="text-center">
//                           <p
//                             className={clsx(
//                               'text-base font-bold',
//                               jdFile ? 'text-emerald-900' : 'text-slate-700 group-hover:text-blue-900'
//                             )}
//                           >
//                             {jdFile ? jdFile.name : 'Click to upload JD'}
//                           </p>
//                           <p className="text-sm text-slate-400 mt-1">Supports PDF, DOCX, or TXT</p>
//                         </div>
//                       </label>
//                     </div>

//                     <p className="text-xs text-slate-500">
//                       Note: If your backend supports JD file compare, expose{' '}
//                       <span className="font-bold">compareWithJdFile</span> in{' '}
//                       <span className="font-bold">compareService</span>. Otherwise, fallback only works for TXT.
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* URL */}
//               {jdSelectionMode === 'url' && (
//                 <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
//                   <div className="space-y-2">
//                     <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//                       Job Description URL
//                     </label>
//                     <div className="flex gap-3">
//                       <div className="relative flex-1">
//                         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
//                           <LinkIcon className="w-4 h-4" />
//                         </div>
//                         <input
//                           value={jdUrl}
//                           onChange={(e) => setJdUrl(e.target.value)}
//                           placeholder="https://company.com/jobs/role"
//                           className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
//                         />
//                       </div>

//                       <button
//                         type="button"
//                         onClick={fetchJdFromUrl}
//                         disabled={isFetchingUrl || !jdUrl.trim()}
//                         className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2"
//                       >
//                         {isFetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
//                         Fetch
//                       </button>
//                     </div>

//                     {urlFetchedTextPreview && (
//                       <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
//                         <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
//                           Preview (fetched)
//                         </p>
//                         <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-6">
//                           {urlFetchedTextPreview}
//                         </p>
//                       </div>
//                     )}

//                     <p className="text-xs text-slate-500">
//                       Note: If your backend supports JD URL compare, expose{' '}
//                       <span className="font-bold">compareWithJdUrl</span> in{' '}
//                       <span className="font-bold">compareService</span>. Otherwise, we fetch the page and send extracted text.
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </section>
//         </div>

//         {/* Step 2: Upload CV */}
//         <div className="space-y-6">
//           <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
//                 2
//               </div>
//               <h2 className="text-xl font-bold text-slate-900">Upload Resume (CV)</h2>
//             </div>

//             <div className="flex-1 flex flex-col justify-center space-y-6">
//               <div className="relative group">
//                 <input
//                   type="file"
//                   id="cv-upload"
//                   className="hidden"
//                   accept=".pdf,.docx"
//                   onChange={handleCvFileChange}
//                 />
//                 <label
//                   htmlFor="cv-upload"
//                   className={clsx(
//                     'w-full py-16 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300',
//                     cvFile
//                       ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
//                       : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
//                   )}
//                 >
//                   <div
//                     className={clsx(
//                       'p-4 rounded-full transition-colors duration-300',
//                       cvFile
//                         ? 'bg-emerald-100 text-emerald-600'
//                         : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
//                     )}
//                   >
//                     {cvFile ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
//                   </div>
//                   <div className="text-center">
//                     <p
//                       className={clsx(
//                         'text-lg font-bold',
//                         cvFile ? 'text-emerald-900' : 'text-slate-700 group-hover:text-blue-900'
//                       )}
//                     >
//                       {cvFile ? cvFile.name : 'Click to upload CV'}
//                     </p>
//                     <p className="text-sm text-slate-400 mt-1">Supports PDF or DOCX format</p>
//                   </div>
//                 </label>
//               </div>

//               <button
//                 onClick={handleCompare}
//                 disabled={isCompareDisabled}
//                 className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest"
//               >
//                 {isComparing ? (
//                   <>
//                     <Loader2 className="w-6 h-6 animate-spin" />
//                     Analyzing Match...
//                   </>
//                 ) : (
//                   <>
//                     <FileSearch className="w-6 h-6" />
//                     Compare Resume
//                   </>
//                 )}
//               </button>
//             </div>
//           </section>
//         </div>
//       </div>

//       {/* Results Section */}
//       {matchScore !== null && (
//         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
//           <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
//             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
//             <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
//               <div className="relative">
//                 <div className="w-40 h-40 rounded-full border-8 border-slate-100 flex items-center justify-center">
//                   <div className="text-center">
//                     <span className="text-4xl font-black text-blue-600">{matchScore}%</span>
//                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
//                       Match Score
//                     </p>
//                   </div>
//                 </div>
//                 <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center">
//                   <TrendingUp className="w-6 h-6 text-emerald-500" />
//                 </div>
//               </div>

//               <div className="flex-1 space-y-4">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />
//                   <h3 className="text-2xl font-bold text-slate-900">Analysis Complete</h3>
//                 </div>
//                 <p className="text-slate-600 leading-relaxed max-w-2xl">
//                   The candidate&apos;s resume has been analyzed against the job description. The match score is based on
//                   skills, experience, and technical requirements found in both documents.
//                 </p>
//                 <div className="flex flex-wrap gap-3">
//                   <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
//                     <Check className="w-4 h-4 text-emerald-500" />
//                     <span className="text-xs font-bold text-slate-700">Skills Matched</span>
//                   </div>
//                   <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
//                     <Check className="w-4 h-4 text-emerald-500" />
//                     <span className="text-xs font-bold text-slate-700">Experience Verified</span>
//                   </div>
//                   <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
//                     <Check className="w-4 h-4 text-emerald-500" />
//                     <span className="text-xs font-bold text-slate-700">Education Check</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col gap-3 min-w-[200px]">
//                 <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
//                   <FileText className="w-4 h-4" />
//                   View Report
//                 </button>
//                 <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
//                   Save Candidate
//                   <ChevronRight className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Confirmation Modal */}
//       {showConfirmModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
//           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
//             <div className="p-8 text-center space-y-6">
//               <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
//                 <AlertCircle className="w-10 h-10 text-amber-500" />
//               </div>
//               <div className="space-y-2">
//                 <h3 className="text-2xl font-bold text-slate-900">Low Match Score</h3>
//                 <p className="text-slate-500">
//                   The resume matches less than <span className="font-bold text-slate-900">50%</span> of the job
//                   description. Do you want to continue with template conversion?
//                 </p>
//               </div>
//               <div className="flex flex-col gap-3">
//                 <button
//                   onClick={handleConfirmConvert}
//                   disabled={isConverting}
//                   className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
//                 >
//                   {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
//                   Yes, Proceed to Conversion
//                 </button>
//                 <button
//                   onClick={() => setShowConfirmModal(false)}
//                   className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
//                 >
//                   <X className="w-5 h-5" />
//                   No, Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileSearch,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  ChevronRight,
  X,
  Check,
  Link as LinkIcon,
  Search as SearchIcon,
} from 'lucide-react';
import { JD } from '../types';
import { compareService } from '../services/api';
import { clsx } from 'clsx';

const BACKEND_URL = 'http://127.0.0.1:8000';

type JdMode = 'select' | 'paste' | 'upload' | 'url';

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

export default function ResumeCompare() {
  const [jds, setJds] = useState<JD[]>([]);
  const [jdSelectionMode, setJdSelectionMode] = useState<JdMode>('select');

  // SELECT mode
  const [selectedJdId, setSelectedJdId] = useState(''); // keep as string always
  const [companyQuery, setCompanyQuery] = useState('');
  const [positionQuery, setPositionQuery] = useState('');
  const [expQuery, setExpQuery] = useState('');
  const [openTillQuery, setOpenTillQuery] = useState(''); // yyyy-mm-dd
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  // PASTE mode
  const [pastedJdText, setPastedJdText] = useState('');

  // UPLOAD mode
  const [jdFile, setJdFile] = useState<File | null>(null);

  // URL mode
  const [jdUrl, setJdUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlFetchedTextPreview, setUrlFetchedTextPreview] = useState('');

  // CV
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Result
  const [isComparing, setIsComparing] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const selectBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchJDs();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!selectBoxRef.current) return;
      if (!selectBoxRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Clear mode-specific inputs when mode changes
  useEffect(() => {
    setMatchScore(null);
    setShowConfirmModal(false);

    if (jdSelectionMode !== 'select') {
      setSelectedJdId('');
      setCompanyQuery('');
      setPositionQuery('');
      setExpQuery('');
      setOpenTillQuery('');
      setIsSuggestionsOpen(false);
    }

    if (jdSelectionMode !== 'paste') setPastedJdText('');
    if (jdSelectionMode !== 'upload') setJdFile(null);
    if (jdSelectionMode !== 'url') {
      setJdUrl('');
      setUrlFetchedTextPreview('');
      setIsFetchingUrl(false);
    }
  }, [jdSelectionMode]);

  // ✅ IMPORTANT FIX: fetch from /get_all_jd and map EXACTLY like JDManagement
  const fetchJDs = async () => {
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
          // id in your JD type might be number or string; normalize to string usage in this file
          id: Number(jd?.id), // keep as number for display + consistency with JDManagement
          companyName: (jd?.company_name ?? '').toString(),
          position: (jd?.position ?? '').toString(),
          yearsOfExperience: (jd?.years_of_experience ?? '').toString(),
          openTillDate,
          status,
          description: (jd?.description ?? '').toString(), // if backend doesn't send it, it becomes ''
        } as JD;
      });

      setJds(mapped);
    } catch (error) {
      console.error('Failed to fetch JDs:', error);
      setJds([]);
    }
  };

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setCvFile(e.target.files[0]);
  };

  const handleJdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setJdFile(e.target.files[0]);
  };

  const htmlToText = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body?.textContent || '';
    return text.replace(/\n{3,}/g, '\n\n').trim();
  };

  const fetchJdFromUrl = async () => {
    const url = jdUrl.trim();
    if (!url) return;

    setIsFetchingUrl(true);
    setUrlFetchedTextPreview('');
    try {
      const res = await fetch(url);
      const raw = await res.text();
      const cleaned = htmlToText(raw);
      setUrlFetchedTextPreview(cleaned.slice(0, 1200));
    } catch (err) {
      console.error('Failed to fetch JD URL:', err);
      alert('Failed to fetch JD from URL. Please check the link and try again.');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Debounce typing so filtering feels smooth
  const dCompany = useDebouncedValue(companyQuery, 150);
  const dPosition = useDebouncedValue(positionQuery, 150);
  const dExp = useDebouncedValue(expQuery, 150);
  const dDate = useDebouncedValue(openTillQuery, 150);

  // ✅ FIX: compare IDs as strings
  const selectedJd = useMemo(
    () => jds.find((j) => String(j.id) === String(selectedJdId)),
    [jds, selectedJdId]
  );

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
    const dq = dDate.trim(); // yyyy-mm-dd

    let list = jds;

    if (cq.length >= 2) {
      list = list.filter((jd) => (jd.companyName || '').toLowerCase().includes(cq));
    }
    if (pq.length >= 2) {
      list = list.filter((jd) => (jd.position || '').toLowerCase().includes(pq));
    }
    if (eq.length >= 1) {
      list = list.filter((jd) => (jd.yearsOfExperience || '').toLowerCase().includes(eq));
    }
    if (dq.length >= 1) {
      list = list.filter((jd) => {
        const od = (jd.openTillDate || '').trim();
        return od === dq || od.startsWith(dq);
      });
    }

    return list.slice(0, 8);
  }, [jds, dCompany, dPosition, dExp, dDate]);

  const handlePickJd = (jd: JD) => {
    setSelectedJdId(String(jd.id)); // ✅ always string
    setIsSuggestionsOpen(false);

    setCompanyQuery(jd.companyName || '');
    setPositionQuery(jd.position || '');
    setExpQuery(jd.yearsOfExperience || '');
    setOpenTillQuery(jd.openTillDate || '');
  };

  const handleClearSelected = () => {
    setSelectedJdId('');
    setCompanyQuery('');
    setPositionQuery('');
    setExpQuery('');
    setOpenTillQuery('');
    setIsSuggestionsOpen(false);
  };

  const handleCompare = async () => {
    if (!cvFile) return;

    if (jdSelectionMode === 'select' && !selectedJdId) return;
    if (jdSelectionMode === 'paste' && !pastedJdText.trim()) return;
    if (jdSelectionMode === 'upload' && !jdFile) return;
    if (jdSelectionMode === 'url' && !jdUrl.trim()) return;

    setIsComparing(true);
    try {
      let result: any = null;

      if (jdSelectionMode === 'select') {
        result = await compareService.compare(cvFile, selectedJdId, undefined);
      } else if (jdSelectionMode === 'paste') {
        result = await compareService.compare(cvFile, undefined, pastedJdText);
      } else if (jdSelectionMode === 'upload') {
        const svc: any = compareService as any;

        if (typeof svc.compareWithJdFile === 'function') {
          result = await svc.compareWithJdFile(cvFile, jdFile);
        } else {
          if (jdFile && (jdFile.type === 'text/plain' || jdFile.name.toLowerCase().endsWith('.txt'))) {
            const text = await jdFile.text();
            result = await compareService.compare(cvFile, undefined, text);
          } else {
            alert(
              'Your API service does not expose compareWithJdFile(). Add that method in compareService to send the JD file to backend.\n\nFallback only supports .txt JD files.'
            );
            setIsComparing(false);
            return;
          }
        }
      } else if (jdSelectionMode === 'url') {
        const svc: any = compareService as any;

        if (typeof svc.compareWithJdUrl === 'function') {
          result = await svc.compareWithJdUrl(cvFile, jdUrl.trim());
        } else {
          setIsFetchingUrl(true);
          try {
            const res = await fetch(jdUrl.trim());
            const raw = await res.text();
            const cleaned = htmlToText(raw);
            result = await compareService.compare(cvFile, undefined, cleaned);
          } finally {
            setIsFetchingUrl(false);
          }
        }
      }

      setMatchScore(result.matchScore);

      if (result.matchScore <= 50) {
        setShowConfirmModal(true);
      }
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const handleConfirmConvert = async () => {
    if (!cvFile) return;
    setIsConverting(true);
    try {
      await compareService.convertToTemplate(cvFile);
      setShowConfirmModal(false);
      alert('Resume successfully converted to template!');
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const isCompareDisabled =
    isComparing ||
    isFetchingUrl ||
    !cvFile ||
    (jdSelectionMode === 'select' && !selectedJdId) ||
    (jdSelectionMode === 'paste' && !pastedJdText.trim()) ||
    (jdSelectionMode === 'upload' && !jdFile) ||
    (jdSelectionMode === 'url' && !jdUrl.trim());

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resume Compare</h1>
        <p className="text-slate-500 mt-1">
          Compare candidate resumes against job descriptions to find the best match.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1 */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm">
                1
              </div>
              <h2 className="text-xl font-bold text-slate-900">Job Description Selection</h2>
            </div>

            <div className="space-y-6">
              {/* Modes */}
              <div className="flex flex-wrap gap-x-6 gap-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="jd-mode"
                      className="peer hidden"
                      checked={jdSelectionMode === 'select'}
                      onChange={() => setJdSelectionMode('select')}
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
                    <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">Select JD from List</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="jd-mode"
                      className="peer hidden"
                      checked={jdSelectionMode === 'paste'}
                      onChange={() => setJdSelectionMode('paste')}
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
                    <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">Paste JD Manually</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="jd-mode"
                      className="peer hidden"
                      checked={jdSelectionMode === 'upload'}
                      onChange={() => setJdSelectionMode('upload')}
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
                    <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">Upload JD</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="jd-mode"
                      className="peer hidden"
                      checked={jdSelectionMode === 'url'}
                      onChange={() => setJdSelectionMode('url')}
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 transition-all group-hover:border-blue-400"></div>
                    <div className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">Upload JD URL</span>
                </label>
              </div>

              {/* SELECT */}
              {jdSelectionMode === 'select' && (
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
                    {/* Company */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <SearchIcon className="w-4 h-4" />
                      </div>
                      <input
                        value={companyQuery}
                        onChange={(e) => {
                          setCompanyQuery(e.target.value);
                          setIsSuggestionsOpen(true);
                          setSelectedJdId('');
                        }}
                        onFocus={() => setIsSuggestionsOpen(true)}
                        placeholder="Company name (type 2+ letters)"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
                      />
                    </div>

                    {/* Position */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <SearchIcon className="w-4 h-4" />
                      </div>
                      <input
                        value={positionQuery}
                        onChange={(e) => {
                          setPositionQuery(e.target.value);
                          setIsSuggestionsOpen(true);
                          setSelectedJdId('');
                        }}
                        onFocus={() => setIsSuggestionsOpen(true)}
                        placeholder="Position (type 2+ letters)"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
                      />
                    </div>

                    {/* Experience */}
                    <input
                      value={expQuery}
                      onChange={(e) => {
                        setExpQuery(e.target.value);
                        setIsSuggestionsOpen(true);
                        setSelectedJdId('');
                      }}
                      onFocus={() => setIsSuggestionsOpen(true)}
                      placeholder="Years of experience (e.g. 5+)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
                    />

                    {/* Open till */}
                    <input
                      type="date"
                      value={openTillQuery}
                      onChange={(e) => {
                        setOpenTillQuery(e.target.value);
                        setIsSuggestionsOpen(true);
                        setSelectedJdId('');
                      }}
                      onFocus={() => setIsSuggestionsOpen(true)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
                    />
                  </div>

                  {/* Suggestions */}
                  {isSuggestionsOpen && (
                    <div className="relative">
                      <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Suggestions</p>
                          <p className="text-xs text-slate-400 font-medium">
                            {shouldShowSuggestions ? `${filteredSuggestions.length} result(s)` : 'Type to search'}
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
                                    'w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3',
                                    isActive && 'bg-blue-50'
                                  )}
                                >
                                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                    {(jd.companyName || 'J')[0]?.toUpperCase()}
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

                  {/* Selected JD preview */}
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
                        {selectedJd.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* PASTE */}
              {jdSelectionMode === 'paste' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Paste JD Description
                  </label>
                  <textarea
                    rows={8}
                    value={pastedJdText}
                    onChange={(e) => setPastedJdText(e.target.value)}
                    placeholder="Paste the job requirements here..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-medium text-slate-700 text-sm"
                  />
                </div>
              )}

              {/* UPLOAD */}
              {jdSelectionMode === 'upload' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Upload JD File
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
                          'w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300',
                          jdFile
                            ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                        )}
                      >
                        <div
                          className={clsx(
                            'p-3 rounded-full transition-colors duration-300',
                            jdFile
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                          )}
                        >
                          {jdFile ? <CheckCircle2 className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
                        </div>
                        <div className="text-center">
                          <p
                            className={clsx(
                              'text-base font-bold',
                              jdFile ? 'text-emerald-900' : 'text-slate-700 group-hover:text-blue-900'
                            )}
                          >
                            {jdFile ? jdFile.name : 'Click to upload JD'}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">Supports PDF, DOCX, or TXT</p>
                        </div>
                      </label>
                    </div>

                    <p className="text-xs text-slate-500">
                      Note: If your backend supports JD file compare, expose{' '}
                      <span className="font-bold">compareWithJdFile</span> in{' '}
                      <span className="font-bold">compareService</span>. Otherwise, fallback only works for TXT.
                    </p>
                  </div>
                </div>
              )}

              {/* URL */}
              {jdSelectionMode === 'url' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Job Description URL
                    </label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <LinkIcon className="w-4 h-4" />
                        </div>
                        <input
                          value={jdUrl}
                          onChange={(e) => setJdUrl(e.target.value)}
                          placeholder="https://company.com/jobs/role"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700 text-sm"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={fetchJdFromUrl}
                        disabled={isFetchingUrl || !jdUrl.trim()}
                        className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                      >
                        {isFetchingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        Fetch
                      </button>
                    </div>

                    {urlFetchedTextPreview && (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                          Preview (fetched)
                        </p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-6">
                          {urlFetchedTextPreview}
                        </p>
                      </div>
                    )}

                    <p className="text-xs text-slate-500">
                      Note: If your backend supports JD URL compare, expose{' '}
                      <span className="font-bold">compareWithJdUrl</span> in{' '}
                      <span className="font-bold">compareService</span>. Otherwise, we fetch the page and send extracted text.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Step 2 */}
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
                <input
                  type="file"
                  id="cv-upload"
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={handleCvFileChange}
                />
                <label
                  htmlFor="cv-upload"
                  className={clsx(
                    'w-full py-16 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300',
                    cvFile
                      ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                  )}
                >
                  <div
                    className={clsx(
                      'p-4 rounded-full transition-colors duration-300',
                      cvFile
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                    )}
                  >
                    {cvFile ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                  </div>
                  <div className="text-center">
                    <p
                      className={clsx(
                        'text-lg font-bold',
                        cvFile ? 'text-emerald-900' : 'text-slate-700 group-hover:text-blue-900'
                      )}
                    >
                      {cvFile ? cvFile.name : 'Click to upload CV'}
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
      </div>

      {/* Results Section */}
      {matchScore !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-8 border-slate-100 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-black text-blue-600">{matchScore}%</span>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                      Match Score
                    </p>
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
                <p className="text-slate-600 leading-relaxed max-w-2xl">
                  The candidate&apos;s resume has been analyzed against the job description. The match score is based on
                  skills, experience, and technical requirements found in both documents.
                </p>
              </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
                {/* <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  View Report
                </button> */}
                <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                  Save Candidate
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
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
                  description. Do you want to continue with template conversion?
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmConvert}
                  disabled={isConverting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isConverting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Yes, Proceed to Conversion
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
    </div>
  );
}