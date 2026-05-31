"use client"
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { Upload, MessageCircle, Sparkles, Zap, FileText, Brain, Shield, Star, BookOpen, CheckCircle, Users, Quote } from "lucide-react"
import Link from "next/link";

const HALFTONE = { backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.09) 1.5px, transparent 1.5px)", backgroundSize: "22px 22px" };
const SHADOW = "4px 4px 0px 0px #000";
const SHADOW_LG = "6px 6px 0px 0px #000";
const SHADOW_XL = "8px 8px 0px 0px #000";

const STUDY_TOOLS = [
  { icon: "📝", color: "bg-blue-500", label: "MCQs", title: "Multiple Choice Questions", desc: "5 AI-generated questions with 4 options each. Click to answer, get instant feedback, and read explanations sourced from your PDF.", tags: ["Interactive quiz", "Instant feedback", "Explanations"] },
  { icon: "⚡", color: "bg-yellow-400", label: "Flashcards", title: "Smart Flashcards", desc: "10 flip-cards with terms on the front and detailed answers on the back. Navigate with arrows or dot indicators.", tags: ["3D flip animation", "10 cards", "Navigate freely"] },
  { icon: "📄", color: "bg-green-500", label: "Notes", title: "Structured Notes", desc: "Clean headings, bullet points, and sub-points organized from the document content. Ready to review or print.", tags: ["Hierarchical layout", "All key concepts", "Print-ready"] },
  { icon: "🗺️", color: "bg-purple-500", label: "Mind Map", title: "Visual Mind Map", desc: "Central topic with color-coded branches and subtopic chips — see the whole document structure at a single glance.", tags: ["Color-coded", "6-8 branches", "Visual overview"] },
  { icon: "🎤", color: "bg-red-500", label: "Interview Qs", title: "Interview Questions", desc: "8 interview questions with easy/medium/hard difficulty ratings and full model answers for exam and interview prep.", tags: ["Difficulty rated", "Model answers", "Mixed question types"] },
  { icon: "💾", color: "bg-gray-800", label: "Auto-Save", title: "Saved Per PDF", desc: "Every generated set is saved to your account and reloaded instantly next time you open the same PDF. No re-generating needed.", tags: ["Per PDF storage", "Instant reload", "Regenerate anytime"] },
];

const TESTIMONIALS = [
  { name: "Sarah K.", role: "Medical Student", avatar: "SK", bg: "bg-blue-500", quote: "I upload my lecture PDFs and generate flashcards instantly. Studying for exams used to take days — now I am ready in hours. The MCQ feature is genuinely unreal.", stars: 5 },
  { name: "James R.", role: "Legal Researcher", avatar: "JR", bg: "bg-green-500", quote: "I deal with 100-page contracts daily. The PDF-only answers keep things accurate, and the Mind Map feature helps me see the whole structure instantly. Game changer.", stars: 5 },
  { name: "Priya M.", role: "PhD Candidate", avatar: "PM", bg: "bg-purple-500", quote: "The interview questions feature helped me prep for my thesis defense. It generated questions I had not even thought of, and the model answers were spot on.", stars: 5 },
];

export default function Home() {
  const { user, isSignedIn } = useUser();
  const createUser = useMutation(api.user.createUser);

  useEffect(() => {
    if (user) createUser({ email: user?.primaryEmailAddress?.emailAddress, imageUrl: user?.imageUrl, userName: user?.fullName });
  }, [user]);

  return (
    <div className="min-h-screen bg-yellow-50 font-sans" style={HALFTONE}>

      {/* ── NAV ── */}
      <nav className="bg-white border-b-4 border-black sticky top-0 z-50" style={{ boxShadow: "0 4px 0 0 #000" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-yellow-400 border-3 border-black rounded-xl flex items-center justify-center" style={{ border: "3px solid #000", boxShadow: SHADOW }}>
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-black tracking-tight text-black uppercase">AI PDF<span className="text-blue-600">•</span>Chat</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase text-gray-600">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#study" className="hover:text-black transition-colors">Study Mode</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
          </div>
          {isSignedIn ? (
            <div className="flex gap-3 items-center">
              <Link href="/dashboard"><button className="bg-blue-600 text-white font-black px-5 py-2 rounded-xl border-2 border-black uppercase text-sm tracking-wide transition-all hover:-translate-y-0.5" style={{ boxShadow: SHADOW }}>Dashboard</button></Link>
              <UserButton />
            </div>
          ) : (
            <Link href="/sign-in"><button className="bg-yellow-400 text-black font-black px-5 py-2 rounded-xl border-2 border-black uppercase text-sm tracking-wide transition-all hover:-translate-y-0.5" style={{ boxShadow: SHADOW }}>Get Started Free →</button></Link>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-500 text-white font-black px-4 py-1.5 rounded-full border-2 border-black mb-6 text-sm uppercase tracking-wide" style={{ boxShadow: SHADOW }}>
              <Zap className="w-4 h-4" /> AI Chat + Study Mode — All In One
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-none tracking-tight text-black mb-4 uppercase">
              Turn Any PDF Into<br />
              <span className="bg-yellow-400 px-2 inline-block" style={{ WebkitTextStroke: "1px #000" }}>A Complete</span>
              <br />Study System.
            </h1>
            <p className="text-lg text-gray-700 font-medium mb-8 leading-relaxed max-w-lg border-l-4 border-black pl-4">
              Upload a document. Chat with it using AI. Then generate <strong>MCQs, Flashcards, Notes, Mind Maps</strong> and <strong>Interview Questions</strong> — all saved automatically for every visit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isSignedIn ? (
                <Link href="/dashboard"><button className="bg-blue-600 text-white font-black text-lg px-8 py-4 rounded-2xl border-3 border-black uppercase tracking-wide transition-all hover:-translate-y-1 flex items-center gap-2" style={{ border: "3px solid #000", boxShadow: SHADOW_XL }}><Sparkles className="w-5 h-5" /> Go to Dashboard</button></Link>
              ) : (
                <Link href="/sign-in"><button className="bg-blue-600 text-white font-black text-lg px-8 py-4 rounded-2xl border-3 border-black uppercase tracking-wide transition-all hover:-translate-y-1 flex items-center gap-2" style={{ border: "3px solid #000", boxShadow: SHADOW_XL }}><Sparkles className="w-5 h-5" /> Start Free — No Card Needed</button></Link>
              )}
              <a href="#study"><button className="bg-white text-black font-bold text-lg px-8 py-4 rounded-2xl border-3 border-black uppercase tracking-wide transition-all hover:-translate-y-1" style={{ border: "3px solid #000", boxShadow: SHADOW_LG }}>See Study Mode ↓</button></a>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              {[["bg-green-400","📄","50k+ PDFs Analyzed"],["bg-yellow-400","📚","5 Study Tools"],["bg-red-400","⚡","Under 3s Response"],["bg-blue-400","💬","Saved Chat History"]].map(([bg, emoji, label]) => (
                <span key={label} className={`inline-flex items-center gap-1.5 ${bg} text-black font-bold text-xs px-3 py-1.5 rounded-full border-2 border-black`} style={{ boxShadow: "2px 2px 0 #000" }}>{emoji} {label}</span>
              ))}
            </div>
          </div>

          {/* Mockup */}
          <div className="relative flex justify-center">
            <div className="bg-white border-4 border-black rounded-3xl p-5 w-full max-w-md" style={{ boxShadow: SHADOW_XL }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 border border-black" />
                <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />
                <div className="w-3 h-3 rounded-full bg-green-500 border border-black" />
                <div className="ml-2 flex-1 bg-gray-100 border-2 border-black rounded-lg px-3 py-1 text-xs font-mono text-gray-500">workspace/biology-textbook.pdf</div>
              </div>
              <div className="flex gap-1 mb-4 bg-gray-100 border-2 border-black rounded-xl p-1">
                <div className="flex-1 bg-purple-600 text-white text-xs font-black text-center py-1.5 rounded-lg border border-black">💬 Chat</div>
                <div className="flex-1 text-gray-500 text-xs font-bold text-center py-1.5">📚 Study</div>
              </div>
              <div className="flex justify-end mb-3">
                <div className="bg-blue-600 text-white font-bold text-xs px-3 py-2 rounded-2xl rounded-br-sm border-2 border-black max-w-[80%]" style={{ boxShadow: "2px 2px 0 #000" }}>Explain photosynthesis</div>
              </div>
              <div className="mb-2">
                <div className="inline-flex items-center gap-1 bg-blue-100 border-2 border-black rounded-full px-2 py-0.5 text-[9px] font-black uppercase text-blue-700 mb-1" style={{ boxShadow: "1px 1px 0 #000" }}><FileText className="w-3 h-3" /> PDF Answer</div>
                <div className="bg-white border-2 border-black rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-800 font-medium" style={{ boxShadow: "2px 2px 0 #000" }}>Photosynthesis converts CO2 + H2O into glucose in chloroplasts using sunlight. (Chapter 3, pg. 47)</div>
              </div>
              <div className="mb-3">
                <div className="inline-flex items-center gap-1 bg-purple-100 border-2 border-black rounded-full px-2 py-0.5 text-[9px] font-black uppercase text-purple-700 mb-1" style={{ boxShadow: "1px 1px 0 #000" }}><Brain className="w-3 h-3" /> AI Insights</div>
                <div className="bg-purple-50 border-2 border-black rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 font-medium" style={{ boxShadow: "2px 2px 0 #000" }}>Think of chloroplasts as solar panels — they power almost all food chains on Earth.</div>
              </div>
              <div className="bg-gray-900 rounded-xl border-2 border-black p-3">
                <p className="text-[9px] text-gray-400 font-bold uppercase mb-2">Study Mode — Generated</p>
                <div className="flex gap-1.5 flex-wrap">
                  {["5 MCQs","10 Flashcards","Notes","Mind Map","8 Interview Qs"].map((t) => (
                    <span key={t} className="bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full border border-black">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-5 -right-5 w-16 h-16 bg-yellow-400 border-3 border-black rounded-full flex items-center justify-center text-center font-black text-xs uppercase leading-tight" style={{ border: "3px solid #000", boxShadow: SHADOW, transform: "rotate(12deg)" }}>WOW!</div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-block bg-black text-yellow-400 font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full mb-4">Dead Simple</div>
          <h2 className="text-5xl font-black uppercase text-black tracking-tight">How It <span className="bg-yellow-400 px-2">Works</span></h2>
          <p className="mt-4 text-gray-600 font-medium max-w-xl mx-auto">From upload to mastery in three steps. No setup, no learning curve.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-black rounded-3xl overflow-hidden" style={{ boxShadow: SHADOW_XL }}>
          {[
            { step:"01", title:"Upload Your PDF", bg:"bg-blue-500", badge:"BOOM!", badgeBg:"bg-yellow-400", icon:<Upload className="w-10 h-10" />, desc:"Drop any PDF — textbook, research paper, contract, or notes. Our AI reads and indexes every word in seconds.", points:["Up to 10MB file size","Instant text extraction","Secure cloud storage"] },
            { step:"02", title:"Chat & Ask Anything", bg:"bg-yellow-400", badge:"ZAP!", badgeBg:"bg-red-500", icon:<MessageCircle className="w-10 h-10" />, desc:"Ask questions in plain English. Get two answers: exactly what the document says, plus AI context beyond it.", points:["PDF-sourced answer","AI Insights layer","Saved chat history"] },
            { step:"03", title:"Generate Study Tools", bg:"bg-red-500", badge:"POW!", badgeBg:"bg-blue-600", icon:<BookOpen className="w-10 h-10" />, desc:"Switch to Study Mode and generate MCQs, Flashcards, Notes, Mind Maps, or Interview Questions with one click.", points:["5 study formats","Auto-saved per PDF","Regenerate anytime"] },
          ].map((card, i) => (
            <div key={i} className={`${card.bg} ${i < 2 ? "border-r-4 border-black" : ""} p-8 relative group`}>
              <div className="text-8xl font-black text-black/10 absolute top-4 right-6 leading-none select-none">{card.step}</div>
              <div className="w-16 h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center mb-5 group-hover:-translate-y-1 transition-transform" style={{ border: "3px solid #000", boxShadow: SHADOW }}>{card.icon}</div>
              <span className={`${card.badgeBg} text-white text-xs font-black px-3 py-1 rounded-full border-2 border-black inline-block mb-3`} style={{ boxShadow: "2px 2px 0 #000" }}>{card.badge}</span>
              <h3 className="text-2xl font-black text-black uppercase mb-2">{card.title}</h3>
              <p className="text-black/70 font-medium leading-relaxed mb-5 text-sm">{card.desc}</p>
              <ul className="space-y-1.5">
                {card.points.map((pt) => (
                  <li key={pt} className="flex items-center gap-2 text-xs font-bold text-black/80"><CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── STUDY MODE SHOWCASE ── */}
      <section id="study" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <div className="inline-block bg-black text-yellow-400 font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full mb-4">Exclusive Feature</div>
          <h2 className="text-5xl font-black uppercase text-black tracking-tight">Study Mode — <span className="bg-green-400 px-2">5 Tools</span></h2>
          <p className="mt-4 text-gray-600 font-medium max-w-2xl mx-auto">One click generates complete study materials from your PDF. Everything saved automatically and available every time you revisit.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STUDY_TOOLS.map((item, i) => (
            <div key={i} className="bg-white border-3 border-black rounded-2xl overflow-hidden transition-all hover:-translate-y-1" style={{ border: "3px solid #000", boxShadow: SHADOW_LG }}>
              <div className={`${item.color} border-b-3 border-black p-4 flex items-center gap-3`} style={{ borderBottom: "3px solid #000" }}>
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <span className="bg-white text-black text-[10px] font-black px-2 py-0.5 rounded-full border border-black">{item.label}</span>
                  <h3 className="text-base font-black text-black uppercase mt-1">{item.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 font-medium leading-relaxed mb-3">{item.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (<span key={tag} className="text-[10px] font-bold bg-gray-100 border border-gray-300 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <div className="inline-block bg-black text-yellow-400 font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full mb-4">Everything You Need</div>
          <h2 className="text-5xl font-black uppercase text-black tracking-tight">Packed With <span className="bg-blue-500 text-white px-2">Power</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: <FileText className="w-5 h-5" />, bg: "bg-blue-500", title: "Document-Only Answers", desc: "Strict PDF-sourced responses — no hallucinations, no guessing. Only what is in your document." },
            { icon: <Brain className="w-5 h-5" />, bg: "bg-purple-500", title: "AI Insights Layer", desc: "Context, analogies, and broader knowledge beyond the doc — clearly labelled and separated." },
            { icon: <Zap className="w-5 h-5" />, bg: "bg-yellow-400", title: "Lightning Fast", desc: "LLaMA 3.3 70B via Groq delivers complete answers in under 3 seconds. No waiting." },
            { icon: <Shield className="w-5 h-5" />, bg: "bg-green-500", title: "Private & Secure", desc: "Your documents stay private. We never train AI on your files or share your data." },
            { icon: <MessageCircle className="w-5 h-5" />, bg: "bg-red-500", title: "Saved Conversations", desc: "Every chat is saved per PDF. Pick up exactly where you left off on every visit." },
            { icon: <BookOpen className="w-5 h-5" />, bg: "bg-orange-400", title: "5 Study Formats", desc: "MCQs, Flashcards, Notes, Mind Maps, Interview Questions — all generated from one PDF upload." },
            { icon: <Star className="w-5 h-5" />, bg: "bg-pink-500", title: "3 Analysis Modes", desc: "Smart search, full document analysis, or summary mode — choose the depth of every answer." },
            { icon: <Users className="w-5 h-5" />, bg: "bg-indigo-500", title: "Works For Everyone", desc: "Students, researchers, lawyers, professionals — built for any field and any document type." },
          ].map((f, i) => (
            <div key={i} className="bg-white border-3 border-black rounded-2xl p-5 transition-all hover:-translate-y-1" style={{ border: "3px solid #000", boxShadow: SHADOW_LG }}>
              <div className={`w-11 h-11 ${f.bg} border-2 border-black rounded-xl flex items-center justify-center mb-4 text-white`} style={{ boxShadow: "2px 2px 0 #000" }}>{f.icon}</div>
              <h3 className="text-sm font-black text-black uppercase mb-2">{f.title}</h3>
              <p className="text-gray-600 font-medium text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <div className="inline-block bg-black text-yellow-400 font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full mb-4">Loved By Users</div>
          <h2 className="text-5xl font-black uppercase text-black tracking-tight">What They <span className="bg-red-500 text-white px-2">Say</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white border-3 border-black rounded-2xl p-6 relative" style={{ border: "3px solid #000", boxShadow: SHADOW_LG }}>
              <Quote className="w-8 h-8 text-gray-100 absolute top-4 right-4" />
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 ${t.bg} border-2 border-black rounded-full flex items-center justify-center text-white font-black text-sm`} style={{ boxShadow: "2px 2px 0 #000" }}>{t.avatar}</div>
                <div>
                  <p className="font-black text-black text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{t.role}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array(t.stars).fill(0).map((_, s) => (<Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />))}
                </div>
              </div>
              <p className="text-gray-700 font-medium text-sm leading-relaxed">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <div className="inline-block bg-black text-yellow-400 font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full mb-4">Simple Pricing</div>
          <h2 className="text-5xl font-black uppercase text-black tracking-tight">Start Free, <span className="bg-yellow-400 px-2">Scale Up</span></h2>
          <p className="mt-4 text-gray-600 font-medium max-w-xl mx-auto">No credit card required to get started. Upgrade when you need more.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free plan */}
          <div className="bg-white border-4 border-black rounded-3xl p-8" style={{ boxShadow: SHADOW_LG }}>
            <div className="inline-block bg-gray-100 text-black font-black text-xs uppercase px-3 py-1 rounded-full border-2 border-black mb-4">Free</div>
            <div className="text-5xl font-black text-black mb-1">$0</div>
            <div className="text-gray-500 font-medium text-sm mb-8">Forever free, no card needed</div>
            <ul className="space-y-3 mb-8">
              {["Upload up to 5 PDFs","AI Chat with any PDF","PDF Answer + AI Insights","3 Analysis Modes","All 5 Study Tools","Saved chat history"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-gray-700"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Link href="/sign-in"><button className="w-full bg-white text-black font-black py-3 rounded-xl border-2 border-black uppercase tracking-wide transition-all hover:-translate-y-0.5" style={{ boxShadow: SHADOW }}>Get Started Free</button></Link>
          </div>
          {/* Pro plan */}
          <div className="bg-blue-600 border-4 border-black rounded-3xl p-8 relative" style={{ boxShadow: SHADOW_XL }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-yellow-400 text-black font-black text-xs uppercase px-4 py-1.5 rounded-full border-2 border-black" style={{ boxShadow: "2px 2px 0 #000" }}>Most Popular</span>
            </div>
            <div className="inline-block bg-yellow-400 text-black font-black text-xs uppercase px-3 py-1 rounded-full border-2 border-black mb-4">Pro</div>
            <div className="text-5xl font-black text-white mb-1">$9<span className="text-2xl text-blue-200">/mo</span></div>
            <div className="text-blue-200 font-medium text-sm mb-8">Cancel anytime, no commitment</div>
            <ul className="space-y-3 mb-8">
              {["Unlimited PDF uploads","Everything in Free","Priority AI responses","Unlimited Study Mode generations","Export study materials (PDF, CSV)","Priority support"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-white"><CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Link href="/dashboard/upgrade"><button className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl border-2 border-black uppercase tracking-wide transition-all hover:-translate-y-0.5" style={{ boxShadow: "3px 3px 0 #000" }}>Upgrade to Pro →</button></Link>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-blue-600 border-4 border-black rounded-3xl p-12 text-center relative overflow-hidden" style={{ boxShadow: SHADOW_XL }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #fff 1.5px, transparent 1.5px)", backgroundSize: "20px 20px" }} />
          <div className="absolute top-4 left-8 w-14 h-14 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center font-black text-xs text-black" style={{ boxShadow: "2px 2px 0 #000", transform: "rotate(-10deg)" }}>FREE!</div>
          <div className="absolute bottom-4 right-8 w-16 h-16 bg-red-500 border-2 border-black rounded-full flex items-center justify-center font-black text-xs text-white text-center leading-tight" style={{ boxShadow: "2px 2px 0 #000", transform: "rotate(8deg)" }}>NO<br />CARD</div>
          <div className="relative z-10">
            <div className="inline-block bg-yellow-400 text-black font-black text-sm uppercase tracking-widest px-6 py-2 rounded-full border-2 border-black mb-6" style={{ boxShadow: "2px 2px 0 #000" }}>Ready to study smarter?</div>
            <h2 className="text-5xl font-black text-white uppercase tracking-tight mb-4">
              Upload Your First PDF<br />
              <span className="bg-yellow-400 text-black px-3">Get 5 Study Tools Free!</span>
            </h2>
            <p className="text-blue-100 text-lg font-medium mb-8 max-w-xl mx-auto">No credit card. No setup. Chat with your document and generate MCQs, Flashcards, Notes, Mind Maps and Interview Questions in seconds.</p>
            {isSignedIn ? (
              <Link href="/dashboard"><button className="bg-yellow-400 text-black font-black text-lg px-10 py-4 rounded-2xl border-3 border-black uppercase tracking-wide transition-all hover:-translate-y-1 inline-flex items-center gap-2" style={{ border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}><Sparkles className="w-5 h-5" /> Open Dashboard</button></Link>
            ) : (
              <Link href="/sign-in"><button className="bg-yellow-400 text-black font-black text-lg px-10 py-4 rounded-2xl border-3 border-black uppercase tracking-wide transition-all hover:-translate-y-1 inline-flex items-center gap-2" style={{ border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}><Sparkles className="w-5 h-5" /> Start Studying Free</button></Link>
            )}
            <p className="text-blue-200 text-sm mt-4 font-medium">Join thousands of students and professionals already using AI PDF Chat</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-black text-white border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-400 border-2 border-white rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-black" /></div>
                <span className="text-lg font-black uppercase tracking-tight">AI PDF<span className="text-yellow-400">•</span>Chat</span>
              </div>
              <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs">The smartest way to study any document. Chat with PDFs, generate study materials, and master any subject faster.</p>
            </div>
            <div>
              <h4 className="text-white font-black uppercase text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm font-medium">
                {["AI Chat","Study Mode","MCQ Generator","Flashcards"].map((item) => (<li key={item} className="hover:text-white cursor-pointer transition-colors">{item}</li>))}
                <li><Link href="/dashboard/upgrade" className="hover:text-white transition-colors">Upgrade to Pro</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black uppercase text-sm mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm font-medium">
                {["Privacy Policy","Terms of Service","Cookie Policy"].map((item) => (<li key={item} className="hover:text-white cursor-pointer transition-colors">{item}</li>))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm font-medium">© 2025 AI PDF Chat. All rights reserved.</p>
            <p className="text-gray-600 text-xs font-medium">Built with LLaMA 3.3 70B · Powered by Groq · Stored on Convex</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
