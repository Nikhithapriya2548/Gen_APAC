import { useState, useEffect } from "react";
import {
  auth,
  onAuthStateChanged,
  User,
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  getDocs,
} from "./lib/firebase";
import { JournalEntry, ViewTab } from "./types";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { ActiveJournal } from "./components/ActiveJournal";
import { JournalHistory } from "./components/JournalHistory";
import { ReflectionEngineDashboard } from "./components/ReflectionEngineDashboard";
import { SecuritySpecModal } from "./components/SecuritySpecModal";
import { JournalDetailModal } from "./components/JournalDetailModal";
import { Sparkles } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [activeJournal, setActiveJournal] = useState<JournalEntry | null>(null);
  const [currentTab, setCurrentTab] = useState<ViewTab>("active");
  const [selectedJournalForDetail, setSelectedJournalForDetail] = useState<JournalEntry | null>(null);
  const [loadingJournals, setLoadingJournals] = useState(true);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
      if (!user) {
        setJournals([]);
        setActiveJournal(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to User's Journals in Firestore
  useEffect(() => {
    if (!currentUser) {
      setJournals([]);
      setLoadingJournals(false);
      return;
    }

    setLoadingJournals(true);
    const journalsRef = collection(db, "users", currentUser.uid, "journals");
    const q = query(journalsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: JournalEntry[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as JournalEntry);
        });
        setJournals(loaded);
        setLoadingJournals(false);

        // Keep activeJournal in sync if its contents updated
        if (activeJournal) {
          const fresh = loaded.find((j) => j.id === activeJournal.id);
          if (fresh) {
            setActiveJournal(fresh);
          }
        }
      },
      (error) => {
        console.error("Error listening to journals:", error);
        setLoadingJournals(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Handler: Delete Journal & all subcollection messages
  const handleDeleteJournal = async (journalId: string) => {
    if (!currentUser) return;
    try {
      // 1. Delete messages subcollection
      const messagesRef = collection(
        db,
        "users",
        currentUser.uid,
        "journals",
        journalId,
        "messages"
      );
      const msgSnapshots = await getDocs(messagesRef);
      const deletePromises = msgSnapshots.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // 2. Delete parent journal document
      await deleteDoc(doc(db, "users", currentUser.uid, "journals", journalId));

      // 3. Clear activeJournal if it was the deleted one
      if (activeJournal?.id === journalId) {
        setActiveJournal(null);
      }
      if (selectedJournalForDetail?.id === journalId) {
        setSelectedJournalForDetail(null);
      }
    } catch (err) {
      console.error("Failed to delete journal:", err);
      alert("Failed to delete journal. Please try again.");
    }
  };

  // Handler: Open journal in active chat view
  const handleOpenJournal = (journal: JournalEntry) => {
    setActiveJournal(journal);
    setCurrentTab("active");
  };

  // Handler: Start new journal
  const handleNewJournalRequested = () => {
    setActiveJournal(null);
    setCurrentTab("active");
  };

  // Handler: When journal is created or updated
  const handleJournalUpdated = (updated: JournalEntry) => {
    setActiveJournal(updated);
  };

  // Auth Loading Splash
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#06080e] flex flex-col items-center justify-center text-slate-400 gap-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 animate-pulse shadow-[0_0_25px_rgba(56,189,248,0.25)]">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-300">Securing session...</p>
      </div>
    );
  }

  // If unauthenticated: Strictly quarantine to Landing Page
  if (!currentUser) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col selection:bg-sky-500/30 relative">
      {/* Ambient background lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-b from-sky-500/10 via-indigo-500/05 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-grid-dots opacity-30 pointer-events-none -z-10" />

      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        journalsCount={journals.length}
      />

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col relative z-10">
        {currentTab === "active" && (
          <ActiveJournal
            user={currentUser}
            activeJournal={activeJournal}
            onJournalUpdated={handleJournalUpdated}
            onNewJournalRequested={handleNewJournalRequested}
          />
        )}

        {currentTab === "history" && (
          <JournalHistory
            journals={journals}
            loading={loadingJournals}
            onOpenJournal={handleOpenJournal}
            onViewDetail={(j) => setSelectedJournalForDetail(j)}
            onDeleteJournal={handleDeleteJournal}
            onNewJournal={handleNewJournalRequested}
          />
        )}

        {currentTab === "reflection" && (
          <ReflectionEngineDashboard
            journals={journals}
            onOpenJournal={handleOpenJournal}
            onNewJournal={handleNewJournalRequested}
          />
        )}

        {currentTab === "security" && <SecuritySpecModal />}
      </main>

      {/* Modal for viewing journal details */}
      {selectedJournalForDetail && (
        <JournalDetailModal
          user={currentUser}
          journal={selectedJournalForDetail}
          onClose={() => setSelectedJournalForDetail(null)}
          onDeleteJournal={handleDeleteJournal}
          onResumeChat={handleOpenJournal}
        />
      )}
    </div>
  );
}
