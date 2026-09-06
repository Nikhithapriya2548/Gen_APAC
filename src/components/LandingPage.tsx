import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Shield,
  Lock,
  Brain,
  TrendingUp,
  CheckCircle,
  Database,
  ArrowRight,
  AlertCircle,
  Eye,
  MessageSquare,
  Compass,
  Layers,
  ChevronRight,
  Zap,
} from "lucide-react";
import { signInWithPopup, auth, googleProvider } from "../lib/firebase";

export const LandingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<"chat" | "reflection">("chat");
  const [selectedDemoPrompt, setSelectedDemoPrompt] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 30 });
  const showcaseRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for ambient lighting effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Sign-in failed:", err);
      setError(err?.message || "Sign in could not be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToDemo = () => {
    showcaseRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const DEMO_PROMPTS = [
    {
      title: "Overcoming Overwhelm",
      userMsg: "I feel pulled in five different directions with work and personal projects. How can I regain clarity and calm?",
      geminiMsg: "It sounds like you're holding all these responsibilities at once without giving your mind permission to pause. Let's ground this: what is the **single task** that, if finished today, would bring the greatest relief?",
      tags: ["Focus", "Mental Clarity"],
      sentiment: "Reassurance & Grounding",
    },
    {
      title: "Processing Difficult Conversations",
      userMsg: "I had a tense meeting with my collaborator today and felt misunderstood. I can't stop replaying it.",
      geminiMsg: "Replaying tense moments is natural—it's how the brain tries to solve social friction. What was the core message you wished they had heard? Distilling that intent can help you decide whether a brief clarification is needed.",
      tags: ["Communication", "Empathy"],
      sentiment: "Reflection & De-escalation",
    },
    {
      title: "Sparking Creative Momentum",
      userMsg: "I'm starting a new initiative, but perfectionism is keeping me from publishing the first prototype.",
      geminiMsg: "Perfectionism is often fear disguised as high standards. What would a 'version 0.1' look like that is deliberately unfinished, but ready for one trusted person to try?",
      tags: ["Action", "Growth Mindset"],
      sentiment: "Empowering",
    },
  ];

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-between selection:bg-sky-500/30 relative overflow-x-hidden">
      {/* Dynamic Ambient Background Lighting */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000 z-0"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}% ${mousePos.y}%, rgba(56, 189, 248, 0.09), rgba(99, 102, 241, 0.05) 40%, transparent 80%)`,
        }}
      />

      {/* Top Ambient Light Halo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[380px] bg-gradient-to-b from-sky-500/15 via-indigo-500/05 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Subtle Dot Matrix Overlay */}
      <div className="absolute inset-0 bg-grid-dots opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Top Floating Glass Navbar */}
      <nav className="border-b border-white/[0.08] bg-[#06080e]/80 backdrop-blur-xl sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-cyan-400 p-0.5 shadow-[0_0_15px_-3px_rgba(56,189,248,0.3)]">
              <div className="w-full h-full bg-[#06080e] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                Personal Gemini Journal
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Ideathon Edition
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Cross-User Data Leakage</span>
            </div>
            <button
              id="btn-nav-signin"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="text-xs sm:text-sm font-medium px-4 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-semibold transition-all shadow-[0_0_20px_-3px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 flex-1 flex flex-col items-center justify-center text-center relative z-10">
        {/* Ideathon Badge with Pulse Beacon */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-sky-500/30 text-slate-200 text-xs font-medium mb-8 shadow-[0_0_20px_-5px_rgba(56,189,248,0.3)] backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span>Google AI Studio Secure AI Application Ideathon</span>
          <span className="text-slate-500">·</span>
          <span className="text-sky-400 font-mono">Gemini 3.6 Flash</span>
        </div>

        {/* Display Typography with High Contrast Gradient */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.12]">
          Your Private Sanctuary for{" "}
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.25)]">
            Deep Reflection & Growth
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
          Engage in multi-turn introspective dialogue powered by{" "}
          <strong className="text-white font-medium">Gemini 3.6 Flash</strong>.
          Every thought, message, and synthesized pattern is cryptographically and logically isolated to your authenticated account in Cloud Firestore.
        </p>

        {/* Error notification if any */}
        {error && (
          <div className="mt-6 max-w-md w-full bg-red-950/60 border border-red-800 text-red-300 px-4 py-3 rounded-xl text-sm flex items-start gap-2.5 text-left backdrop-blur-md">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-200">Sign-in notification</p>
              <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Primary Call to Action Button with Luminous Glow Ring */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
          <div className="relative group w-full sm:w-auto">
            {/* Blurred ambient glow ring */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-cyan-400 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-500 group-hover:duration-200" />
            
            <button
              id="btn-hero-google-signin"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="relative w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-base flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60"
            >
              {/* Google Vector Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.96 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{loading ? "Connecting to Google..." : "Sign in with Google"}</span>
              <ArrowRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>

          <button
            onClick={scrollToDemo}
            className="w-full sm:w-auto px-6 py-4 rounded-xl glass-card text-slate-300 hover:text-white hover:border-sky-500/40 font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-sky-400" />
            <span>Interactive App Showcase</span>
          </button>
        </div>

        {/* Trust Badges with Illuminated Accents */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-2 bg-slate-900/60 border border-white/[0.05] px-3 py-1.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
            No Passwords Stored
          </span>
          <span className="flex items-center gap-2 bg-slate-900/60 border border-white/[0.05] px-3 py-1.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
            Strict Firestore ABAC Rules
          </span>
          <span className="flex items-center gap-2 bg-slate-900/60 border border-white/[0.05] px-3 py-1.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
            Server-Only Gemini API Key
          </span>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE SAAS SHOWCASE WINDOW (Stripe / RedSun Video Lighting Feature) */}
        {/* ========================================================================= */}
        <div ref={showcaseRef} className="mt-16 w-full max-w-5xl text-left">
          <div className="relative group">
            {/* Ambient Backlight under the App Window */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 via-indigo-500/15 to-cyan-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-700 pointer-events-none" />

            {/* SaaS Window Shell */}
            <div className="relative glass-card rounded-2xl sm:rounded-3xl border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden light-sweep-container">
              {/* Window Header Bar */}
              <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#090d16]/90 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-400/40" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400/40" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400/40" />
                  </div>
                  <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                    journal.internal · user-isolated-session
                  </span>
                </div>

                {/* Showcase Interactive Mode Selector */}
                <div className="flex items-center gap-1.5 bg-[#06080e]/90 p-1 rounded-xl border border-white/[0.08]">
                  <button
                    onClick={() => setActivePreviewTab("chat")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                      activePreviewTab === "chat"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Gemini Introspection</span>
                  </button>
                  <button
                    onClick={() => setActivePreviewTab("reflection")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                      activePreviewTab === "reflection"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Reflection Engine</span>
                  </button>
                </div>
              </div>

              {/* Window Body */}
              <div className="p-6 sm:p-8 bg-[#070a12]/95 min-h-[420px] flex flex-col justify-between">
                {activePreviewTab === "chat" ? (
                  <div>
                    {/* Demo Prompt Selector Chips */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-sky-400" />
                          Interactive Scenario Preview:
                        </span>
                        <span className="text-[11px] text-sky-400 font-mono">
                          Click to test introspective flow
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {DEMO_PROMPTS.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedDemoPrompt(idx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              selectedDemoPrompt === idx
                                ? "bg-sky-500 text-slate-950 font-semibold shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                                : "bg-slate-900/90 text-slate-300 border border-white/[0.08] hover:border-sky-500/40"
                            }`}
                          >
                            {p.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat Bubble Thread */}
                    <div className="space-y-4">
                      {/* User Message */}
                      <div className="flex items-start gap-3 justify-end">
                        <div className="max-w-xl bg-sky-950/40 border border-sky-500/30 p-4 rounded-2xl rounded-tr-sm text-slate-100 text-sm leading-relaxed shadow-sm">
                          <p>{DEMO_PROMPTS[selectedDemoPrompt].userMsg}</p>
                          <span className="block mt-1.5 text-[11px] text-sky-400/80 font-mono">
                            Authenticated User · Just now
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/[0.1] flex items-center justify-center text-xs font-bold text-sky-400 shrink-0">
                          You
                        </div>
                      </div>

                      {/* Gemini Assistant Message */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 p-0.5 shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                          <div className="w-full h-full bg-[#06080e] rounded-[10px] flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-sky-400" />
                          </div>
                        </div>
                        <div className="max-w-2xl bg-slate-900/80 border border-white/[0.1] p-5 rounded-2xl rounded-tl-sm text-slate-200 text-sm leading-relaxed shadow-md">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.06]">
                            <span className="text-xs font-semibold text-white">Gemini 3.6 Flash</span>
                            <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 font-mono">
                              Sentiment: {DEMO_PROMPTS[selectedDemoPrompt].sentiment}
                            </span>
                          </div>
                          <p className="text-slate-200">{DEMO_PROMPTS[selectedDemoPrompt].geminiMsg}</p>
                          <div className="mt-3 flex items-center gap-2">
                            {DEMO_PROMPTS[selectedDemoPrompt].tags.map((t, i) => (
                              <span
                                key={i}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-white/[0.06]"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Reflection Engine Preview */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-400" />
                          Longitudinal Synthesis Across Journal History
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Autonomous pattern discovery generated by server-side Gemini 3.6 Flash
                        </p>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        3 Recurring Themes Found
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08]">
                        <div className="text-xs font-semibold text-sky-300 flex items-center gap-1.5 mb-1">
                          <Layers className="w-3.5 h-3.5 text-sky-400" />
                          Theme: Creative Focus
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Consistently transitions from initial anxiety to productive clarity once small execution steps are defined.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08]">
                        <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                          Emotional Trajectory
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Progressive increase in emotional resilience and self-compassion across multi-turn entries.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.08]">
                        <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
                          <Compass className="w-3.5 h-3.5 text-emerald-400" />
                          Recommended Action
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Dedicate the first 30 minutes of morning work to single-focus prototyping before checking email.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between">
                      <span className="text-xs text-slate-300">
                        Ready to see your personal growth timeline synthesized?
                      </span>
                      <button
                        onClick={handleGoogleSignIn}
                        className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                      >
                        Start Your Journal <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Window Footer Status */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Server-Side Gemini API Proxy · Key Secured</span>
                  </div>
                  <button
                    onClick={handleGoogleSignIn}
                    className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 text-xs"
                  >
                    Authenticate to save private sessions <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid with Spotlight Hover Effects */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-5xl">
          {/* Feature 1 */}
          <div className="p-7 rounded-2xl glass-card glass-card-hover group">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Turn Gemini Dialogue</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Explore your thoughts through deep conversational journaling powered by <strong className="text-slate-200">Gemini 3.6 Flash</strong>. Deconstruct complex dilemmas, brainstorm next steps, and receive empathetic reflection prompts.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-7 rounded-2xl glass-card glass-card-hover group">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Gemini Reflection Engine</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Synthesizes recurring themes, emotional arcs, and creative blocks across your personal entry history, mapping your development on a visual <strong className="text-slate-200">Growth Timeline</strong>.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-7 rounded-2xl glass-card glass-card-hover group">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Zero Cross-User Leakage</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Data isolation mathematically enforced by Cloud Firestore Security Rules (<code className="text-xs text-emerald-300 font-mono">users/$&#123;uid&#125;/journals</code>). User A can never inspect or modify User B&apos;s thoughts.
            </p>
          </div>
        </div>

        {/* Security Architecture Callout */}
        <div className="mt-14 w-full max-w-5xl p-7 rounded-2xl glass-card border border-white/[0.08] text-left flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-white/[0.1] flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white">
                Production-Grade Threat Model & Secret Isolation
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                The Gemini API key is never exposed to the client or browser bundle. All AI inferences execute on Google AI Studio&apos;s server-side container behind an Express proxy with strict payload sanitization and prompt injection defenses.
              </p>
            </div>
          </div>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="shrink-0 px-5 py-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold border border-sky-500/40 transition-all shadow-[0_0_20px_-3px_rgba(56,189,248,0.25)]"
          >
            Authenticate with Google
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-slate-500 bg-[#06080e]/90 relative z-10">
        <p>
          Built for the Google AI Studio Secure AI Application Ideathon · Powered by Gemini 3.6 Flash & Cloud Firestore
        </p>
      </footer>
    </div>
  );
};
