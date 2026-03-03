import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
  Users,
  Calendar,
  Briefcase,
  Building2
} from 'lucide-react';
import { Candidate } from '../types';
import { candidateService } from '../services/api';
import { clsx } from 'clsx';

export default function CandidateList() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [positionFilter, setPositionFilter] = useState('All');
  const [scoreRange, setScoreRange] = useState('All');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const data = await candidateService.getAll();
      setCandidates(data);
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.candidateName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = companyFilter === 'All' || c.companyName === companyFilter;
    const matchesPosition = positionFilter === 'All' || c.position === positionFilter;
    
    let matchesScore = true;
    if (scoreRange === '80+') matchesScore = c.matchingScore >= 80;
    else if (scoreRange === '50-80') matchesScore = c.matchingScore >= 50 && c.matchingScore < 80;
    else if (scoreRange === '<50') matchesScore = c.matchingScore < 50;

    return matchesSearch && matchesCompany && matchesPosition && matchesScore;
  });

  const companies = ['All', ...Array.from(new Set(candidates.map(c => c.companyName)))];
  const positions = ['All', ...Array.from(new Set(candidates.map(c => c.position)))];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Candidate List</h1>
          <p className="text-slate-500 mt-1">View and manage all candidates extracted from resume comparisons.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm transition-all">
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search candidate name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
          </div>
          
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={companyFilter}
              onChange={e => setCompanyFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm appearance-none cursor-pointer"
            >
              {companies.map(comp => <option key={comp} value={comp}>{comp === 'All' ? 'All Companies' : comp}</option>)}
            </select>
          </div>

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={positionFilter}
              onChange={e => setPositionFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm appearance-none cursor-pointer"
            >
              {positions.map(pos => <option key={pos} value={pos}>{pos === 'All' ? 'All Positions' : pos}</option>)}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={scoreRange}
              onChange={e => setScoreRange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="All">All Scores</option>
              <option value="80+">High Match (80%+)</option>
              <option value="50-80">Medium Match (50-80%)</option>
              <option value="<50">Low Match (&lt;50%)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Company & Position</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Extracted On</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-slate-500 font-medium">Loading Candidates...</p>
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No candidates found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border-2 border-white shadow-sm">
                          {candidate.candidateName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-bold text-slate-900">{candidate.candidateName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{candidate.companyName}</span>
                        <span className="text-xs text-slate-500">{candidate.position}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{candidate.candidateExperience}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={clsx(
                        "inline-flex items-center justify-center w-12 h-12 rounded-xl text-sm font-black",
                        candidate.matchingScore >= 80 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        candidate.matchingScore >= 50 ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        "bg-red-50 text-red-600 border border-red-100"
                      )}>
                        {candidate.matchingScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {candidate.dateExtracted}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={candidate.fileLink}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Download Resume"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredCandidates.length}</span> of <span className="font-bold text-slate-900">{candidates.length}</span> candidates
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
