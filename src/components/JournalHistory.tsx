import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Calendar,
  Smile,
  Tag,
  Trash2,
  ArrowRight,
  Sparkles,
  PlusCircle,
  Eye,
} from "lucide-react";
import { JournalEntry } from "../types";

interface JournalHistoryProps {
  journals: JournalEntry[];
  loading: boolean;
  onOpenJournal: (journal: JournalEntry) => void;
  onViewDetail: (journal: JournalEntry) => void;
  onDeleteJournal: (journalId: string) => Promise<void>;
  onNewJournal: () => void;
}

export const JournalHistory: React.FC<JournalHistoryProps> = ({
  journals,
  loading,
  onOpenJournal,
  onViewDetail,
  onDeleteJournal,
  onNewJournal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract all distinct moods for filter
  const distinctMoods = Array.from(
    new Set(
      journals
        .map((j) => j.mood)
        .filter((m): m is string => Boolean(m && m.trim().length > 0))
    )
  );

  // Filter journals based on query and mood
  const filteredJournals = journals.filter((j) => {
    const matchesMood = selectedMood === "all" || j.mood === selectedMood;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      j.title.toLowerCase().includes(q) ||
      (j.summary && j.summary.toLowerCase().includes(q)) ||
      (j.topics && j.topics.some((t) => t.toLowerCase().includes(q)));
    return matchesMood && matchesSearch;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this journal entry?")) {
      return;
    }
    setDeletingId(id);
    try {
      await onDeleteJournal(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            Previous Journal Reflections
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Revisit your personal journey, reflections, and emotional evolution over time.
          </p>
        </div>

        <button
          onClick={onNewJournal}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_-3px_rgba(56,189,248,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          Start New Journal
        </button>
      </div>

      {/* Search & Mood Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search journals by title, topic, or keyword..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#090d16]/90 border border-white/[0.08] text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-500/50 focus:shadow-[0_0_15px_-3px_rgba(56,189,248,0.2)] transition-all"
          />
        </div>

        {distinctMoods.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedMood("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedMood === "all"
                  ? "bg-sky-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-white/[0.08]"
              }`}
            >
              All Moods
            </button>
            {distinctMoods.map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedMood === mood
                    ? "bg-sky-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-white/[0.08]"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Journals List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-sky-500/30 border-t-sky-500 animate-spin" />
          <span>Loading your private journals...</span>
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="py-20 text-center px-4 rounded-3xl glass-card">
          <div className="w-12 h-12 rounded-2xl bg-slate-850 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-white/[0.08]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No journal entries found</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mt-1">
            {searchQuery || selectedMood !== "all"
              ? "Try adjusting your search terms or mood filter."
              : "You haven't written any reflections yet. Start your first session now!"}
          </p>
          <button
            onClick={onNewJournal}
            className="mt-5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)]"
          >
            <Sparkles className="w-4 h-4" />
            Write First Reflection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJournals.map((journal) => (
            <div
              key={journal.id}
              onClick={() => onOpenJournal(journal)}
              className="group relative flex flex-col justify-between p-5 rounded-2xl glass-card glass-card-hover transition-all cursor-pointer"
            >
              <div>
                {/* Header: Date & Mood */}
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2.5">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(journal.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {journal.mood && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-900 text-sky-300 border border-sky-500/20">
                      <Smile className="w-3 h-3 text-sky-400" />
                      {journal.mood}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                  {journal.title}
                </h3>

                {/* Summary or Preview */}
                <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {journal.summary || "Conversation active. Click to resume or review insights."}
                </p>

                {/* Topics */}
                {journal.topics && journal.topics.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mt-3">
                    {journal.topics.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-white/[0.06]"
                      >
                        #{topic}
                      </span>
                    ))}
                    {journal.topics.length > 3 && (
                      <span className="text-[10px] text-slate-500">
                        +{journal.topics.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.06] text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetail(journal);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/[0.06] text-xs flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3 h-3 text-sky-400" />
                    Details
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, journal.id)}
                    disabled={deletingId === journal.id}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                    title="Delete journal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-sky-400 flex items-center gap-1 text-[11px] font-semibold group-hover:translate-x-0.5 transition-transform">
                  Resume
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
