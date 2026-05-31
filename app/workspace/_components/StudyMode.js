"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  BookOpen, Zap, FileText, GitBranch, MessageSquare,
  RefreshCw, ChevronDown, ChevronUp, RotateCcw, Check, X, Loader2
} from "lucide-react";

const TABS = [
  { id: "mcq", label: "MCQs", icon: <BookOpen size={15} />, color: "blue" },
  { id: "flashcard", label: "Flashcards", icon: <Zap size={15} />, color: "yellow" },
  { id: "notes", label: "Notes", icon: <FileText size={15} />, color: "green" },
  { id: "mindmap", label: "Mind Map", icon: <GitBranch size={15} />, color: "purple" },
  { id: "interview", label: "Interview Qs", icon: <MessageSquare size={15} />, color: "red" },
];

const COLOR_MAP = {
  blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", dot: "bg-blue-500" },
  green: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300", dot: "bg-green-500" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", dot: "bg-yellow-500" },
  purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300", dot: "bg-purple-500" },
  red: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", dot: "bg-red-500" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", dot: "bg-orange-500" },
  teal: { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-300", dot: "bg-teal-500" },
};

const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function StudyMode() {
  const { fileId } = useParams();
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  const fileInfo = useQuery(api.fileStorage.GetFileRecord, { fileId });
  const GetFullPdfContent = useAction(api.myActions.getFullPdfContent);
  const saveMaterial = useMutation(api.studyMaterials.save);
  const savedAll = useQuery(
    api.studyMaterials.getAllForFile,
    userEmail ? { fileId, createdBy: userEmail } : "skip"
  );

  const [activeTab, setActiveTab] = useState("mcq");
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState({});
  const [flipped, setFlipped] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [expandedQs, setExpandedQs] = useState({});
  const [cardIndex, setCardIndex] = useState(0);

  // Load saved materials into state
  useEffect(() => {
    if (!savedAll) return;
    const loaded = {};
    savedAll.forEach((m) => {
      try { loaded[m.type] = JSON.parse(m.content); } catch {}
    });
    setData(loaded);
  }, [savedAll]);

  const generate = async () => {
    setGenerating(true);
    setSelectedAnswers({});
    setRevealedAnswers({});
    setFlipped({});
    setCardIndex(0);
    try {
      const fullResult = await GetFullPdfContent({ fileId });
      const pdfContent = JSON.parse(fullResult);
      if (pdfContent === "NO_CONTENT_AVAILABLE" || pdfContent === "ERROR_RETRIEVING_CONTENT") {
        throw new Error("Could not read PDF content.");
      }

      const res = await fetch("/api/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeTab, pdfContent, fileName: fileInfo?.fileName }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const { data: generated } = await res.json();

      setData((prev) => ({ ...prev, [activeTab]: generated }));

      if (userEmail) {
        await saveMaterial({ fileId, createdBy: userEmail, type: activeTab, content: JSON.stringify(generated) });
      }
    } catch (e) {
      console.error("Study generation error:", e);
    } finally {
      setGenerating(false);
    }
  };

  const current = data[activeTab];
  const hasContent = !!current;

  // ── MCQ Renderer ─────────────────────────────────────────────────────────
  const renderMCQ = () => {
    const questions = current?.questions || [];
    return (
      <div className="space-y-5">
        {questions.map((q, i) => {
          const selected = selectedAnswers[i];
          const revealed = revealedAnswers[i];
          return (
            <div key={i} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-start gap-2">
                <span className="bg-blue-600 text-white text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">Q{i + 1}</span>
                <p className="font-semibold text-gray-900 text-sm">{q.question}</p>
              </div>
              <div className="p-4 grid grid-cols-1 gap-2">
                {Object.entries(q.options || {}).map(([key, val]) => {
                  let cls = "border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50";
                  if (selected || revealed) {
                    if (key === q.correct) cls = "border-2 border-green-500 bg-green-50 text-green-800 font-semibold";
                    else if (key === selected && key !== q.correct) cls = "border-2 border-red-400 bg-red-50 text-red-700";
                    else cls = "border-2 border-gray-100 text-gray-400";
                  }
                  return (
                    <button key={key} onClick={() => !selected && !revealed && setSelectedAnswers((p) => ({ ...p, [i]: key }))}
                      className={"flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all " + cls}>
                      <span className="font-black w-5 flex-shrink-0">{key}</span>
                      <span>{val}</span>
                      {(selected || revealed) && key === q.correct && <Check size={14} className="ml-auto text-green-600" />}
                      {selected && key === selected && key !== q.correct && <X size={14} className="ml-auto text-red-500" />}
                    </button>
                  );
                })}
              </div>
              {(selected || revealed) && q.explanation && (
                <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                  <span className="font-bold">Explanation: </span>{q.explanation}
                </div>
              )}
              {!selected && !revealed && (
                <div className="px-4 pb-4">
                  <button onClick={() => setRevealedAnswers((p) => ({ ...p, [i]: true }))}
                    className="text-xs text-gray-400 hover:text-blue-600 underline">Reveal answer</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Flashcard Renderer ────────────────────────────────────────────────────
  const renderFlashcards = () => {
    const cards = current?.cards || [];
    if (!cards.length) return null;
    const card = cards[cardIndex];
    const isFlipped = flipped[cardIndex];
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-sm text-gray-500 font-medium">{cardIndex + 1} / {cards.length}</div>
        <div onClick={() => setFlipped((p) => ({ ...p, [cardIndex]: !p[cardIndex] }))}
          className="w-full max-w-md cursor-pointer" style={{ perspective: "1000px", height: "220px" }}>
          <div className="relative w-full h-full transition-transform duration-500"
            style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
            {/* Front */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex flex-col items-center justify-center p-6 text-white shadow-lg"
              style={{ backfaceVisibility: "hidden" }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-3 opacity-70">Concept</div>
              <p className="text-xl font-bold text-center">{card.front}</p>
              <div className="mt-4 text-xs opacity-60">Click to flip</div>
            </div>
            {/* Back */}
            <div className="absolute inset-0 bg-white border-2 border-purple-200 rounded-2xl flex flex-col items-center justify-center p-6 shadow-lg"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-3 text-purple-500">Answer</div>
              <p className="text-base text-gray-800 text-center leading-relaxed">{card.back}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setCardIndex((p) => Math.max(0, p - 1)); setFlipped({}); }}
            disabled={cardIndex === 0}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-gray-200 transition-colors">
            ← Prev
          </button>
          <button onClick={() => setFlipped({})} className="px-3 py-2 text-gray-400 hover:text-gray-600">
            <RotateCcw size={16} />
          </button>
          <button onClick={() => { setCardIndex((p) => Math.min(cards.length - 1, p + 1)); setFlipped({}); }}
            disabled={cardIndex === cards.length - 1}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold disabled:opacity-40 hover:bg-gray-200 transition-colors">
            Next →
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
          {cards.map((_, i) => (
            <button key={i} onClick={() => { setCardIndex(i); setFlipped({}); }}
              className={"w-2.5 h-2.5 rounded-full transition-all " + (i === cardIndex ? "bg-blue-600 scale-125" : "bg-gray-300 hover:bg-gray-400")} />
          ))}
        </div>
      </div>
    );
  };

  // ── Notes Renderer ────────────────────────────────────────────────────────
  const renderNotes = () => {
    const { title, sections } = current || {};
    return (
      <div className="space-y-4">
        {title && (
          <div className="bg-green-600 text-white rounded-xl px-5 py-3">
            <h2 className="font-black text-lg uppercase">{title}</h2>
          </div>
        )}
        {(sections || []).map((sec, i) => (
          <div key={i} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-green-50 border-b border-green-100 px-4 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <h3 className="font-bold text-gray-900 text-sm">{sec.heading}</h3>
            </div>
            <ul className="px-4 py-3 space-y-2">
              {(sec.points || []).map((pt, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1 flex-shrink-0">•</span>
                  <div>
                    <span className="text-sm text-gray-700">{pt}</span>
                    {sec.subpoints?.[String(j)] && (
                      <ul className="mt-1.5 ml-3 space-y-1">
                        {sec.subpoints[String(j)].map((sub, k) => (
                          <li key={k} className="flex items-start gap-1.5">
                            <span className="text-gray-400 text-xs mt-0.5">◦</span>
                            <span className="text-xs text-gray-500">{sub}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  // ── Mind Map Renderer ─────────────────────────────────────────────────────
  const renderMindMap = () => {
    const { center, branches } = current || {};
    return (
      <div className="space-y-4">
        {/* Center node */}
        <div className="flex justify-center">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-center text-sm shadow-lg max-w-xs">
            {center}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-gray-400" />
        </div>
        {/* Branches */}
        <div className="grid grid-cols-1 gap-3">
          {(branches || []).map((branch, i) => {
            const c = COLOR_MAP[branch.color] || COLOR_MAP.blue;
            return (
              <div key={i} className={"border-2 rounded-xl overflow-hidden " + c.border}>
                <div className={"flex items-center gap-2 px-4 py-2.5 " + c.bg}>
                  <div className={"w-2.5 h-2.5 rounded-full flex-shrink-0 " + c.dot} />
                  <span className={"font-bold text-sm " + c.text}>{branch.topic}</span>
                </div>
                {branch.subtopics?.length > 0 && (
                  <div className="bg-white px-4 py-2 flex flex-wrap gap-2">
                    {branch.subtopics.map((sub, j) => (
                      <span key={j} className={"text-xs px-2.5 py-1 rounded-full border " + c.bg + " " + c.text + " " + c.border}>
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Interview Questions Renderer ──────────────────────────────────────────
  const renderInterview = () => {
    const questions = current?.questions || [];
    return (
      <div className="space-y-3">
        {questions.map((q, i) => {
          const expanded = expandedQs[i];
          const diffCls = DIFFICULTY_COLORS[q.difficulty] || "bg-gray-100 text-gray-600";
          return (
            <div key={i} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button onClick={() => setExpandedQs((p) => ({ ...p, [i]: !p[i] }))}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">Q{i + 1}</span>
                <span className="flex-1 font-semibold text-gray-900 text-sm">{q.question}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={"text-[10px] font-black px-2 py-0.5 rounded-full capitalize " + diffCls}>{q.difficulty}</span>
                  {expanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </button>
              {expanded && (
                <div className="border-t border-gray-100 px-4 py-3 bg-red-50">
                  <div className="text-xs font-bold text-red-600 uppercase mb-1.5">Model Answer</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
                  {q.type && (
                    <span className="inline-block mt-2 text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500 capitalize">{q.type}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const RENDERERS = { mcq: renderMCQ, flashcard: renderFlashcards, notes: renderNotes, mindmap: renderMindMap, interview: renderInterview };

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50">
      {/* Tab bar */}
      <div className="flex-shrink-0 bg-white border-b-2 border-black px-3 pt-3 pb-0 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const saved = !!data[tab.id];
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCardIndex(0); setFlipped({}); }}
                className={"flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-black uppercase border-2 transition-all " + (active ? "bg-black text-white border-black" : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200")}>
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {saved && !active && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {/* Generate button */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-900 text-base uppercase">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h3>
            {hasContent && (
              <p className="text-xs text-gray-400 mt-0.5">Generated from: {fileInfo?.fileName}</p>
            )}
          </div>
          <button onClick={generate} disabled={generating}
            className={"flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black text-sm font-black uppercase transition-all " + (generating ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-black text-white hover:-translate-y-0.5")}
            style={{ boxShadow: generating ? "none" : "3px 3px 0 #555" }}>
            {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {hasContent ? "Regenerate" : "Generate"}
          </button>
        </div>

        {/* Content */}
        {generating ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center animate-pulse">
              {TABS.find((t) => t.id === activeTab)?.icon && (
                <span className="text-white scale-150">{TABS.find((t) => t.id === activeTab)?.icon}</span>
              )}
            </div>
            <p className="font-black text-gray-700 uppercase text-sm">Generating {TABS.find((t) => t.id === activeTab)?.label}...</p>
            <p className="text-xs text-gray-400">AI is reading your PDF</p>
          </div>
        ) : hasContent ? (
          RENDERERS[activeTab]?.()
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center">
              <span className="scale-150 opacity-50">{TABS.find((t) => t.id === activeTab)?.icon}</span>
            </div>
            <div>
              <p className="font-black text-gray-700 uppercase text-sm mb-1">No {TABS.find((t) => t.id === activeTab)?.label} Yet</p>
              <p className="text-xs text-gray-400">Click Generate to create {TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} from your PDF</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
