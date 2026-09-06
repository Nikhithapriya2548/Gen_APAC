import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  RefreshCw,
  FileText,
  AlertCircle,
  Check,
  Tag,
  Smile,
  Lightbulb,
  CheckSquare,
  HelpCircle,
  Clock,
  PlusCircle,
} from "lucide-react";
import Markdown from "react-markdown";
import { User, db, doc, setDoc, updateDoc, collection, getDocs, query, orderBy } from "../lib/firebase";
import { JournalEntry, JournalMessage, ReflectionSummaryData } from "../types";
import { sanitizePayload } from "../lib/sanitizer";

interface ActiveJournalProps {
  user: User;
  activeJournal: JournalEntry | null;
  onJournalUpdated: (journal: JournalEntry) => void;
  onNewJournalRequested: () => void;
}

const QUICK_STARTERS = [
  "I'm feeling overwhelmed by competing priorities. How can I regain clarity?",
  "I accomplished something meaningful today, but I'm still feeling anxious.",
  "Help me brainstorm practical next steps for my new project.",
  "I want to reflect on a difficult conversation I had earlier today.",
];

export const ActiveJournal: React.FC<ActiveJournalProps> = ({
  user,
  activeJournal,
  onJournalUpdated,
  onNewJournalRequested,
}) => {
  const [messages, setMessages] = useState<JournalMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<ReflectionSummaryData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing messages whenever the activeJournal changes
  useEffect(() => {
    let isMounted = true;

    async function loadJournalMessages() {
      if (!activeJournal) {
        setMessages([]);
        setSummaryData(null);
        return;
      }

      try {
        setSaveStatus("saving");
        const messagesRef = collection(
          db,
          "users",
          user.uid,
          "journals",
          activeJournal.id,
          "messages"
        );
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        const snapshot = await getDocs(q);

        if (isMounted) {
          const loaded: JournalMessage[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as JournalMessage);
          });
          setMessages(loaded);

          if (activeJournal.summary) {
            setSummaryData({
              title: activeJournal.title,
              summary: activeJournal.summary || "",
              mood: activeJournal.mood || "Reflective",
              topics: activeJournal.topics || [],
              insights: activeJournal.insights || "",
              actionItems: activeJournal.actionItems || [],
              reflectionQuestion: activeJournal.reflectionQuestion || "",
            });
          } else {
            setSummaryData(null);
          }
          setSaveStatus("saved");
        }
      } catch (err: any) {
        console.error("Failed to load messages:", err);
        if (isMounted) {
          setSaveStatus("error");
          setErrorMessage("Failed to load previous messages from Firestore.");
        }
      }
    }

    loadJournalMessages();
    return () => {
      isMounted = false;
    };
  }, [activeJournal?.id, user.uid]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Handle message submission
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend ?? inputText).trim();
    if (!content || sending) return;

    if (content.length > 4000) {
      setErrorMessage("Message exceeds 4,000 characters limit. Please shorten your reflection.");
      return;
    }

    setErrorMessage(null);
    setSending(true);
    setSaveStatus("saving");

    let currentJournal = activeJournal;

    try {
      // 1. If no active journal, initialize one in Firestore first
      if (!currentJournal) {
        const newJournalId = `journal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const initialTitle = content.slice(0, 45) + (content.length > 45 ? "..." : "");
        const now = new Date().toISOString();

        const newEntry: JournalEntry = {
          id: newJournalId,
          userId: user.uid,
          title: initialTitle,
          createdAt: now,
          updatedAt: now,
        };

        const sanitizedEntry = sanitizePayload(newEntry);
        await setDoc(doc(db, "users", user.uid, "journals", newJournalId), sanitizedEntry);
        currentJournal = newEntry;
        onJournalUpdated(newEntry);
      }

      // 2. Persist User Message to Firestore
      const userMsgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const userMessage: JournalMessage = {
        id: userMsgId,
        journalId: currentJournal.id,
        userId: user.uid,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      await setDoc(
        doc(db, "users", user.uid, "journals", currentJournal.id, "messages", userMsgId),
        sanitizePayload(userMessage)
      );

      // Optimistically update local message state & clear input only after confirmed user message write
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputText("");

      // 3. Request multi-turn response from Gemini server route
      const conversationPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationPayload }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const geminiReply = data.reply || "Thank you for sharing your thoughts.";

      // 4. Persist Gemini Response to Firestore
      const geminiMsgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const geminiMessage: JournalMessage = {
        id: geminiMsgId,
        journalId: currentJournal.id,
        userId: user.uid,
        role: "model",
        content: geminiReply,
        timestamp: new Date().toISOString(),
      };

      await setDoc(
        doc(db, "users", user.uid, "journals", currentJournal.id, "messages", geminiMsgId),
        sanitizePayload(geminiMessage)
      );

      // 5. Update parent journal updatedAt timestamp
      await updateDoc(
        doc(db, "users", user.uid, "journals", currentJournal.id),
        sanitizePayload({
          updatedAt: new Date().toISOString(),
        })
      );

      setMessages([...updatedMessages, geminiMessage]);
      setSaveStatus("saved");
    } catch (err: any) {
      console.error("Message send/save error:", err);
      setSaveStatus("error");
      setErrorMessage(
        err.message || "Failed to process reflection or sync with Firestore. Your draft is preserved."
      );
      // Restore input text if not sent yet
      if (!textToSend && content) {
        setInputText(content);
      }
    } finally {
      setSending(false);
    }
  };

  // Generate structured summary & insights
  const handleGenerateSummary = async () => {
    if (!activeJournal || messages.length === 0 || summarizing) return;

    setSummarizing(true);
    setErrorMessage(null);
    setSaveStatus("saving");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate reflection summary");
      }

      const data = await res.json();
      const s: ReflectionSummaryData = data.summary;

      // Update Firestore journal document with AI summary and analysis
      const updatedJournalDoc: Partial<JournalEntry> = {
        title: s.title,
        summary: s.summary,
        mood: s.mood,
        topics: s.topics,
        insights: s.insights,
        actionItems: s.actionItems,
        reflectionQuestion: s.reflectionQuestion,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(
        doc(db, "users", user.uid, "journals", activeJournal.id),
        sanitizePayload(updatedJournalDoc)
      );

      const refreshedJournal: JournalEntry = {
        ...activeJournal,
        ...updatedJournalDoc,
      };

      setSummaryData(s);
      onJournalUpdated(refreshedJournal);
      setSaveStatus("saved");
    } catch (err: any) {
      console.error("Failed to generate summary:", err);
      setSaveStatus("error");
      setErrorMessage(err.message || "Failed to generate and save reflection summary.");
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-4 sm:px-6 py-4">
      {/* Session Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
              {activeJournal?.title || "New Reflection Session"}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-sky-400" />
                {activeJournal
                  ? new Date(activeJournal.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Draft"}
              </span>
              <span>•</span>
              <span className="text-sky-400/80 font-mono text-[11px]">Gemini 3.6 Flash</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Save Status */}
        <div className="flex items-center gap-2.5">
          {/* Save Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-900/90 border border-white/[0.08] text-slate-400 font-mono">
            {saveStatus === "saving" && (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                <span>Syncing Firestore...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-300">Saved to Firestore</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle className="w-3 h-3 text-red-400" />
                <span className="text-red-300">Sync Warning</span>
              </>
            )}
            {saveStatus === "idle" && <span>Ready</span>}
          </div>

          {/* Generate Summary Button */}
          {messages.length >= 2 && (
            <button
              id="btn-generate-summary"
              onClick={handleGenerateSummary}
              disabled={summarizing || sending}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              {summarizing ? "Analyzing..." : "Generate Summary"}
            </button>
          )}

          {/* New Session Button */}
          <button
            id="btn-new-session"
            onClick={onNewJournalRequested}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/[0.08] hover:border-sky-500/40 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
            New Entry
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => handleSendMessage()}
            className="px-2.5 py-1 rounded bg-red-900 hover:bg-red-800 text-red-100 font-medium text-xs transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">What's on your mind today?</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-md">
              Start writing freely. Gemini will listen without judgment, ask introspective questions, and help you unlock clarity.
            </p>

            {/* Quick Starters */}
            <div className="mt-6 w-full max-w-lg space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-left">
                Reflection Prompts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_STARTERS.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(starter)}
                    className="p-3 text-left text-xs bg-slate-900/80 hover:bg-slate-850 border border-slate-800/90 hover:border-sky-500/40 rounded-xl text-slate-300 hover:text-white transition-all group"
                  >
                    <span className="line-clamp-2">{starter}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "model" && (
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-sky-600 text-white rounded-tr-sm shadow-md"
                      : "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.role === "model" ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <span
                    className={`block text-[10px] mt-2 font-mono ${
                      msg.role === "user" ? "text-sky-200" : "text-slate-500"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {msg.role === "user" && user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-xl object-cover ring-1 ring-sky-500/40 shrink-0 mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            ))}

            {sending && (
              <div className="flex items-center gap-3 text-slate-400 text-xs py-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <span className="flex items-center gap-1.5 font-medium">
                  Gemini 3.6 Flash is reflecting...
                </span>
              </div>
            )}
          </>
        )}

        {/* Structured Summary Card if generated */}
        {summaryData && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-semibold text-white">
                  Journal Reflection Synthesis
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Smile className="w-3 h-3" />
                Mood: {summaryData.mood}
              </span>
            </div>

            {/* Summary text */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {summaryData.summary}
            </p>

            {/* Key Insights */}
            {summaryData.insights && (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-indigo-200">
                    Core Realization:
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5">{summaryData.insights}</p>
                </div>
              </div>
            )}

            {/* Action Items */}
            {summaryData.actionItems && summaryData.actionItems.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Practical Next Steps:
                </span>
                <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc">
                  {summaryData.actionItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reflection Question */}
            {summaryData.reflectionQuestion && (
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-900/40 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-sky-200">
                    Question to Contemplate:
                  </span>
                  <p className="text-xs text-sky-100/90 italic mt-0.5">
                    "{summaryData.reflectionQuestion}"
                  </p>
                </div>
              </div>
            )}

            {/* Topics chips */}
            {summaryData.topics && summaryData.topics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                <Tag className="w-3 h-3 text-slate-500" />
                {summaryData.topics.map((t, idx) => (
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-3 border-t border-white/[0.08] bg-transparent">
        <div className="relative rounded-2xl bg-[#090d16]/90 border border-white/[0.1] focus-within:border-sky-500/60 focus-within:shadow-[0_0_25px_-5px_rgba(56,189,248,0.25)] transition-all p-2.5">
          <textarea
            ref={textareaRef}
            id="journal-input-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Share your thoughts, feelings, or questions... (Press Enter to send, Shift+Enter for newline)"
            rows={3}
            disabled={sending}
            maxLength={4000}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none px-2 py-1 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] px-2 text-xs text-slate-500 font-mono">
            <span>
              {inputText.length}/4000 chars
            </span>

            <button
              id="btn-send-message"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || sending}
              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.35)] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
