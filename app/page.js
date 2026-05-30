"use client"
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { Upload, MessageCircle, Sparkles, Zap, FileText, Brain, Shield, Star, ArrowRight } from "lucide-react"
import Link from "next/link";

const HALFTONE = {
  backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)",
  backgroundSize: "22px 22px",
};

const SHADOW = "4px 4px 0px 0px #000";
const SHADOW_LG = "6px 6px 0px 0px #000";
const SHADOW_XL = "8px 8px 0px 0px #000";

export default function Home() {
  const { user, isSignedIn } = useUser();
  const createUser = useMutation(api.user.createUser);

  useEffect(() => {
    if (user) {
      createUser({
        email: user?.primaryEmailAddress?.emailAddress,
        imageUrl: user?.imageUrl,
        userName: user?.fullName,
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-yellow-50 font-sans" style={HALFTONE}>

      {/* ── NAV ── */}
      <nav className="bg-white border-b-4 border-black sticky top-0 z-50"
        style={{ boxShadow: "0 4px 0 0 #000" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-yellow-400 border-3 border-black rounded-xl flex items-center justify-center"
              style={{ border: "3px solid #000", boxShadow: SHADOW }}>
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-black tracking-tight text-black uppercase">AI PDF<span className="text-blue-600">•</span>Chat</span>
          </div>

          {isSignedIn ? (
            <div className="flex gap-3 items-center">
              <Link href="/dashboard">
                <button className="bg-blue-600 text-white font-black px-5 py-2 rounded-xl border-2 border-black uppercase text-sm tracking-wide transition-all hover:-translate-y-0.5"
                  style={{ boxShadow: SHADOW }}>
                  Dashboard
                </button>
              </Link>
              <UserButton />
            </div>
          ) : (
            <Link href="/sign-in">
              <button className="bg-yellow-400 text-black font-black px-5 py-2 rounded-xl border-2 border-black uppercase text-sm tracking-wide transition-all hover:-translate-y-0.5"
                style={{ boxShadow: SHADOW }}>
                Get Started →
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div>
            {/* POW badge */}
            <div className="inline-flex items-center gap-2 bg-red-500 text-white font-black px-4 py-1.5 rounded-full border-2 border-black mb-6 text-sm uppercase tracking-wide"
              style={{ boxShadow: SHADOW }}>
              <Zap className="w-4 h-4" />
              AI-Powered · Dual Answers
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight text-black mb-4 uppercase">
              Chat With<br />
              <span className="bg-yellow-400 px-2 inline-block" style={{ WebkitTextStroke: "1px #000" }}>
                Any PDF
              </span>
              <br />Instantly.
            </h1>

            <p className="text-lg text-gray-700 font-medium mb-8 leading-relaxed max-w-lg border-l-4 border-black pl-4">
              Upload a document — get <strong>two kinds of answers</strong> every time:
              what's in the PDF, and what AI knows beyond it.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <button className="bg-blue-600 text-white font-black text-lg px-8 py-4 rounded-2xl border-3 border-black uppercase tracking-wide transition-all hover:-translate-y-1 flex items-center gap-2"
                    style={{ border: "3px solid #000", boxShadow: SHADOW_XL }}>
                    <Sparkles className="w-5 h-5" />
                    Go to Dashboard
                  </button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <button className="bg-blue-600 text-white font-black text-lg px-8 py-4 rounded-2xl border-3 border-black uppercase tracking-wide transition-all hover:-translate-y-1 flex items-center gap-2"
                    style={{ border: "3px solid #000", boxShadow: SHADOW_XL }}>
                    <Sparkles className="w-5 h-5" />
                    Start Free Now
                  </button>
                </Link>
              )}
              <button className="bg-white text-black font-bold text-lg px-8 py-4 rounded-2xl border-3 border-black uppercase tracking-wide transition-all hover:-translate-y-1"
                style={{ border: "3px solid #000", boxShadow: SHADOW_LG }}>
                See How It Works ↓
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-4 mt-8">
              {[
                { label: "10k+ Users", icon: <Star className="w-3.5 h-3.5" />, bg: "bg-green-400" },
                { label: "99.9% Uptime", icon: <Shield className="w-3.5 h-3.5" />, bg: "bg-yellow-400" },
                { label: "Instant AI", icon: <Zap className="w-3.5 h-3.5" />, bg: "bg-red-400" },
              ].map(({ label, icon, bg }) => (
                <span key={label}
                  className={`inline-flex items-center gap-1.5 ${bg} text-black font-bold text-xs px-3 py-1.5 rounded-full border-2 border-black`}
                  style={{ boxShadow: "2px 2px 0 #000" }}>
                  {icon}{label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — comic panel mockup */}
          <div className="relative flex justify-center">
            {/* Outer frame */}
            <div className="bg-white border-4 border-black rounded-3xl p-6 w-full max-w-md"
              style={{ boxShadow: SHADOW_XL }}>
              {/* Panel header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 border border-black" />
                <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />
                <div className="w-3 h-3 rounded-full bg-green-500 border border-black" />
                <div className="ml-2 flex-1 bg-gray-100 border-2 border-black rounded-lg px-3 py-1 text-xs font-mono text-gray-500">
                  workspace/your-document.pdf
                </div>
              </div>

              {/* User bubble */}
              <div className="flex justify-end mb-3">
                <div className="bg-blue-600 text-white font-bold text-sm px-4 py-2.5 rounded-2xl rounded-br-sm border-2 border-black max-w-[80%]"
                  style={{ boxShadow: "2px 2px 0 #000" }}>
                  What is the MVP build timeline?
                </div>
              </div>

              {/* PDF Answer bubble */}
              <div className="mb-2">
                <div className="inline-flex items-center gap-1 bg-blue-100 border-2 border-black rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-700 mb-1.5"
                  style={{ boxShadow: "1px 1px 0 #000" }}>
                  <FileText className="w-3 h-3" /> PDF Answer
                </div>
                <div className="bg-white border-2 border-black rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-800 font-medium"
                  style={{ boxShadow: "3px 3px 0 #000" }}>
                  The MVP build runs <strong>20 May – 18 Aug 2026</strong>, covering 6 two-week sprints plus a buffer week.
                </div>
              </div>

              {/* AI Insights bubble */}
              <div>
                <div className="inline-flex items-center gap-1 bg-purple-100 border-2 border-black rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase text-purple-700 mb-1.5"
                  style={{ boxShadow: "1px 1px 0 #000" }}>
                  <Brain className="w-3 h-3" /> AI Insights
                </div>
                <div className="bg-purple-50 border-2 border-black rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 font-medium"
                  style={{ boxShadow: "3px 3px 0 #000" }}>
                  Two-week sprints are a standard Agile cadence — short enough to stay focused, long enough to ship meaningful features each cycle.
                </div>
              </div>

              {/* Input bar */}
              <div className="mt-4 flex gap-2">
                <div className="flex-1 bg-gray-100 border-2 border-black rounded-xl px-4 py-2.5 text-sm text-gray-400 font-medium">
                  Ask anything about your PDF…
                </div>
                <div className="w-10 h-10 bg-blue-600 border-2 border-black rounded-xl flex items-center justify-center"
                  style={{ boxShadow: "2px 2px 0 #000" }}>
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Decorative starburst */}
            <div className="absolute -top-5 -right-5 w-16 h-16 bg-yellow-400 border-3 border-black rounded-full flex items-center justify-center text-center font-black text-xs uppercase leading-tight"
              style={{ border: "3px solid #000", boxShadow: SHADOW, transform: "rotate(12deg)" }}>
              WOW!
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Comic Strips ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-block bg-black text-yellow-400 font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full mb-4">
            Simple 3-Step Process
          </div>
          <h2 className="text-5xl font-black uppercase text-black tracking-tight">
            How It <span className="bg-yellow-400 px-2">Works</span>
          </h2>
        </div>

        {/* 3 comic panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-black rounded-3xl overflow-hidden"
          style={{ boxShadow: SHADOW_XL }}>
          {[
            {
              step: "01",
              title: "Upload PDF",
              desc: "Drag & drop any PDF. Our AI reads and indexes the entire document in seconds.",
              icon: <Upload className="w-10 h-10" />,
              bg: "bg-blue-500",
              badge: "BOOM!",
              badgeBg: "bg-yellow-400",
              action: "Instant Processing →",
            },
            {
              step: "02",
              title: "Ask Questions",
              desc: "Type anything naturally — summaries, specific facts, comparisons, explanations.",
              icon: <MessageCircle className="w-10 h-10" />,
              bg: "bg-yellow-400",
              badge: "ZAP!",
              badgeBg: "bg-red-500",
              action: "Natural Language →",
            },
            {
              step: "03",
              title: "Dual Answers",
              desc: "Get a PDF-sourced answer and an AI insights section — clearly separated.",
              icon: <Sparkles className="w-10 h-10" />,
              bg: "bg-red-500",
              badge: "POW!",
              badgeBg: "bg-blue-600",
              action: "Smart Analysis →",
            },
          ].map((card, i) => (
            <div key={i}
              className={`${card.bg} ${i < 2 ? "border-r-4 border-black" : ""} p-8 relative group`}>
              {/* Step number */}
              <div className="text-8xl font-black text-black/10 absolute top-4 right-6 leading-none select-none">
                {card.step}
              </div>

              {/* Icon */}
              <div className="w-16 h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:-translate-y-1"
                style={{ border: "3px solid #000", boxShadow: SHADOW }}>
                {card.icon}
              </div>

              {/* Badge */}
              <span className={`${card.badgeBg} text-white text-xs font-black px-3 py-1 rounded-full border-2 border-black inline-block mb-3`}
                style={{ boxShadow: "2px 2px 0 #000" }}>
                {card.badge}
              </span>

              <h3 className="text-2xl font-black text-black uppercase mb-3">{card.title}</h3>
              <p className="text-black/70 font-medium leading-relaxed mb-6">{card.desc}</p>

              <span className="text-black font-black text-sm uppercase">{card.action}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <div className="inline-block bg-black text-yellow-400 font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full mb-4">
            Why Choose Us
          </div>
          <h2 className="text-5xl font-black uppercase text-black tracking-tight">
            Packed With <span className="bg-blue-500 text-white px-2">Power</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <FileText className="w-6 h-6" />, bg: "bg-blue-500", title: "PDF-Only Answers", desc: "Strict document-sourced responses — no hallucination, no guessing." },
            { icon: <Brain className="w-6 h-6" />, bg: "bg-purple-500", title: "AI Insights Layer", desc: "Beyond the document — context, analogies, and broader knowledge." },
            { icon: <Zap className="w-6 h-6" />, bg: "bg-yellow-400", title: "Lightning Fast", desc: "LLaMA 3.3 70B via Groq delivers answers in under 3 seconds." },
            { icon: <Shield className="w-6 h-6" />, bg: "bg-green-500", title: "Secure & Private", desc: "Your documents stay private. Enterprise-grade security by default." },
            { icon: <MessageCircle className="w-6 h-6" />, bg: "bg-red-500", title: "Smart Search", desc: "Full-text search indexes your entire PDF for pinpoint retrieval." },
            { icon: <Star className="w-6 h-6" />, bg: "bg-orange-400", title: "Multiple Modes", desc: "Smart search, full analysis, or summary mode — you choose the depth." },
          ].map((f, i) => (
            <div key={i}
              className="bg-white border-3 border-black rounded-2xl p-6 transition-all hover:-translate-y-1 cursor-default"
              style={{ border: "3px solid #000", boxShadow: SHADOW_LG }}>
              <div className={`w-12 h-12 ${f.bg} border-2 border-black rounded-xl flex items-center justify-center mb-4 text-white`}
                style={{ boxShadow: "2px 2px 0 #000" }}>
                {f.icon}
              </div>
              <h3 className="text-lg font-black text-black uppercase mb-2">{f.title}</h3>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-blue-600 border-4 border-black rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ boxShadow: SHADOW_XL }}>
          {/* Dots on CTA */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
              backgroundSize: "20px 20px",
            }} />

          {/* Starburst decorations */}
          <div className="absolute top-4 left-8 w-12 h-12 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center font-black text-xs text-black"
            style={{ boxShadow: "2px 2px 0 #000", transform: "rotate(-10deg)" }}>FREE
          </div>
          <div className="absolute bottom-4 right-8 w-14 h-14 bg-red-500 border-2 border-black rounded-full flex items-center justify-center font-black text-xs text-white text-center leading-tight"
            style={{ boxShadow: "2px 2px 0 #000", transform: "rotate(8deg)" }}>
            NO<br />CARD
          </div>

          <div className="relative z-10">
            <div className="inline-block bg-yellow-400 text-black font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full border-2 border-black mb-6"
              style={{ boxShadow: "2px 2px 0 #000" }}>
              Ready to Start?
            </div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tight mb-4">
              Upload Your First PDF<br />
              <span className="bg-yellow-400 text-black px-3">It's Free!</span>
            </h2>
            <p className="text-blue-100 text-lg font-medium mb-8 max-w-xl mx-auto">
              No credit card. No setup. Just upload and start getting intelligent answers in seconds.
            </p>
            {isSignedIn ? (
              <Link href="/dashboard">
                <button className="bg-yellow-400 text-black font-black text-lg px-10 py-4 rounded-2xl border-3 border-black uppercase tracking-wide transition-all hover:-translate-y-1 inline-flex items-center gap-2"
                  style={{ border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
                  <Sparkles className="w-5 h-5" />
                  Open Dashboard
                </button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <button className="bg-yellow-400 text-black font-black text-lg px-10 py-4 rounded-2xl border-3 border-black uppercase tracking-wide transition-all hover:-translate-y-1 inline-flex items-center gap-2"
                  style={{ border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
                  <Sparkles className="w-5 h-5" />
                  Get Started Free
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black text-white border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 border-2 border-white rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-black uppercase tracking-tight">AI PDF<span className="text-yellow-400">•</span>Chat</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">
              Transform your PDFs into conversations. Built with LLaMA 3.3 + Groq.
            </p>
            <div className="flex items-center gap-4 text-gray-500 text-sm font-medium">
              <span>© 2025 AI PDF Chat</span>
              <span className="text-gray-700">•</span>
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="text-gray-700">•</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
