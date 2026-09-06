import React, { useEffect, useState } from "react";
import {
  X,
  FileText,
  Smile,
  Tag,
  Lightbulb,
  CheckSquare,
  HelpCircle,
  Trash2,
  Calendar,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Markdown from "react-markdown";
import { User, db, collection, getDocs, query, orderBy } from "../lib/firebase";
import { JournalEntry, JournalMessage } from "../types";

interface JournalDetailModalProps {
  user: User;
  journal: JournalEntry | null;
  onClose: () => void;
  onDeleteJournal: (id: string) => Promise<void>;
  onResumeChat: (journal: JournalEntry) => void;
}

export const JournalDetailModal: React.FC<JournalDetailModalProps> = ({
  user,
  journal,
  onClose,
  onDeleteJournal,
  onResumeChat,
}) => {
  const [messages, setMessages] = useState<JournalMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!journal) return;

    let isMounted = true;
    async function fetchMessages() {
      if (!journal) return;
      setLoading(true);
      try {
        const messagesRef = collection(
          db,
          "users",
          user.uid,
          "journals",
          journal.id,
          "messages"
        );
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        const snapshot = await getDocs(q);
        if (isMounted) {
          const loaded: JournalMessage[] = [];
          snapshot.forEach((snap) => loaded.push(snap.data() as JournalMessage));
          setMessages(loaded);
        }
      } catch (err) {
        console.error("Error loading messages for detail view:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMessages();
    return () => {
      isMounted = false;
    };
  }, [journal?.id, user.uid]);

  if (!journal) return null;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this journal entry?")) {
      return;
    }
    setDeleting(true);
    try {
      await onDeleteJournal(journal.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-card rounded-3xl shadow-[0_0_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden my-8 border border-white/[0.12]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#06080e]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight line-clamp-1">
                {journal.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {new Date(journal.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {journal.mood && (
                  <>
                    <span>•</span>
                    <span className="text-sky-300 flex items-center gap-1 font-mono text-[11px]">
                      <Smile className="w-3 h-3 text-sky-400" />
                      {journal.mood}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Summary & Insights Box */}
          {journal.summary && (
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Reflection Synthesis
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {journal.summary}
              </p>

              {/* Key Insights */}
              {journal.insights && (
                <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-indigo-200">
                      Key Realization:
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">{journal.insights}</p>
                  </div>
                </div>
              )}

              {/* Action items */}
              {journal.actionItems && journal.actionItems.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1">
                    <CheckSquare className="w-3 h-3 text-emerald-400" />
                    Action Items:
                  </span>
                  <ul className="text-xs text-slate-300 list-disc pl-4 space-y-0.5">
                    {journal.actionItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reflection question */}
              {journal.reflectionQuestion && (
                <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-900/40 flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-sky-200">
                      Question to Ponder:
                    </span>
                    <p className="text-xs text-sky-100 italic mt-0.5">
                      "{journal.reflectionQuestion}"
                    </p>
                  </div>
                </div>
              )}

              {/* Topics */}
              {journal.topics && journal.topics.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
                  <Tag className="w-3 h-3 text-slate-500" />
                  {journal.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Multi-Turn Conversation Transcript */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              Full Conversation Transcript ({messages.length} turns)
            </h4>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Loading transcript...
              </div>
            ) : messages.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No messages found.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-sky-950/40 border border-sky-800/40 text-sky-100"
                        : "bg-slate-950 border border-slate-800/80 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-mono">
                      <span className="font-semibold text-slate-300">
                        {m.role === "user" ? "You" : "Gemini 3.6 Flash"}
                      </span>
                      <span>
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {m.role === "model" ? (
                      <div className="prose prose-invert prose-xs max-w-none">
                        <Markdown>{m.content}</Markdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#06080e]/90">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "Deleting..." : "Delete Journal"}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/[0.08] transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onResumeChat(journal);
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Resume in Active Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
