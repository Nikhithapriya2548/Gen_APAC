import React, { useState } from "react";
import {
  TrendingUp,
  Brain,
  Sparkles,
  Calendar,
  AlertCircle,
  Lightbulb,
  Compass,
  Smile,
  Tag,
  HelpCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { JournalEntry, ReflectionAnalysis } from "../types";

interface ReflectionEngineDashboardProps {
  journals: JournalEntry[];
  onOpenJournal: (journal: JournalEntry) => void;
  onNewJournal: () => void;
}

export const ReflectionEngineDashboard: React.FC<ReflectionEngineDashboardProps> = ({
  journals,
  onOpenJournal,
  onNewJournal,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ReflectionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Trigger Gemini Reflection Engine over user's entries
  const handleRunAnalysis = async () => {
    if (journals.length === 0) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/reflection-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: journals }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to run Gemini Reflection Engine");
      }

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      console.error("Reflection Engine Error:", err);
      setError(err.message || "Unable to run longitudinal analysis. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Sort journals chronologically for the Personal Growth Timeline
  const sortedJournals = [...journals].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl glass-card border border-indigo-500/30 shadow-[0_0_50px_-15px_rgba(99,102,241,0.2)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-mono border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Original Feature · Gemini Longitudinal Synthesis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Gemini Reflection Engine & Growth Timeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Unlike static logs, the Reflection Engine analyzes cross-journal patterns over time to identify your recurring thoughts, emotional trajectories, personal breakthroughs, and constructive paths forward.
            </p>
          </div>

          <button
            id="btn-run-reflection-engine"
            onClick={handleRunAnalysis}
            disabled={analyzing || journals.length === 0}
            className="shrink-0 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 hover:from-indigo-400 hover:to-cyan-300 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-[0_0_25px_-3px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Synthesizing Journals...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 text-slate-950" />
                <span>Run Reflection Engine</span>
              </>
            )}
          </button>
        </div>

        {/* Security & Privacy guarantee */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Private Analysis: The engine evaluates exclusively your own authenticated journals in memory.
          </span>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State / Prompt to write */}
      {journals.length === 0 ? (
        <div className="py-16 text-center px-4 rounded-3xl bg-slate-900/40 border border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-white">No Journals Available for Analysis</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
            Write at least 1 or 2 journal reflections to unlock recurring theme discovery, emotional pattern tracking, and personal growth insights.
          </p>
          <button
            onClick={onNewJournal}
            className="mt-5 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Write Your First Journal
          </button>
        </div>
      ) : (
        <>
          {/* Analysis Results View */}
          {analysis && (
            <div className="space-y-6">
              {/* Growth Narrative Card */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-semibold text-white">Your Personal Growth Narrative</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {analysis.growthNarrative}
                </p>
              </div>

              {/* Recurring Themes & Mood Patterns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recurring Themes */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-sky-400" />
                    Recurring Themes
                  </h3>
                  <div className="space-y-3">
                    {analysis.recurringThemes.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-slate-200">{item.theme}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${
                              item.trend === "expanding"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : item.trend === "resolving"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            }`}
                          >
                            {item.trend}
                          </span>
                        </div>
                        <p className="text-slate-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mood Patterns */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Smile className="w-4 h-4 text-emerald-400" />
                    Mood Patterns & Emotional Distribution
                  </h3>
                  <div className="space-y-3">
                    {analysis.moodDistribution.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-slate-200">{item.mood}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.countOrPercent}
                          </span>
                        </div>
                        <p className="text-slate-400">{item.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Repeated Concerns & Breakthrough Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Repeated Concerns */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Persistent Concerns & Constructive Reframing
                  </h3>
                  <div className="space-y-3">
                    {analysis.repeatedConcerns.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1"
                      >
                        <span className="font-semibold text-amber-200 block">{item.concern}</span>
                        <p className="text-slate-400">{item.observation}</p>
                        <p className="text-sky-300 font-medium pt-1">
                          💡 Reframing: {item.constructiveReframing}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakthrough Insights */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-300" />
                    Breakthrough Insights
                  </h3>
                  <div className="space-y-3">
                    {analysis.breakthroughInsights.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1"
                      >
                        <span className="font-semibold text-slate-200">{item.title}</span>
                        <p className="text-slate-300 italic">"{item.insight}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggested Actions & Contemplation Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Suggested Action Plan */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-sky-400" />
                    Recommended Next Phase Actions
                  </h3>
                  <div className="space-y-2.5">
                    {analysis.suggestedActions.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sky-300">{item.action}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.timeframe}
                          </span>
                        </div>
                        <p className="text-slate-400">{item.whyItMatters}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth Contemplation Questions */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    Longitudinal Contemplation Questions
                  </h3>
                  <div className="space-y-2.5">
                    {analysis.personalReflectionQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/30 text-xs text-indigo-200 italic"
                      >
                        "{q}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Personal Growth Timeline */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-400" />
                  Personal Growth Timeline ({sortedJournals.length} Milestones)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Follow your path chronologically across each reflective milestone.
                </p>
              </div>

              {!analysis && (
                <button
                  onClick={handleRunAnalysis}
                  disabled={analyzing}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Brain className="w-3.5 h-3.5" />
                  Analyze Trends
                </button>
              )}
            </div>

            {/* Timeline nodes */}
            <div className="relative border-l-2 border-white/[0.08] ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6 py-2">
              {sortedJournals.map((journal, index) => (
                <div key={journal.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#06080e] border-2 border-sky-400 group-hover:scale-125 group-hover:shadow-[0_0_12px_rgba(56,189,248,0.8)] transition-all" />

                  {/* Timeline Card */}
                  <div
                    onClick={() => onOpenJournal(journal)}
                    className="p-4 sm:p-5 rounded-2xl glass-card glass-card-hover transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        {new Date(journal.createdAt).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      {journal.mood && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 text-sky-300 border border-sky-500/20">
                          <Smile className="w-3 h-3 text-sky-400" />
                          {journal.mood}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {journal.title}
                    </h4>

                    {journal.summary && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {journal.summary}
                      </p>
                    )}

                    {journal.insights && (
                      <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/30 text-xs text-indigo-200">
                        <strong className="text-indigo-300">Realization: </strong>
                        {journal.insights}
                      </div>
                    )}

                    {journal.topics && journal.topics.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {journal.topics.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 text-right">
                      <span className="text-sky-400 text-xs font-medium inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Open reflection
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
