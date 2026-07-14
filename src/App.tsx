import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Youtube,
  Instagram,
  Flame,
  TrendingUp,
  Sparkles,
  Bell,
  Folder,
  SlidersHorizontal,
  ChevronRight,
  Sun,
  Moon,
  Info,
  Scale,
  Zap,
  RefreshCw,
  Award,
  Globe,
  Loader2
} from "lucide-react";
import { Creator, Collection } from "./types";
import CreatorDetailModal from "./components/CreatorDetailModal";
import TrendsPage from "./components/TrendsPage";
import AlertsPage from "./components/AlertsPage";
import CollectionsPage from "./components/CollectionsPage";

export default function App() {
  // Theme and Tab Management
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<"terminal" | "trends" | "alerts" | "collections">("terminal");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [platform, setPlatform] = useState("all");
  const [category, setCategory] = useState("all");
  const [maxFollowers, setMaxFollowers] = useState<number>(50000);
  const [minViews, setMinViews] = useState<number>(10000);
  const [minEngagement, setMinEngagement] = useState<number>(5);
  const [minViralScore, setMinViralScore] = useState<number>(60);

  // Loaded Creators & Collections from DB
  const [creators, setCreators] = useState<Creator[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  // Sidebar metrics
  const [alertCount, setAlertCount] = useState(0);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        platform,
        category,
        maxFollowers: String(maxFollowers),
        minViews: String(minViews),
        minEngagement: String(minEngagement),
        minViralScore: String(minViralScore)
      });
      if (searchQuery.trim()) {
        queryParams.set("keyword", searchQuery);
      }

      const res = await fetch(`/api/scout/search?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCreators(data);
      }
    } catch (err) {
      console.error("Error fetching creator directory:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/scout/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (err) {
      console.error("Error fetching saved folders:", err);
    }
  };

  const fetchAlertLogs = async () => {
    try {
      const res = await fetch("/api/scout/alerts");
      if (res.ok) {
        const data = await res.json();
        const unreadCount = data.logs.filter((l: any) => !l.isRead).length;
        setAlertCount(unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [platform, category, maxFollowers, minViews, minEngagement, minViralScore]);

  useEffect(() => {
    fetchCollections();
    fetchAlertLogs();
    // Poll alerts feed for simulated events
    const interval = setInterval(() => {
      fetchAlertLogs();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCreators();
  };

  // Pre-configured scouting templates for instant filtration
  const applyPresetQuery = (preset: {
    search: string;
    platform: string;
    maxFollowers: number;
    minViews: number;
    category: string;
  }) => {
    setSearchQuery(preset.search);
    setPlatform(preset.platform);
    setMaxFollowers(preset.maxFollowers);
    setMinViews(preset.minViews);
    setCategory(preset.category);
  };

  // Add Creator to Custom Saved Folder
  const handleAddToCollectionInDB = async (collectionId: string, creatorId: string) => {
    try {
      const res = await fetch("/api/scout/collections/add-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId, creatorId })
      });
      if (res.ok) {
        fetchCollections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderPlatformBadge = (plat: string) => {
    const p = plat.toLowerCase();
    switch (p) {
      case "youtube":
        return <Youtube size={12} className="text-rose-500 shrink-0" />;
      case "instagram":
        return <Instagram size={12} className="text-pink-500 shrink-0" />;
      case "tiktok":
        return <Flame size={12} className="text-teal-400 shrink-0" />;
      default:
        return <Globe size={12} className="text-slate-400 shrink-0" />;
    }
  };

  return (
    <div
      className={`min-h-screen font-sans flex transition-colors duration-300 ${
        isDark ? "bg-[#050507] text-slate-300" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* 1. LEFT NAVIGATION SIDEBAR */}
      <aside
        id="sidebar"
        className={`w-64 border-r flex flex-col justify-between shrink-0 p-5 select-none print:hidden ${
          isDark ? "bg-[#0A0A0E] border-white/5" : "bg-white border-slate-200"
        }`}
      >
        <div className="space-y-8">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white animate-pulse" size={18} />
            </div>
            <div>
              <h1 className="text-base font-display font-black tracking-tight leading-none bg-gradient-to-r from-white via-indigo-200 to-teal-200 bg-clip-text text-transparent">
                ViralScout AI
              </h1>
              <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Intel Scout Engine</span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav id="nav-menu" className="space-y-1.5">
            <button
              id="nav-btn-terminal"
              onClick={() => setActiveTab("terminal")}
              className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                activeTab === "terminal"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <SlidersHorizontal size={15} />
                Scouting Terminal
              </span>
              <ChevronRight size={12} className="opacity-40" />
            </button>

            <button
              id="nav-btn-trends"
              onClick={() => setActiveTab("trends")}
              className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                activeTab === "trends"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <TrendingUp size={15} />
                Trends Discovery
              </span>
              <ChevronRight size={12} className="opacity-40" />
            </button>

            <button
              id="nav-btn-alerts"
              onClick={() => setActiveTab("alerts")}
              className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                activeTab === "alerts"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Bell size={15} />
                Smart Alerts
              </span>
              {alertCount > 0 ? (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500 text-slate-950 font-mono animate-pulse">
                  {alertCount}
                </span>
              ) : (
                <ChevronRight size={12} className="opacity-40" />
              )}
            </button>

            <button
              id="nav-btn-collections"
              onClick={() => setActiveTab("collections")}
              className={`w-full px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
                activeTab === "collections"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Folder size={15} />
                Saved Collections
              </span>
              <span className={`px-1.5 py-0.5 text-[9px] rounded ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                {collections.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Global Statistics Indicators & Theme Toggle */}
        <div className="space-y-6">
          <div className={`p-4 rounded-xl border ${isDark ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Scouting Statistics</span>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Indexed Platforms</span>
                <span className={`font-semibold font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>9 Global</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Fast-growth Creators</span>
                <span className={`font-semibold font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>{creators.length} Found</span>
              </div>
            </div>
          </div>

          {/* Theme Mode Button */}
          <button
            id="theme-toggle-btn"
            onClick={() => setIsDark(!isDark)}
            className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold border transition-all ${
              isDark
                ? "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
            }`}
          >
            {isDark ? (
              <>
                <Sun size={14} className="text-yellow-400" />
                Switch Light Theme
              </>
            ) : (
              <>
                <Moon size={14} className="text-indigo-400" />
                Switch Dark Theme
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Dynamic Inner Tab routing */}
        <section className="flex-1 p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
          {activeTab === "terminal" && (
            <div className="space-y-8 animate-fade-in">
              {/* Terminal Title Block */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight flex items-center gap-2">
                  <SlidersHorizontal className="text-indigo-400" />
                  Scouting Terminal
                </h1>
                <p className={`text-sm mt-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Discover and analyze emerging fast-growing creators across YouTube, TikTok, and Instagram before they enter mainstream audiences.
                </p>
              </div>

              {/* On-boarding intro card */}
              <div className="p-4 sm:p-5 rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/5 flex items-start gap-3">
                <Info className="text-indigo-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-slate-100 print:text-indigo-900">Discovering early outliers</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Unlike standard charts, ViralScout AI tracks <strong>micro-audience creators</strong> (under 50k subscribers) whose individual content views or engagement momentum are experiencing unusually fast multiplier curves. Search any keyword or refine filters below to scout live.
                  </p>
                </div>
              </div>

              {/* Advanced Filtering Panel */}
              <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1">
                  <Filter size={13} /> Scouting Filter Parameters
                </h3>

                {/* Filters grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Platform Channel</label>
                    <select
                      id="filter-platform"
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isDark ? "bg-white/5 border-white/10 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                      value={platform}
                      onChange={e => setPlatform(e.target.value)}
                    >
                      <option value="all">All platforms</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram</option>
                      <option value="twitch">Twitch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Niche Category</label>
                    <select
                      id="filter-category"
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isDark ? "bg-white/5 border-white/10 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      <option value="all">All niches</option>
                      <option value="technology">Technology</option>
                      <option value="productivity">Productivity</option>
                      <option value="education">Education</option>
                      <option value="finance & business">Finance & Business</option>
                      <option value="gaming">Gaming</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Max Followers Limit</label>
                    <input
                      id="filter-max-followers"
                      type="number"
                      step={5000}
                      className={`w-full text-xs px-3.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isDark ? "bg-white/5 border-white/10 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                      value={maxFollowers}
                      onChange={e => setMaxFollowers(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5">Min Avg Views</label>
                    <input
                      id="filter-min-views"
                      type="number"
                      step={10000}
                      className={`w-full text-xs px-3.5 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        isDark ? "bg-white/5 border-white/10 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                      value={minViews}
                      onChange={e => setMinViews(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Slider metrics row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 pt-4 border-t border-white/5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-[10px] font-mono uppercase text-slate-400">
                      <span>Min Engagement Threshold</span>
                      <span className="text-teal-400 font-bold">{minEngagement}%</span>
                    </div>
                    <input
                      id="filter-engagement-slider"
                      type="range"
                      min="1"
                      max="25"
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      value={minEngagement}
                      onChange={e => setMinEngagement(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-[10px] font-mono uppercase text-slate-400">
                      <span>Min Viral Score Floor</span>
                      <span className="text-amber-400 font-bold">{minViralScore}/100</span>
                    </div>
                    <input
                      id="filter-viral-score-slider"
                      type="range"
                      min="40"
                      max="95"
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      value={minViralScore}
                      onChange={e => setMinViralScore(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Keyword Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search by keyword, topic, language, hashtag, country (e.g. LLM, Spanish, deepseek)..."
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${
                      isDark ? "bg-white/5 border-white/10 text-slate-100" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                    }`}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  id="search-submit-btn"
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Query Engine
                </button>
              </form>

              {/* Quick Scouting prompt Suggestions */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Scout query presets</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    id="preset-btn-ai"
                    onClick={() => applyPresetQuery({ search: "AI", platform: "youtube", maxFollowers: 20000, minViews: 100000, category: "Technology" })}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors cursor-pointer"
                  >
                    🚀 AI channels under 20k subs with 100k+ views
                  </button>
                  <button
                    id="preset-btn-spanish"
                    onClick={() => applyPresetQuery({ search: "Spanish", platform: "instagram", maxFollowers: 10000, minViews: 50000, category: "education" })}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors cursor-pointer"
                  >
                    Reels: Emerging Spanish learning educators
                  </button>
                  <button
                    id="preset-btn-startup"
                    onClick={() => applyPresetQuery({ search: "SaaS", platform: "tiktok", maxFollowers: 30000, minViews: 80000, category: "finance & business" })}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors cursor-pointer"
                  >
                    TikTok Bootstrap solopreneurs review
                  </button>
                </div>
              </div>

              {/* Creators Results List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-400">Scouted Emerging List</span>
                  <button
                    id="refresh-creators-btn"
                    onClick={fetchCreators}
                    className="text-[11px] font-mono text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors"
                  >
                    <RefreshCw size={11} /> Force Scan Sync
                  </button>
                </div>

                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                    <Loader2 size={32} className="text-indigo-500 animate-spin" />
                    <span className="text-xs text-slate-400 font-mono">Running public API directory sync...</span>
                  </div>
                ) : creators.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl space-y-3">
                    <SlidersHorizontal size={24} className="text-slate-600 mx-auto" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300">No emergent creators match filters</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Try relaxing engagement or score sliders, resetting categories, or searching broader topics.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {creators.map(c => (
                      <div
                        key={c.id}
                        id={`creator-card-${c.id}`}
                        onClick={() => setSelectedCreator(c)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl group relative ${
                          isDark
                            ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-indigo-500/35"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-slate-100 shadow-sm"
                        }`}
                      >
                        {/* Upper Row: Identity & Platform */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.profileImage}
                              alt={c.name}
                              className="w-12 h-12 rounded-xl object-cover bg-white/5"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-sm sm:text-base font-display font-bold text-slate-100 group-hover:text-indigo-400 transition-colors truncate max-w-[150px]">
                                  {c.name}
                                </h3>
                                <span className="p-1 rounded bg-black/30 inline-flex">
                                  {renderPlatformBadge(c.platform)}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">
                                {c.category}
                              </span>
                            </div>
                          </div>

                          {/* Viral Score indicator ring */}
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono text-slate-500 uppercase block">Viral Score</span>
                            <span className="text-base font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                              {c.viralScore}
                            </span>
                          </div>
                        </div>

                        {/* Mid Row: Description snippet */}
                        <p className={`text-xs mt-3.5 line-clamp-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          {c.description}
                        </p>

                        {/* Lower Row: Analytics summary */}
                        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/5 text-xs text-center font-mono">
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase">Followers</span>
                            <span className="font-bold text-slate-200 mt-0.5 block">
                              {c.followers >= 1000 ? `${(c.followers / 1000).toFixed(1)}k` : c.followers}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase">Avg Views</span>
                            <span className="font-bold text-slate-200 mt-0.5 block">
                              {c.averageViews >= 1000000
                                ? `${(c.averageViews / 1000000).toFixed(1)}M`
                                : c.averageViews >= 1000
                                ? `${(c.averageViews / 1000).toFixed(0)}k`
                                : c.averageViews}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block uppercase">Engagement</span>
                            <span className="font-bold text-teal-400 mt-0.5 block">
                              {c.engagementRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RENDERING INNER MODULAR PAGE VIEWS */}
          {activeTab === "trends" && <TrendsPage isDark={isDark} />}
          {activeTab === "alerts" && <AlertsPage isDark={isDark} />}
          {activeTab === "collections" && (
            <CollectionsPage
              isDark={isDark}
              creators={creators}
              collections={collections}
              onRefreshCollections={fetchCollections}
              onOpenCreator={setSelectedCreator}
            />
          )}
        </section>
      </main>

      {/* 3. CORE ANALYTICS DEEP DIVE MODAL */}
      {selectedCreator && (
        <CreatorDetailModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
          isDark={isDark}
          collections={collections}
          onAddToCollection={handleAddToCollectionInDB}
        />
      )}
    </div>
  );
}
