import React, { useState, useEffect } from "react";
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Flame,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Check,
  Zap,
  Loader2
} from "lucide-react";
import { SmartAlert, AlertLog } from "../types";

interface AlertsPageProps {
  isDark: boolean;
}

export default function AlertsPage({ isDark }: AlertsPageProps) {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [logs, setLogs] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [alertName, setAlertName] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [minViews, setMinViews] = useState("");
  const [maxSubs, setMaxSubs] = useState("");
  const [keyword, setKeyword] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Local notification modal
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const fetchAlertsData = async () => {
    try {
      const res = await fetch("/api/scout/alerts");
      if (!res.ok) throw new Error("Could not fetch alerts.");
      const data = await res.json();
      setAlerts(data.alerts);
      setLogs(data.logs);
    } catch (err: any) {
      setError(err.message || "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertName.trim()) return;

    try {
      const criteria: any = {};
      if (minViews) criteria.minViews = Number(minViews);
      if (maxSubs) criteria.maxSubscribers = Number(maxSubs);
      if (keyword) criteria.keyword = keyword;

      const res = await fetch("/api/scout/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: alertName,
          platform,
          criteria
        })
      });

      if (res.ok) {
        setAlertName("");
        setMinViews("");
        setMaxSubs("");
        setKeyword("");
        setFormSuccess(true);
        setTimeout(() => setFormSuccess(false), 2500);
        await fetchAlertsData();
      }
    } catch (err) {
      console.error("Error creating alert", err);
    }
  };

  const handleToggleAlert = async (alertId: string) => {
    try {
      const res = await fetch("/api/scout/alerts/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId })
      });
      if (res.ok) {
        await fetchAlertsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/scout/alerts/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchAlertsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearUnread = async () => {
    try {
      const res = await fetch("/api/scout/alerts/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        await fetchAlertsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Tactile "Simulate Viral Event" function
  const triggerSimulation = () => {
    // Select a random active alert, if any, otherwise default
    const activeAlerts = alerts.filter(a => a.isActive);
    const targetAlert = activeAlerts.length > 0 ? activeAlerts[Math.floor(Math.random() * activeAlerts.length)] : null;

    let eventMsg = "A channel under 10k subscribers got over 1M views.";
    let simulatedCreator = "ByteQuantum AI";
    let simulatedId = `gen-${Date.now()}`;

    if (targetAlert) {
      const kw = targetAlert.criteria.keyword || "AI Automation";
      simulatedCreator = `${kw.charAt(0).toUpperCase() + kw.slice(1)} Lab`;
      eventMsg = `Video matching trigger '${targetAlert.name}' crossed ${targetAlert.criteria.minViews || "250K"} views with low followers!`;
    }

    const newLog: AlertLog = {
      id: `sim-log-${Date.now()}`,
      alertId: targetAlert?.id || "manual-alert",
      alertName: targetAlert?.name || "Global Velocity Trigger",
      creatorId: simulatedId,
      creatorName: simulatedCreator,
      platform: targetAlert?.platform || "youtube",
      triggerMessage: `${eventMsg} Creator '${simulatedCreator}' is growing rapidly.`,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    // Prepend log local-only
    setLogs(prev => [newLog, ...prev]);

    // Show a visual overlay notification banner
    setActiveNotification(newLog.triggerMessage);
    setTimeout(() => {
      setActiveNotification(null);
    }, 5000);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 size={36} className="text-indigo-500 animate-spin" />
        <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">Loading Alerts...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Toast simulated banner notification */}
      {activeNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 max-w-sm rounded-xl border border-teal-500 bg-[#0A0A0E] shadow-2xl text-slate-100 flex gap-3 animate-bounce">
          <Zap className="text-amber-400 shrink-0 mt-0.5 animate-pulse" size={18} />
          <div>
            <span className="text-xs font-mono text-teal-400 uppercase tracking-wider font-bold block">Live Viral Alert</span>
            <p className="text-xs font-medium mt-1 leading-relaxed">{activeNotification}</p>
          </div>
          <button onClick={() => setActiveNotification(null)} className="text-slate-400 hover:text-slate-200 self-start ml-2 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Title */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight flex items-center gap-2">
            <Bell className="text-indigo-400" />
            Smart Alerts Configuration
          </h1>
          <p className={`text-sm mt-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Configure automated notifications targeting creators with exploding view velocity but small baseline follower metrics.
          </p>
        </div>

        {/* Simulate Event tool */}
        <button
          id="simulate-viral-btn"
          onClick={triggerSimulation}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
        >
          <Zap size={14} />
          Simulate Live Viral Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creating Alerts Form */}
        <div className={`p-6 rounded-2xl border h-fit ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          <h3 className="text-sm font-display font-semibold mb-5 text-indigo-400 flex items-center gap-1.5">
            <Plus size={16} /> Add Smart Alert
          </h3>

          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Alert Name</label>
              <input
                id="alert-name-input"
                type="text"
                placeholder="e.g. AI Channels going viral"
                className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark ? "bg-white/5 border-white/10 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
                value={alertName}
                onChange={e => setAlertName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Platform</label>
                <select
                  id="alert-platform-select"
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark ? "bg-white/5 border-white/10 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                  value={platform}
                  onChange={e => setPlatform(e.target.value)}
                >
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitch">Twitch</option>
                  <option value="x">X / Twitter</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Keyword Match</label>
                <input
                  id="alert-keyword-input"
                  type="text"
                  placeholder="e.g. AI, Spanish"
                  className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark ? "bg-white/5 border-white/10 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Min Views Threshold</label>
                <input
                  id="alert-min-views-input"
                  type="number"
                  placeholder="e.g. 500000"
                  className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark ? "bg-white/5 border-white/10 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  value={minViews}
                  onChange={e => setMinViews(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Max Subscribers Limit</label>
                <input
                  id="alert-max-subs-input"
                  type="number"
                  placeholder="e.g. 20000"
                  className={`w-full px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark ? "bg-white/5 border-white/10 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  value={maxSubs}
                  onChange={e => setMaxSubs(e.target.value)}
                />
              </div>
            </div>

            <button
              id="submit-alert-btn"
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Activate Smart Agent
            </button>

            {formSuccess && (
              <span className="text-emerald-400 text-xs font-mono text-center block animate-pulse mt-2">
                ✓ Smart Alert Created & Activated
              </span>
            )}
          </form>
        </div>

        {/* Existing Alerts & Alert Logs Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active alerts List */}
          <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
            <h3 className="text-xs font-mono uppercase text-slate-400 mb-4 tracking-wider">Active Monitoring Pipelines</h3>
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No active monitors configured. Set parameters on the left.</p>
            ) : (
              <div className="space-y-3">
                {alerts.map(al => (
                  <div key={al.id} className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 ${isDark ? "bg-white/[0.01] border-white/5 hover:border-indigo-500/20" : "bg-slate-50 border-slate-100"}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <h4 className="text-sm font-semibold text-slate-200">{al.name}</h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${isDark ? "bg-white/5 text-slate-400" : "bg-slate-200 text-slate-600"}`}>
                          {al.platform}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Criteria: {al.criteria.keyword ? `Keyword: "${al.criteria.keyword}"` : ""}
                        {al.criteria.minViews ? ` • Min Views: ${al.criteria.minViews.toLocaleString()}` : ""}
                        {al.criteria.maxSubscribers ? ` • Max Subs: <${al.criteria.maxSubscribers.toLocaleString()}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button id={`toggle-alert-btn-${al.id}`} onClick={() => handleToggleAlert(al.id)} className="text-slate-400 hover:text-indigo-400 transition-all">
                        {al.isActive ? (
                          <ToggleRight size={22} className="text-emerald-400" />
                        ) : (
                          <ToggleLeft size={22} className="text-slate-500" />
                        )}
                      </button>
                      <button id={`delete-alert-btn-${al.id}`} onClick={() => handleDeleteAlert(al.id)} className="text-slate-400 hover:text-rose-400 transition-all p-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trigger Alert Events Log Feed */}
          <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Live Event Scouting Feed</h3>
              {logs.some(l => !l.isRead) && (
                <button
                  id="mark-all-read-btn"
                  onClick={handleClearUnread}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 font-bold"
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-8 text-center">No alert log triggers recorded yet.</p>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {logs.map((log, i) => (
                  <div key={log.id} className={`p-3.5 rounded-xl border flex gap-3 transition-all ${
                    !log.isRead
                      ? "bg-white/5 border-indigo-500/20 shadow-sm"
                      : "bg-white/[0.01] border-white/5 opacity-75"
                  }`}>
                    <Bell className={`shrink-0 mt-0.5 ${!log.isRead ? "text-amber-400" : "text-slate-500"}`} size={16} />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-xs font-bold text-slate-200 font-display truncate">{log.alertName}</span>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                          <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"} leading-relaxed`}>
                        {log.triggerMessage}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-500 pt-1">
                        <span>Platform: {log.platform}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-bold">{log.creatorName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
