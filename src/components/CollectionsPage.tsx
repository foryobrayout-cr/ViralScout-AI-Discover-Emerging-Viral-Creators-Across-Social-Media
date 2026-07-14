import React, { useState, useEffect } from "react";
import {
  Folder,
  Plus,
  Trash2,
  Bookmark,
  FileText,
  Download,
  Loader2,
  Tag,
  BookOpen,
  ArrowRightLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Scale
} from "lucide-react";
import { Collection, Creator } from "../types";

interface CollectionsPageProps {
  isDark: boolean;
  creators: Creator[];
  collections: Collection[];
  onRefreshCollections: () => void;
  onOpenCreator: (creator: Creator) => void;
}

export default function CollectionsPage({
  isDark,
  creators,
  collections,
  onRefreshCollections,
  onOpenCreator
}: CollectionsPageProps) {
  const [selectedColId, setSelectedColId] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Notes and Tags editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const [newTagInputId, setNewTagInputId] = useState<string | null>(null);
  const [tagText, setTagText] = useState("");

  // Comparative mode state
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (collections.length > 0 && !selectedColId) {
      setSelectedColId(collections[0].id);
    }
  }, [collections]);

  const activeCol = collections.find(c => c.id === selectedColId);
  const activeCreators = activeCol
    ? creators.filter(c => activeCol.creators.includes(c.id))
    : [];

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch("/api/scout/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName, description: newFolderDesc })
      });
      if (res.ok) {
        setNewFolderName("");
        setNewFolderDesc("");
        setCreatingFolder(false);
        onRefreshCollections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async (creatorId: string) => {
    if (!activeCol) return;
    try {
      const res = await fetch("/api/scout/collections/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: activeCol.id,
          creatorId,
          note: noteText
        })
      });
      if (res.ok) {
        setEditingNoteId(null);
        onRefreshCollections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTag = async (creatorId: string) => {
    if (!activeCol || !tagText.trim()) return;
    const currentTags = activeCol.tags[creatorId] || [];
    const updatedTags = [...new Set([...currentTags, tagText.trim()])];

    try {
      const res = await fetch("/api/scout/collections/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: activeCol.id,
          creatorId,
          tags: updatedTags
        })
      });
      if (res.ok) {
        setTagText("");
        setNewTagInputId(null);
        onRefreshCollections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveTag = async (creatorId: string, tagToRemove: string) => {
    if (!activeCol) return;
    const currentTags = activeCol.tags[creatorId] || [];
    const updatedTags = currentTags.filter(t => t !== tagToRemove);

    try {
      const res = await fetch("/api/scout/collections/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: activeCol.id,
          creatorId,
          tags: updatedTags
        })
      });
      if (res.ok) {
        onRefreshCollections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFromCollection = async (creatorId: string) => {
    if (!activeCol) return;
    try {
      const res = await fetch("/api/scout/collections/remove-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: activeCol.id,
          creatorId
        })
      });
      if (res.ok) {
        onRefreshCollections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle selection for side-by-side comparison matrix
  const handleToggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(prev => prev.filter(cId => cId !== id));
    } else {
      if (compareIds.length >= 4) {
        alert("Comparative matrix is optimized for up to 4 creators side-by-side.");
        return;
      }
      setCompareIds(prev => [...prev, id]);
    }
  };

  // Export collection list as CSV or JSON
  const exportCollectionCSV = () => {
    if (!activeCol) return;
    const rows = [
      ["Folder Name", activeCol.name],
      ["Folder Description", activeCol.description || ""],
      [],
      ["Creator Name", "Platform", "Viral Score", "Followers", "Avg Views", "Engagement Rate", "My Note", "My Tags"]
    ];

    activeCreators.forEach(c => {
      const note = activeCol.notes[c.id] || "";
      const tags = (activeCol.tags[c.id] || []).join("; ");
      rows.push([
        c.name,
        c.platform,
        String(c.viralScore),
        String(c.followers),
        String(c.averageViews),
        `${c.engagementRate}%`,
        note.replace(/"/g, '""'),
        tags
      ]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeCol.name.replace(/\s+/g, "_")}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight flex items-center gap-2">
            <Folder className="text-indigo-400" />
            Saved Collections
          </h1>
          <p className={`text-sm mt-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Group scouted creators, document custom notes, assign keyword tags, and benchmark performance metrics side-by-side.
          </p>
        </div>

        <button
          id="toggle-create-folder-btn"
          onClick={() => setCreatingFolder(!creatingFolder)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus size={14} />
          Create New Folder
        </button>
      </div>

      {/* Dynamic Creation Drawer */}
      {creatingFolder && (
        <div className={`p-5 rounded-2xl border ${isDark ? "bg-[#0A0A0E] border-white/5" : "bg-slate-50 border-slate-200"}`}>
          <h3 className="text-xs font-mono uppercase text-indigo-400 font-bold mb-4">New Folder Details</h3>
          <form onSubmit={handleCreateCollection} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              id="new-folder-name-input"
              type="text"
              placeholder="e.g. Healthcare Micro-creators"
              className={`px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                isDark ? "bg-white/5 border-white/10 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              required
            />
            <input
              id="new-folder-desc-input"
              type="text"
              placeholder="e.g. Under 50k subs with 200k+ viral videos"
              className={`px-3.5 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                isDark ? "bg-white/5 border-white/10 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}
              value={newFolderDesc}
              onChange={e => setNewFolderDesc(e.target.value)}
            />
            <div className="flex gap-2">
              <button id="submit-new-folder-btn" type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer">
                Create
              </button>
              <button type="button" onClick={() => setCreatingFolder(false)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navigation and Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Folders navigation sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">Scouting folders</span>
          {collections.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No folders available.</p>
          ) : (
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0">
              {collections.map(col => (
                <button
                  key={col.id}
                  id={`select-folder-btn-${col.id}`}
                  onClick={() => {
                    setSelectedColId(col.id);
                    setShowComparison(false);
                    setCompareIds([]);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shrink-0 transition-all ${
                    selectedColId === col.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : isDark
                      ? "bg-white/[0.02] text-slate-300 hover:bg-white/5 border border-white/5"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-100 shadow-sm"
                  }`}
                >
                  <span className="truncate mr-2 flex items-center gap-1.5">
                    <Folder size={14} />
                    {col.name}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    selectedColId === col.id ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-300"
                  }`}>
                    {col.creators.length}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content detail area */}
        <div className="lg:col-span-3 space-y-6">
          {activeCol ? (
            <div>
              {/* Folder Details header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6 border-white/5">
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-100 print:text-slate-900 flex items-center gap-1.5">
                    {activeCol.name}
                  </h2>
                  {activeCol.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeCol.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeCreators.length >= 2 && (
                    <button
                      id="compare-mode-toggle"
                      onClick={() => setShowComparison(!showComparison)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        showComparison
                          ? "bg-teal-600 text-white"
                          : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      <Scale size={14} />
                      {showComparison ? "View Saved Cards" : "Compare profiles"}
                    </button>
                  )}

                  <button
                    id="export-collection-csv"
                    disabled={activeCreators.length === 0}
                    onClick={exportCollectionCSV}
                    className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                      activeCreators.length === 0
                        ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                        : "bg-white/5 text-slate-200 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* EMPTY STATE */}
              {activeCreators.length === 0 && (
                <div className="py-20 text-center space-y-3">
                  <Bookmark className="text-slate-600 mx-auto" size={32} />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300">Folder is empty</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Scout creators in the dashboard and save them into this folder to start comparative analysis.
                    </p>
                  </div>
                </div>
              )}

              {/* MODE 1: COMPARATIVE BENCHMARKING MATRIX */}
              {showComparison ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-display font-semibold text-slate-200 flex items-center gap-1.5">
                      <Scale size={16} className="text-indigo-400" />
                      Creator Comparative Matrix
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">Benchmark side-by-side growth vector</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0A0A0E]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-black/40 border-b border-white/5 text-slate-400 font-mono">
                          <th className="p-4 font-medium">Metric</th>
                          {activeCreators.map(c => (
                            <th key={c.id} className="p-4 font-bold text-center border-l border-white/5 min-w-[150px]">
                              {c.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr>
                          <td className="p-4 font-semibold text-slate-400">Platform</td>
                          {activeCreators.map(c => (
                            <td key={c.id} className="p-4 text-center border-l border-white/5 font-mono capitalize">
                              {c.platform}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 font-semibold text-slate-400">Viral Score</td>
                          {activeCreators.map(c => (
                            <td key={c.id} className="p-4 text-center border-l border-white/5 font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                              {c.viralScore} / 100
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 font-semibold text-slate-400">Followers</td>
                          {activeCreators.map(c => (
                            <td key={c.id} className="p-4 text-center border-l border-white/5 font-mono font-semibold">
                              {c.followers.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 font-semibold text-slate-400">Avg Views</td>
                          {activeCreators.map(c => (
                            <td key={c.id} className="p-4 text-center border-l border-white/5 font-mono font-semibold text-indigo-400">
                              {c.averageViews.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 font-semibold text-slate-400">Engagement Rate</td>
                          {activeCreators.map(c => (
                            <td key={c.id} className="p-4 text-center border-l border-white/5 font-mono font-bold text-teal-400">
                              {c.engagementRate}%
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 font-semibold text-slate-400">Posting Frequency</td>
                          {activeCreators.map(c => (
                            <td key={c.id} className="p-4 text-center border-l border-white/5 text-slate-300">
                              {c.postingSchedule}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 font-semibold text-slate-400">Top Content Views</td>
                          {activeCreators.map(c => (
                            <td key={c.id} className="p-4 text-center border-l border-white/5 text-slate-300 font-mono">
                              {c.topPerformingContent[0] ? c.topPerformingContent[0].views.toLocaleString() : "N/A"}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 font-semibold text-slate-400">My Saved Notes</td>
                          {activeCreators.map(c => (
                            <td key={c.id} className="p-4 text-center border-l border-white/5 italic text-slate-400 text-[11px] max-w-[200px] break-words">
                              {activeCol.notes[c.id] || "No custom notes recorded."}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* MODE 2: SAVED CARDS WITH EDITABLE NOTES AND TAGS */
                <div className="grid grid-cols-1 gap-6 animate-fade-in">
                  {activeCreators.map(c => {
                    const savedNote = activeCol.notes[c.id] || "";
                    const savedTags = activeCol.tags[c.id] || [];

                    return (
                      <div
                        key={c.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          isDark ? "bg-[#0A0A0E] border-white/5" : "bg-white border-slate-100 shadow-sm"
                        }`}
                      >
                        {/* Upper card identity row */}
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={c.profileImage} alt={c.name} className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <h3
                                onClick={() => onOpenCreator(c)}
                                className="text-sm sm:text-base font-display font-bold text-slate-200 hover:text-indigo-400 transition-colors cursor-pointer"
                              >
                                {c.name}
                              </h3>
                              <p className="text-[11px] text-slate-400 font-mono uppercase mt-0.5">
                                {c.platform} • {c.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <span className="text-xs text-slate-400 block font-mono">Viral Score</span>
                              <span className="text-sm font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                                {c.viralScore} / 100
                              </span>
                            </div>

                            <button
                              id={`remove-saved-creator-${c.id}`}
                              onClick={() => handleRemoveFromCollection(c.id)}
                              className="text-slate-500 hover:text-rose-400 transition-all p-2 rounded-lg hover:bg-white/5"
                              title="Delete from Collection"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Middle section editable Notes block */}
                        <div className="mt-5 pt-4 border-t border-white/5">
                          <h4 className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1">
                            <BookOpen size={10} /> Research Annotation
                          </h4>

                          {editingNoteId === c.id ? (
                            <div className="space-y-2">
                              <textarea
                                id={`note-textarea-${c.id}`}
                                className={`w-full p-2.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                  isDark ? "bg-white/5 border-white/10 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                                }`}
                                rows={2}
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                placeholder="Annotate creator growth levers or communication objectives..."
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  id={`save-note-btn-${c.id}`}
                                  onClick={() => handleSaveNote(c.id)}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded"
                                >
                                  Save Note
                                </button>
                                <button
                                  onClick={() => setEditingNoteId(null)}
                                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingNoteId(c.id);
                                setNoteText(savedNote);
                              }}
                              className={`p-3 rounded-lg border border-dashed text-xs cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all ${
                                savedNote
                                  ? "bg-white/[0.01] border-white/10 text-slate-300 italic"
                                  : "border-white/5 text-slate-500"
                              }`}
                            >
                              {savedNote || "No custom annotations recorded. Click here to document collaboration angles, target topics, or monetization strategies..."}
                            </div>
                          )}
                        </div>

                        {/* Lower section custom tags manager */}
                        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1 mr-1">
                            <Tag size={10} /> Folder Tags:
                          </span>

                          <div className="flex flex-wrap gap-1.5">
                            {savedTags.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] pl-2 pr-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium flex items-center gap-1"
                              >
                                {t}
                                <button
                                  onClick={() => handleRemoveTag(c.id, t)}
                                  className="hover:text-rose-400 text-slate-500 font-bold ml-1 text-[9px]"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}

                            {newTagInputId === c.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  id={`tag-input-${c.id}`}
                                  type="text"
                                  placeholder="tag"
                                  className={`px-1.5 py-0.5 text-[10px] rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                    isDark ? "bg-white/5 border-white/10 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                                  }`}
                                  value={tagText}
                                  onChange={e => setTagText(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") handleAddTag(c.id);
                                  }}
                                  required
                                />
                                <button
                                  id={`submit-tag-btn-${c.id}`}
                                  onClick={() => handleAddTag(c.id)}
                                  className="text-[10px] text-teal-400 hover:text-teal-300 font-bold"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => setNewTagInputId(null)}
                                  className="text-[10px] text-slate-500 hover:text-slate-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                id={`open-tag-input-${c.id}`}
                                onClick={() => {
                                  setNewTagInputId(c.id);
                                  setTagText("");
                                }}
                                className="text-[9px] px-2 py-0.5 rounded border border-dashed border-white/10 hover:border-indigo-400/40 text-slate-400 hover:text-indigo-400 font-mono"
                              >
                                + Add custom tag
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center">
              <Loader2 className="animate-spin text-slate-600 mx-auto" size={24} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
