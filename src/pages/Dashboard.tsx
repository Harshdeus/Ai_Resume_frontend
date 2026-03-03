import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  FileSearch, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total JDs', value: '24', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', trendUp: true },
  { label: 'Resumes Analyzed', value: '1,284', icon: FileSearch, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+8%', trendUp: true },
  { label: 'Total Candidates', value: '456', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+15%', trendUp: true },
  { label: 'Avg. Match Score', value: '72%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-2%', trendUp: false },
];

const recentActivity = [
  { id: 1, candidate: 'John Doe', position: 'Senior React Dev', score: 85, time: '2 hours ago', status: 'High Match' },
  { id: 2, candidate: 'Jane Smith', position: 'Product Manager', score: 48, time: '5 hours ago', status: 'Low Match' },
  { id: 3, candidate: 'Mike Johnson', position: 'UI Designer', score: 91, time: 'Yesterday', status: 'High Match' },
  { id: 4, candidate: 'Sarah Wilson', position: 'Backend Engineer', score: 65, time: '2 days ago', status: 'Medium Match' },
];

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, HR Admin</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your recruitment pipeline today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{stat.label}</h3>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Comparisons</h3>
            <Link to="/resume-compare" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
              New Compare
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                    {activity.candidate.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{activity.candidate}</h4>
                    <p className="text-sm text-slate-500">{activity.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className={`text-sm font-black ${
                      activity.score >= 80 ? 'text-emerald-600' : 
                      activity.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
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
            ))}
          </div>
          <div className="p-4 bg-slate-50 text-center">
            <Link to="/candidate-list" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
              View All Candidates
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
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
                  <span className="text-blue-600">18 / 24</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-[75%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-400">High Match Rate</span>
                  <span className="text-emerald-600">42%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[42%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Avg. Time to Match</span>
                  <span className="text-amber-600">4.2 Days</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[60%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
