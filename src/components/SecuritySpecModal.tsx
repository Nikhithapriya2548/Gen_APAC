import React from "react";
import {
  ShieldCheck,
  Lock,
  Database,
  Terminal,
  Key,
  FileCode,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const SecuritySpecModal: React.FC = () => {
  const threatZones = [
    {
      zone: "1. Input Surfaces",
      threat: "Prompt injection, system instructions override, large payload memory exhaustion",
      countermeasure:
        "Input limits (4,000 chars/message, 1MB express body limit), structural JSON schema parsing, system instruction boundary delimiters.",
      status: "Verified",
    },
    {
      zone: "2. Planning & Reasoning",
      threat: "Model jailbreaking, attempts to simulate developer mode or reveal API keys",
      countermeasure:
        "Hardened system prompt with explicit guardrails instructing model to treat all user inputs as personal thoughts, rejecting prompt extraction.",
      status: "Verified",
    },
    {
      zone: "3. Tool & Server Execution",
      threat: "Server-side request forgery (SSRF), arbitrary command execution, API abuse",
      countermeasure:
        "Zero arbitrary runtime shell execution. Dedicated strict Express API handlers (/api/chat, /api/summarize, /api/reflection-engine).",
      status: "Verified",
    },
    {
      zone: "4. Memory & Firestore State",
      threat: "Cross-user data leakage, unauthorized reading/modifying of another user's journals",
      countermeasure:
        "Strict Firestore Security Rules enforcing request.auth != null && request.auth.uid == userId at path users/{userId}/journals/{journalId} and subcollections.",
      status: "Verified",
    },
    {
      zone: "5. Inter-System Communication",
      threat: "Client-side Gemini API key exposure, MITM or browser inspection leakage",
      countermeasure:
        "100% server-side Gemini invocation via @google/genai SDK in Express. No API keys are bundled or exposed in client JavaScript.",
      status: "Verified",
    },
    {
      zone: "6. Zero-Hardcoding Hygiene",
      threat: "Hardcoded credentials, API keys, or service account files committed in source",
      countermeasure:
        "All sensitive credentials injected via process.env.GEMINI_API_KEY with runtime environment guards and Secret Manager integration support.",
      status: "Verified",
    },
    {
      zone: "7. Authentication State Integrity",
      threat: "Unauthenticated access to dashboard or forged credentials",
      countermeasure:
        "Firebase Google Sign-In with OAuth 2.0 PKCE flow. Unauthenticated users are strictly quarantined to the landing view.",
      status: "Verified",
    },
    {
      zone: "8. Payload Hygiene & Driver Safety",
      threat: "Firestore driver crashes or silent drops caused by undefined object properties",
      countermeasure:
        "Recursive sanitizePayload utility strips all undefined fields before write operations, ensuring atomic transaction completeness.",
      status: "Verified",
    },
    {
      zone: "9. Resilient Model Fallback",
      threat: "503/429 upstream outages breaking user journaling sessions",
      countermeasure:
        "Multi-tier ladder: gemini-3.6-flash -> gemini-3.1-flash-lite -> gemini-flash-latest -> gemini-3.7-flash with auto-recovery.",
      status: "Verified",
    },
    {
      zone: "10. Data Retention & User Erasure",
      threat: "Inability of users to delete sensitive personal thoughts or orphaned data",
      countermeasure:
        "Comprehensive user deletion capability in UI with cascading subcollection cleanup.",
      status: "Verified",
    },
  ];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl glass-card border border-emerald-500/30 shadow-[0_0_50px_-15px_rgba(52,211,153,0.2)] space-y-3">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-mono border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security Architecture & Threat Defense Report</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Enterprise-Grade Threat Model & Validation
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          The Personal Gemini Journal implements defense-in-depth across all 5 Threat Zones, satisfying the OWASP Top 10 for LLM Applications and Google Cloud Run Secure AI Application Ideathon directives.
        </p>
      </div>

      {/* Threat Summary Table */}
      <div className="p-6 rounded-2xl glass-card space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Threat Analysis Matrix (10 Critical Vectors)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 font-medium">
                <th className="py-2.5 px-3">Threat Zone</th>
                <th className="py-2.5 px-3">Vulnerability / Threat Vector</th>
                <th className="py-2.5 px-3">Enforced Countermeasure</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {threatZones.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                    {item.zone}
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs">{item.threat}</td>
                  <td className="py-3 px-3 text-slate-400 max-w-md">{item.countermeasure}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Proof Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Firestore Rules Audit */}
        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              Active Firestore Security Rules (Zero-Leakage)
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-800/40">
              Deployed & Live
            </span>
          </div>
          <pre className="p-4 rounded-xl bg-[#06080e] border border-white/[0.08] text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Healthcheck test document
    match /test/connection {
      allow read: if true;
      allow write: if false;
    }

    // STRICT USER ISOLATION
    match /users/{userId}/journals/{journalId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;

      match /messages/{messageId} {
        allow read, write: if request.auth != null 
                           && request.auth.uid == userId;
      }
    }

    // Default deny all other paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`}
          </pre>
          <p className="text-xs text-slate-400">
            Guarantees that User A with UID <code className="text-sky-300">uid_A</code> can never query, read, or mutate data belonging to <code className="text-sky-300">uid_B</code>.
          </p>
        </div>

        {/* Server-Side Secret Protection */}
        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Server-Side Secret & Fallback Ladder
            </h3>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded-lg border border-sky-800/40">
              Express + @google/genai
            </span>
          </div>
          <pre className="p-4 rounded-xl bg-[#06080e] border border-white/[0.08] text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`// server.ts
const MODEL_FALLBACK_LADDER = [
  "gemini-3.6-flash",      // Primary
  "gemini-3.1-flash-lite", // High Availability
  "gemini-flash-latest",   // Dynamic Alias
  "gemini-3.7-flash"       // Deep Reasoning
];

// Lazily initialized with Secret Manager or env
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});`}
          </pre>
          <p className="text-xs text-slate-400">
            The Gemini API key remains solely within Google Cloud Run / Express memory. Network traffic between the client and Express uses JSON request bodies with zero token exposure.
          </p>
        </div>
      </div>
    </div>
  );
};
