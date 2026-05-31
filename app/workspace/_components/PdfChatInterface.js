"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, FileText, Sparkles, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

const INITIAL_MESSAGE = {
  id: "initial",
  role: "bot",
  content:
    "Hello! I am your AI PDF Assistant. I can help you with:\n\n- Answering questions about your document\n- Providing summaries of sections or the entire document\n- Extracting key insights and information\n- Explaining complex concepts\n- Finding specific details\n\nWhat would you like to know about your document?",
};

const PdfChatInterface = () => {
  const { fileId } = useParams();
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  const fileInfo = useQuery(api.fileStorage.GetFileRecord, { fileId });
  const savedMessages = useQuery(
    api.chatMessages.getByFile,
    userEmail ? { fileId, createdBy: userEmail } : "skip"
  );

  const saveMessage = useMutation(api.chatMessages.save);
  const clearMessages = useMutation(api.chatMessages.clearByFile);
  const SearchAI = useAction(api.myActions.search);
  const GetFullPdfContent = useAction(api.myActions.getFullPdfContent);

  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [analyzeMode, setAnalyzeMode] = useState("smart");
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (savedMessages === undefined || historyLoaded) return;
    setHistoryLoaded(true);
    if (savedMessages.length > 0) {
      const restored = savedMessages.map((m) => ({
        id: m._id,
        role: m.role,
        content: m.content,
        pdfAnswer: m.pdfAnswer,
        aiInsights: m.aiInsights,
        isDual: m.isDual,
        isError: m.isError,
        timestamp: new Date(m._creationTime).toLocaleTimeString(),
      }));
      setMessages([INITIAL_MESSAGE, ...restored]);
    }
  }, [savedMessages, historyLoaded]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (fileInfo?.fileName) document.title = "AI PDF - " + fileInfo.fileName;
  }, [fileInfo?.fileName]);

  const persist = (fields) => {
    if (!userEmail) return;
    saveMessage({ fileId, createdBy: userEmail, ...fields });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };
    persist({ role: "user", content: inputValue });
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, role: "bot", content: "Analyzing PDF content...", isLoading: true },
    ]);

    try {
      let pdfContent = "";

      if (analyzeMode === "full" || analyzeMode === "summary") {
        const fullResult = await GetFullPdfContent({ fileId });
        const parsed = JSON.parse(fullResult);
        if (parsed === "NO_CONTENT_AVAILABLE" || parsed === "ERROR_RETRIEVING_CONTENT") {
          throw new Error("Could not retrieve document content.");
        }
        pdfContent = parsed || "";
      } else {
        const result = await SearchAI({ query: inputValue, fileId });
        const searchResults = JSON.parse(result);
        if (
          searchResults?.length === 1 &&
          (searchResults[0].pageContent === "NO_RESULTS_FOUND" ||
            searchResults[0].pageContent === "ERROR_DURING_SEARCH")
        ) {
          const fullResult = await GetFullPdfContent({ fileId });
          const parsed = JSON.parse(fullResult);
          pdfContent = parsed === "NO_CONTENT_AVAILABLE" ? "" : parsed || "";
        } else {
          searchResults?.forEach((item) => { pdfContent += item.pageContent + " "; });
        }
      }

      if (!pdfContent?.trim()) {
        const errMsg = {
          id: Date.now() + 2,
          role: "bot",
          content: "I could not find relevant content for your query. Try rephrasing.",
          isError: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        persist({ role: "bot", content: errMsg.content, isError: true });
        setMessages((prev) => [...prev.filter((m) => !m.isLoading), errMsg]);
        setIsLoading(false);
        return;
      }

      const modeHint =
        analyzeMode === "summary" ? "Give a concise structured summary." :
        analyzeMode === "full" ? "Give a comprehensive in-depth analysis." :
        "Answer the question as precisely as possible.";

      const PROMPT = "DOCUMENT: " + (fileInfo?.fileName || "Unknown") + "\nMODE: " + analyzeMode + " - " + modeHint + "\n\nCONTEXT:\n" + pdfContent.substring(0, 25000) + "\n\nQUESTION: " + inputValue;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: PROMPT }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "API error " + res.status);
      }

      const { pdfAnswer, aiInsights } = await res.json();

      const botMsg = {
        id: Date.now() + 2,
        role: "bot",
        content: pdfAnswer || "No answer found.",
        pdfAnswer: pdfAnswer || "No answer found.",
        aiInsights: aiInsights || "",
        isDual: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      persist({ role: "bot", content: botMsg.content, pdfAnswer: botMsg.pdfAnswer, aiInsights: botMsg.aiInsights, isDual: true });
      setMessages((prev) => [...prev.filter((m) => !m.isLoading), botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      let errContent = "Sorry, I encountered an error. Please try again.";
      if (error.message?.includes("API key")) errContent = "AI service issue. Please try again shortly.";
      else if (error.message?.includes("content")) errContent = "Could not extract content. Try Full Analysis mode.";
      const errMsg = { id: Date.now() + 2, role: "bot", content: errContent, isError: true, timestamp: new Date().toLocaleTimeString() };
      persist({ role: "bot", content: errContent, isError: true });
      setMessages((prev) => [...prev.filter((m) => !m.isLoading), errMsg]);
      if (analyzeMode !== "smart") setTimeout(() => setAnalyzeMode("smart"), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!userEmail) return;
    await clearMessages({ fileId, createdBy: userEmail });
    setMessages([INITIAL_MESSAGE]);
    setHistoryLoaded(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const formatMessage = (content) => {
    if (!content) return "";
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^\* (.+)$/gm, "<li>$1</li>")
      .replace(/^(\d+)\. (.+)$/gm, "<li><span class='font-semibold'>$1.</span> $2</li>")
      .replace(/(<li>[\s\S]*?<\/li>)(\n<li>[\s\S]*?<\/li>)*/g, (match) => "<ul class='list-disc pl-4 my-1 space-y-0.5'>" + match.replace(/\n/g, "") + "</ul>")
      .replace(/\n\n/g, "</p><p class='mb-2'>")
      .replace(/^(?!<[upo]|<\/[upo])(.*\S.*)$/gm, "<p class='mb-1'>$1</p>")
      .replace(/<p class='mb-[12]'><\/p>/g, "")
      .replace(/Key Takeaway:(.*)/g, "<div class='mt-2 pt-2 border-t border-gray-100 text-xs font-semibold text-gray-600'>Key Takeaway:$1</div>");
  };

  const quickActions = [
    { text: "Summarize this document", mode: "summary" },
    { text: "What are the main points?", mode: "smart" },
    { text: "Analyze the entire document", mode: "full" },
  ];

  const handleQuickAction = (text, mode) => {
    setInputValue(text);
    if (mode) setAnalyzeMode(mode);
    setTimeout(() => { inputRef.current?.focus(); handleSendMessage(); }, 300);
  };

  const conversationMessages = messages.filter((m) => m.id !== "initial");
  const hasHistory = conversationMessages.length > 0;

  return (
    <div className="chat-container bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">PDF Analysis Assistant</h2>
              <p className="text-sm text-gray-500">
                {hasHistory ? conversationMessages.length + " saved message" + (conversationMessages.length !== 1 ? "s" : "") : "Ask me anything about your document"}
              </p>
            </div>
          </div>
          {hasHistory && (
            <button onClick={handleClearHistory} title="Clear conversation history" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
              <Trash2 size={14} />
              Clear history
            </button>
          )}
        </div>
      </div>

      <div className="chat-messages p-4 space-y-4 chat-scroll">
        {!isClient ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-200 rounded w-64" />
                <div className="h-4 bg-gray-200 rounded w-40" />
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={"flex " + (message.role === "user" ? "justify-end" : "justify-start")}>
              <div className={"flex max-w-[80%] " + (message.role === "user" ? "flex-row-reverse" : "flex-row") + " items-start space-x-3"}>
                <div className={"w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 " + (message.role === "user" ? "bg-gradient-to-r from-green-400 to-blue-500 ml-3" : "bg-gradient-to-r from-purple-400 to-pink-500 mr-3")}>
                  {message.role === "user" ? <User className="w-5 h-5 text-white" /> : message.isLoading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className={"max-w-full " + (message.role === "user" ? "rounded-2xl px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white" : message.isError ? "rounded-2xl px-4 py-3 bg-red-50 border border-red-200 text-red-800" : message.isDual ? "w-full" : "rounded-2xl px-4 py-3 bg-white border border-gray-200 text-gray-800 shadow-sm")}>
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Analyzing PDF content...</span></div>
                  ) : message.isDual ? (
                    <div className="space-y-2 max-w-full">
                      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="flex items-center space-x-2 px-3 py-1.5 border-b border-gray-100">
                          <span className="flex items-center space-x-1.5 bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                            <FileText className="w-3 h-3" /><span>PDF ANSWER</span>
                          </span>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-800 px-3 py-2" style={{ wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: formatMessage(message.pdfAnswer) }} />
                      </div>
                      {message.aiInsights && (
                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                          <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
                            <span className="flex items-center space-x-1.5 bg-purple-100 text-purple-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                              <Bot className="w-3 h-3" /><span>AI INSIGHTS</span>
                            </span>
                            <span className="text-[10px] text-gray-400">General knowledge - not from PDF</span>
                          </div>
                          <div className="prose prose-sm max-w-none text-gray-800 px-3 py-2" style={{ wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: formatMessage(message.aiInsights) }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-full">
                      <div className={"prose prose-sm max-w-none " + (message.role === "user" ? "prose-invert" : "")} style={{ wordBreak: "break-word", overflowWrap: "break-word" }} dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                    </div>
                  )}
                  {isClient && message.timestamp && <div className="text-xs mt-2 opacity-70">{message.timestamp}</div>}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {!hasHistory && (
        <div className="px-4 py-3 flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-3">Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <button key={i} onClick={() => handleQuickAction(action.text, action.mode)} className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-sm shadow-sm">
                <span>{action.text}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">Your conversation will be saved and available next time you open this PDF.</div>
        </div>
      )}

      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-end space-x-3">
          <div className="flex-1 min-h-[44px] max-h-32 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
            <textarea ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyPress} placeholder="Ask me anything about your PDF..." className="flex-1 bg-transparent border-none outline-none resize-none px-4 py-3 text-gray-700 placeholder-gray-500" rows={1} style={{ minHeight: "44px", maxHeight: "128px", overflowY: "auto", lineHeight: "1.5" }} onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px"; }} />
          </div>
          <button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} className={"w-11 h-11 rounded-lg flex items-center justify-center transition-all " + (inputValue.trim() && !isLoading ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105" : "bg-gray-300 text-gray-500 cursor-not-allowed")}>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">Press Enter to send - Shift+Enter for new line - Conversations are saved automatically</div>
      </div>
    </div>
  );
};

export default PdfChatInterface;
