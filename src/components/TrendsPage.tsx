import React, { useState, useEffect } from "react";
import {
  Flame,
  TrendingUp,
  Hash,
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Bookmark,
  Share2
} from "lucide-react";

interface TrendsPageProps {
  isDark: boolean;
}

export default function TrendsPage({ isDark }: TrendsPageProps) {
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scout/trends");
      if (!res.ok) {
        throw new Error("Failed to compile trend database.");
      }
      const data = await res.json();
      setTrends(data);
    } catch (err: any) {
      setError(err.message || "Failed to load trends.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 size={36} className="text-indigo-500 animate-spin" />
        <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">Compiling Scouting Data...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-rose-900 bg-rose-950/10 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="text-rose-500 mx-auto" size={32} />
        <div>
          <h4 className="text-sm font-bold text-slate-200">Database Connection Failed</h4>
          <p className="text-xs text-rose-300 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchTrends}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight flex items-center gap-2">
          <Sparkles className="text-amber-400 animate-pulse" />
          Trend Discovery Hub
        </h1>
        <p className={`text-sm mt-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Exploding topics, emerging format strategies, and high-velocity platform hashtags scouted globally.
        </p>
      </div>

      {/* Main Weekly intelligence Report Document */}
      {trends?.weeklyReport && (
        <div className={`p-6 sm:p-8 rounded-2xl border bg-gradient-to-br transition-all duration-300 ${
          isDark
            ? "from-[#0A0A0E] via-indigo-950/10 to-[#050507] border-white/5 shadow-2xl"
            : "from-slate-50 via-white to-slate-50 border-slate-200/60 shadow-sm"
        }`}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="space-y-1">
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider rounded bg-indigo-500/10 text-indigo-400">
                Weekly intelligence
              </span>
              <h2 className="text-xl font-display font-bold text-slate-100 print:text-slate-900 mt-1.5">
                {trends.weeklyReport.title}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Calendar size={14} className="text-indigo-400" />
              {trends.weeklyReport.period}
            </div>
          </div>

          <p className={`text-sm leading-relaxed mb-6 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            {trends.weeklyReport.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5">
            {trends.weeklyReport.strategicTakeaways.map((takeaway: string, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-xs font-mono text-indigo-400 uppercase font-bold">Action #{idx + 1}</span>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {takeaway}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics & Niches Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exploding Topics Card */}
        <div className={`p-5 rounded-xl border lg:col-span-2 ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          <h3 className="text-sm font-display font-semibold mb-4 text-indigo-400 flex items-center gap-2">
            <TrendingUp size={16} />
            Exploding Topics (Audience Surges)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-mono">
                  <th className="pb-3 font-medium">Topic / Query</th>
                  <th className="pb-3 font-medium text-right">Growth Rate</th>
                  <th className="pb-3 font-medium text-center">Momentum</th>
                  <th className="pb-3 font-medium">Primary Niche</th>
                  <th className="pb-3 font-medium text-right">Platform Occurrences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {trends?.explodingTopics?.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-medium text-slate-200 font-display">{item.topic}</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400">{item.growth}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.momentum === "Extreme" ? "bg-rose-500/10 text-rose-400" : "bg-indigo-500/10 text-indigo-400"
                      }`}>
                        {item.momentum}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{item.niche}</td>
                    <td className="py-3 text-right font-mono text-slate-400">{item.platformCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rising Niches Card */}
        <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          <h3 className="text-sm font-display font-semibold mb-4 text-indigo-400 flex items-center gap-2">
            <Flame size={16} className="text-teal-400" />
            Rising Niches Density
          </h3>
          <div className="space-y-4">
            {trends?.risingNiches?.map((n: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-semibold text-slate-200">{n.niche}</span>
                  <span className="font-mono text-teal-400 font-bold">{n.score} Density</span>
                </div>
                {/* Visual density bar */}
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full"
                    style={{ width: `${n.score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Top: {n.topPlatform}</span>
                  <span>{n.representativeCount} emerging creators</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hashtag Analytics Panel */}
      <div className={`p-6 rounded-xl border ${isDark ? "bg-white/[0.01] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
        <h3 className="text-sm font-display font-semibold mb-4 text-indigo-400 flex items-center gap-2">
          <Hash size={16} className="text-indigo-400" />
          Viral Hashtags Tracker
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {trends?.viralHashtags?.map((tag: any, i: number) => (
            <div key={i} className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${
              isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100 shadow-sm"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 truncate">{tag.tag}</span>
                <ArrowUpRight size={14} className="text-slate-500" />
              </div>
              <div className="mt-3">
                <span className="text-xs text-slate-400 block font-mono">Volume</span>
                <span className="text-base font-display font-bold block text-slate-200 mt-0.5">{tag.viewCount}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-1 text-[9px] text-slate-500 font-mono uppercase">
                <span>{tag.platforms.join(" • ")}</span>
                <span className="text-emerald-400">{tag.momentum}% mot</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emerging Formats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          <h4 className="text-xs font-mono uppercase text-indigo-400 font-bold mb-3">Predicted Formats to Test</h4>
          <ul className="space-y-3 text-xs leading-relaxed">
            <li className="flex gap-2">
              <span className="text-indigo-500">✔</span>
              <div>
                <strong className="text-slate-200 block">Split-Screen Real-time slangs</strong>
                Interactive, rapid language scenarios pairing natural environments with side-by-side vocabulary comparisons.
              </div>
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500">✔</span>
              <div>
                <strong className="text-slate-200 block">Interactive Code Sandbox Loops</strong>
                Shorts/Tiktoks with a static screen compiling simple commands in real-time. High loop density.
              </div>
            </li>
          </ul>
        </div>

        <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          <h4 className="text-xs font-mono uppercase text-indigo-400 font-bold mb-3">Scouted Platforms Distribution</h4>
          <p className="text-xs leading-relaxed text-slate-400 mb-4">
            Our engine indexes public content globally. Active platform metrics weights configured for emerging creator discovery:
          </p>
          <div className="flex flex-wrap gap-2">
            {["YouTube (35%)", "TikTok (25%)", "Instagram (20%)", "Twitch (10%)", "X/Twitter (10%)"].map((p, idx) => (
              <span key={idx} className="text-[11px] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300 font-mono">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
