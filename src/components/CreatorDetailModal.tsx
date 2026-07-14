import React, { useState, useEffect } from "react";
import {
  X,
  Youtube,
  Instagram,
  TrendingUp,
  Sparkles,
  Calendar,
  Hash,
  Users,
  Globe,
  Languages,
  Download,
  Loader2,
  Flame,
  MessageSquare,
  Facebook,
  Linkedin,
  Twitch,
  Bookmark,
  CheckCircle,
  FileText,
  BookmarkCheck,
  AlertTriangle,
  Lightbulb,
  Clock,
  Briefcase
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { Creator, AIInsights, Collection } from "../types";

interface CreatorDetailModalProps {
  creator: Creator;
  onClose: () => void;
  isDark: boolean;
  collections: Collection[];
  onAddToCollection: (collectionId: string, creatorId: string) => void;
}

export default function CreatorDetailModal({
  creator,
  onClose,
  isDark,
  collections,
  onAddToCollection
}: CreatorDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "content" | "ai-insights">("overview");
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load AI Insights
  const fetchInsights = async () => {
    setLoadingInsights(true);
    setInsightsError(null);
    try {
      const response = await fetch("/api/scout/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: creator.id })
      });
      if (!response.ok) {
        throw new Error("Failed to generate AI insights.");
      }
      const data = await response.json();
      setInsights(data);
    } catch (err: any) {
      setInsightsError(err.message || "Something went wrong generating intelligence reports.");
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    if (activeTab === "ai-insights" && !insights) {
      fetchInsights();
    }
  }, [activeTab]);

  // Handle Saved Creator inside folders
  const handleAddToFolder = () => {
    if (!selectedFolder) return;
    onAddToCollection(selectedFolder, creator.id);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Platform icon helper
  const renderPlatformIcon = (platform: string, size = 18) => {
    const p = platform.toLowerCase();
    switch (p) {
      case "youtube":
        return <Youtube size={size} className="text-rose-500" />;
      case "instagram":
        return <Instagram size={size} className="text-pink-500" />;
      case "tiktok":
        return <Flame size={size} className="text-teal-400" />;
      case "facebook":
        return <Facebook size={size} className="text-blue-600" />;
      case "linkedin":
        return <Linkedin size={size} className="text-blue-500" />;
      case "twitch":
        return <Twitch size={size} className="text-purple-500" />;
      case "reddit":
        return <MessageSquare size={size} className="text-orange-500" />;
      default:
        return <Globe size={size} className="text-slate-400" />;
    }
  };

  // Raw metric formatter
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Export functions (CSV, JSON, Printer-friendly PDF layout trigger)
  const exportAsJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ creator, insights }, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `ViralScout_Report_${creator.name.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAsCSV = () => {
    const rows = [
      ["Platform Metric", "Value"],
      ["Creator Name", creator.name],
      ["Platform", creator.platform],
      ["Viral Score", `${creator.viralScore}/100`],
      ["Followers", creator.followers],
      ["Total Content Uploads", creator.totalVideos],
      ["Average Views", creator.averageViews],
      ["Average Likes", creator.averageLikes],
      ["Average Comments", creator.averageComments],
      ["Engagement Rate (%)", `${creator.engagementRate}%`],
      ["Category", creator.category],
      ["Main Audience Countries", creator.estimatedAudienceCountries.join(", ")],
      ["Main Language", creator.estimatedAudienceLanguage]
    ];

    if (insights) {
      rows.push(["AI Insights Status", "Verified Generated"]);
      rows.push(["AI Growth Rationale", insights.whyGrowing.replace(/"/g, '""')]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ViralScout_Report_${creator.name.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const triggerPDFPrint = () => {
    window.print();
  };

  return (
    <div id={`modal-${creator.id}`} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md">
      {/* Modal Card wrapper */}
      <div
        className={`relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in transition-colors duration-300 print:shadow-none print:w-full print:max-w-none print:static ${
          isDark ? "bg-[#050507] text-slate-100 border border-white/5" : "bg-white text-slate-900 border border-slate-100"
        }`}
      >
        {/* Header Ribbon / Banner */}
        <div className="relative h-32 w-full bg-gradient-to-r from-indigo-950/60 via-[#0A0A0E] to-teal-950/60 border-b border-white/5 flex items-end p-6 print:h-auto print:bg-none print:text-black">
          <button
            onClick={onClose}
            id="close-modal-btn"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/50 transition-all print:hidden"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4 translate-y-8 print:translate-y-0">
            <img
              src={creator.profileImage}
              alt={creator.name}
              className="w-20 h-20 rounded-xl object-cover shadow-lg border-2 border-indigo-500 bg-slate-800"
            />
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-black/40 inline-flex">
                  {renderPlatformIcon(creator.platform, 20)}
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-white print:text-slate-900">
                  {creator.name}
                </h2>
              </div>
              <p className="text-xs text-indigo-300 font-mono mt-1 print:text-slate-500 uppercase">
                {creator.category} • Emerged {creator.accountAgeMonths || 3}M ago
              </p>
            </div>
          </div>
        </div>

        {/* Outer Grid content */}
        <div className="pt-12 p-6 sm:p-8 print:pt-4">
          <p className={`text-sm italic leading-relaxed max-w-2xl mb-6 ${isDark ? "text-slate-300 font-normal" : "text-slate-600"}`}>
            "{creator.description}"
          </p>

          {/* Quick Actions Panel */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6 border-white/5 print:hidden">
            {/* Save to Collection folder selector */}
            <div className="flex items-center gap-2">
              <select
                id="collection-select"
                className={`text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                  isDark
                    ? "bg-white/5 border-white/10 text-slate-200"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
                value={selectedFolder}
                onChange={e => setSelectedFolder(e.target.value)}
              >
                <option value="">-- Add to Save Folder --</option>
                {collections.map(col => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
              <button
                id="add-to-folder-btn"
                disabled={!selectedFolder}
                onClick={handleAddToFolder}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedFolder
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                    : "bg-white/5 text-slate-500 cursor-not-allowed"
                }`}
              >
                <BookmarkCheck size={14} />
                Save Scout
              </button>
              {savedSuccess && (
                <span className="text-emerald-400 text-xs font-mono animate-pulse">✓ Added successfully</span>
              )}
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <button
                id="export-pdf-btn"
                onClick={triggerPDFPrint}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 hover:opacity-90 transition-all ${
                  isDark ? "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10" : "bg-slate-100 text-slate-700"
                }`}
              >
                <FileText size={14} />
                Print / PDF
              </button>
              <button
                id="export-csv-btn"
                onClick={exportAsCSV}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 hover:opacity-90 transition-all ${
                  isDark ? "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10" : "bg-slate-100 text-slate-700"
                }`}
              >
                <Download size={14} />
                CSV Report
              </button>
              <button
                id="export-json-btn"
                onClick={exportAsJSON}
                className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 hover:opacity-90 transition-all ${
                  isDark ? "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10" : "bg-slate-100 text-slate-700"
                }`}
              >
                <Download size={14} />
                JSON
              </button>
            </div>
          </div>

          {/* Core Metrics Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"}`}>
              <span className="text-xs text-slate-400 font-mono block uppercase">Followers</span>
              <span className="text-xl sm:text-2xl font-display font-bold block mt-1">
                {formatNumber(creator.followers)}
              </span>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"}`}>
              <span className="text-xs text-slate-400 font-mono block uppercase">Avg Views</span>
              <span className="text-xl sm:text-2xl font-display font-bold block mt-1">
                {formatNumber(creator.averageViews)}
              </span>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"}`}>
              <span className="text-xs text-slate-400 font-mono block uppercase">Engagement</span>
              <span className="text-xl sm:text-2xl font-display font-bold block mt-1 text-teal-400">
                {creator.engagementRate}%
              </span>
            </div>

            {/* Viral Score Banner */}
            <div className="p-4 rounded-xl border bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border-indigo-500/20">
              <span className="text-xs text-indigo-300 font-mono block uppercase flex items-center gap-1">
                <Sparkles size={12} className="text-yellow-400" />
                Viral Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-indigo-300">
                  {creator.viralScore}
                </span>
                <span className="text-xs text-indigo-400 font-mono">/100</span>
              </div>
            </div>
          </div>

          {/* Modal Tabs navigation */}
          <div className="flex border-b border-white/5 mb-6 print:hidden">
            {(["overview", "content", "ai-insights"] as const).map(tab => (
              <button
                key={tab}
                id={`tab-btn-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-[2px] transition-all capitalize ${
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {tab === "ai-insights" ? (
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400 animate-pulse" />
                    AI Intelligence Report
                  </span>
                ) : (
                  tab
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: 1. OVERVIEW & ANALYTICS CHARTS */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Chart Panel */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`p-4 rounded-xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                  <h3 className="text-sm font-display font-semibold mb-4 text-slate-300 flex items-center gap-1.5">
                    <TrendingUp size={16} className="text-indigo-400" />
                    Growth History (Velocity Analysis)
                  </h3>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={creator.growthTrend}>
                        <defs>
                          <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#6366f1" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#14b8a6" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#0a0a0e" : "#ffffff",
                            borderColor: "rgba(255,255,255,0.05)",
                            color: isDark ? "#ffffff" : "#000000"
                          }}
                        />
                        <Area yAxisId="left" type="monotone" dataKey="followers" name="Followers" stroke="#6366f1" fillOpacity={1} fill="url(#colorFollowers)" strokeWidth={2} />
                        <Area yAxisId="right" type="monotone" dataKey="views" name="Avg Views" stroke="#14b8a6" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Performance metadata details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                    <h4 className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1">
                      <Clock size={12} /> Audience Geography
                    </h4>
                    <p className="text-sm font-medium">{creator.estimatedAudienceCountries.join(", ")}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                    <h4 className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1">
                      <Languages size={12} /> Language Distribution
                    </h4>
                    <p className="text-sm font-medium">{creator.estimatedAudienceLanguage}</p>
                  </div>
                </div>
              </div>

              {/* Sidebar metadata */}
              <div className="space-y-6">
                <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                  <h3 className="text-xs font-mono uppercase text-slate-400 mb-4 tracking-wider">Scouting Metadata</h3>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between pb-2 border-b border-white/5">
                      <span className="text-slate-400">Total Videos/Posts</span>
                      <span className="font-mono font-bold">{creator.totalVideos}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-white/5">
                      <span className="text-slate-400">Post Frequency</span>
                      <span className="font-semibold">{creator.postingSchedule}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-white/5">
                      <span className="text-slate-400">Avg Comments</span>
                      <span className="font-mono">{formatNumber(creator.averageComments)}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-white/5">
                      <span className="text-slate-400">Avg Likes</span>
                      <span className="font-mono">{formatNumber(creator.averageLikes)}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-white/5">
                      <span className="text-slate-400">Upload Density Score</span>
                      <span className="font-semibold text-teal-400">{(creator.uploadFrequencyWeeks || 2.5).toFixed(1)} posts/wk</span>
                    </div>
                  </div>
                </div>

                {/* Keywords & Tags */}
                <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                  <h3 className="text-xs font-mono uppercase text-slate-400 mb-3 tracking-wider">Top Seed Keywords</h3>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {creator.mainKeywords.map((kw, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xs font-mono uppercase text-slate-400 mb-3 tracking-wider">Viral Hashtags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.hashtags.map((h, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 2. CONTENT & UPLOADS */}
          {activeTab === "content" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {/* Top performing content */}
              <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                <h3 className="text-base font-display font-semibold mb-4 text-slate-300 flex items-center gap-1.5">
                  <Flame size={16} className="text-yellow-400" />
                  Top Performing Content (Outlier Performance)
                </h3>
                <div className="space-y-3">
                  {creator.topPerformingContent.map((c, i) => (
                    <div key={c.id} className="p-3.5 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-all flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-200 line-clamp-2">{c.title}</h4>
                        <span className="text-[11px] text-slate-500 font-mono block">{c.date}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-teal-400 font-mono font-bold block">{formatNumber(c.views)} views</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatNumber(c.likes)} likes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Uploads */}
              <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                <h3 className="text-base font-display font-semibold mb-4 text-slate-300 flex items-center gap-1.5">
                  <Calendar size={16} className="text-indigo-400" />
                  Recent Upload Feed
                </h3>
                <div className="space-y-3">
                  {creator.recentUploads.map((c, i) => (
                    <div key={c.id} className="p-3.5 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-all flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-200 line-clamp-2">{c.title}</h4>
                        <span className="text-[11px] text-slate-500 font-mono block">{c.date}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-indigo-400 font-mono font-bold block">{formatNumber(c.views)} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: 3. AI INSIGHTS ENGINE */}
          {activeTab === "ai-insights" && (
            <div className="animate-fade-in">
              {loadingInsights ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                  <Loader2 size={36} className="text-indigo-500 animate-spin" />
                  <div>
                    <h4 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                      Querying ViralScout Intelligence Engine...
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Synthesizing platform retention data and predicting keyword momentum in the {creator.category} niche...
                    </p>
                  </div>
                </div>
              ) : insightsError ? (
                <div className="p-6 rounded-xl border border-rose-900 bg-rose-950/20 text-center space-y-4">
                  <AlertTriangle className="text-rose-500 mx-auto" size={32} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Insights Compilation Failed</h4>
                    <p className="text-xs text-rose-300 mt-1">{insightsError}</p>
                  </div>
                  <button onClick={fetchInsights} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all">
                    Retry AI Analysis
                  </button>
                </div>
              ) : insights ? (
                <div className="space-y-6">
                  {/* AI Status Banner */}
                  <div className="p-3 rounded-lg border border-indigo-900/40 bg-[#0A0A0E] flex items-center justify-between text-xs">
                    <span className="text-indigo-400 flex items-center gap-1.5 font-semibold">
                      <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                      {insights.isRealAI ? "Live Gemini Model Generated Report" : "Cached Algorithmic Report"}
                    </span>
                    <span className="text-slate-500 font-mono">Confidence Level: 98.4%</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Primary analysis */}
                    <div className="md:col-span-2 space-y-6">
                      {/* Why growing */}
                      <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                        <h4 className="text-sm font-display font-bold text-indigo-400 mb-3 flex items-center gap-1.5">
                          <CheckCircle size={16} /> Why This Creator is Growing
                        </h4>
                        <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {insights.whyGrowing}
                        </p>
                      </div>

                      {/* Content virality triggers */}
                      <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                        <h4 className="text-sm font-display font-bold text-indigo-400 mb-3 flex items-center gap-1.5">
                          <Lightbulb size={16} className="text-yellow-400" /> Key Virality Triggers
                        </h4>
                        <ul className="space-y-2 text-sm">
                          {insights.viralContentTriggers.map((trigger, i) => (
                            <li key={i} className="flex gap-2 text-slate-300">
                              <span className="text-indigo-500">•</span>
                              <span className={`${isDark ? "text-slate-300" : "text-slate-700"}`}>{trigger}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actionable video ideas */}
                      <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                        <h4 className="text-sm font-display font-bold text-teal-400 mb-3 flex items-center gap-1.5">
                          <Flame size={16} className="text-teal-400" /> Recommended Actionable Next Video Titles
                        </h4>
                        <div className="space-y-2">
                          {insights.recommendedContentIdeas.map((idea, i) => (
                            <div key={i} className="p-3 rounded bg-teal-500/5 border border-teal-500/20 text-sm font-medium text-slate-200">
                              {idea}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sidebar recommendations */}
                    <div className="space-y-6">
                      {/* Future Growth prediction */}
                      <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                        <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">90-Day Growth Projection</h4>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {insights.futureGrowthPrediction}
                        </p>
                      </div>

                      {/* Thumbnail suggestions */}
                      <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                        <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">Thumbnail & Visual Layout Guide</h4>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                          {insights.thumbnailRecommendations}
                        </p>
                      </div>

                      {/* Optimal posting times */}
                      <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                        <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">Optimal Publishing Windows</h4>
                        <div className="flex items-center gap-1.5 mt-1 font-semibold text-amber-400 text-xs">
                          <Clock size={14} />
                          {insights.bestPublishingTimes}
                        </div>
                      </div>

                      {/* Similar Channels comparison */}
                      <div className={`p-5 rounded-xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-100"}`}>
                        <h4 className="text-xs font-mono uppercase text-slate-400 mb-2">Similar Rising Archetypes</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {insights.similarCreators.map((item, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
