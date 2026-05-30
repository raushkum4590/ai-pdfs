"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  FileText,
  Sparkles,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const PdfChatInterface = () => {
  const { fileId } = useParams();
  const fileInfo = useQuery(api.fileStorage.GetFileRecord, { fileId });
  // Create client timestamp ref to avoid hydration issues
  const [isClient, setIsClient] = useState(false);

  // Initial message without a timestamp
  const initialMessage = {
    id: 1,
    type: "bot",
    content:
      "Hello! I'm your AI PDF Assistant powered by advanced language models. I can help you with:\n\n• Answering questions about your document\n• Providing summaries of sections or the entire document\n• Extracting key insights and information\n• Explaining complex concepts\n• Finding specific details\n\nWhat would you like to know about your document?",
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const SearchAI = useAction(api.myActions.search);
  const GetFullPdfContent = useAction(api.myActions.getFullPdfContent);
  const [analyzeMode, setAnalyzeMode] = useState("smart"); // 'smart', 'full', 'summary'
  
  // Auto-reset analyzeMode to "smart" after 5 minutes of inactivity
  useEffect(() => {
    if (analyzeMode !== "smart") {
      const timer = setTimeout(() => {
        setAnalyzeMode("smart");
        console.log("Auto-resetting analysis mode to smart after inactive period");
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearTimeout(timer);
    }
  }, [analyzeMode]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Additional effect to ensure proper scrolling on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  // Set document title on load
  useEffect(() => {
    if (fileInfo?.fileName) {
      document.title = `AI PDF Assistant - ${fileInfo.fileName}`;
    }
  }, [fileInfo?.fileName]);
  // Add timestamps client-side only after component mount
  useEffect(() => {
    setIsClient(true);

    setMessages((prevMessages) =>
      prevMessages.map((message) => ({
        ...message,
        timestamp: new Date().toLocaleTimeString(),
      })),
    );

    // Add error tracking for OpenRouter API
    const trackApiErrors = () => {
      window.addEventListener('error', function(event) {
        // Check if error is related to OpenRouter API
        if (event.error && (
          event.error.message?.includes('openrouter') || 
          event.error.message?.includes('API key') ||
          event.error.stack?.includes('AIModel.js')
        )) {
          console.error('OpenRouter API Error detected:', event.error);
          // Reset any loading states if needed
          setIsLoading(false);
        }
      });
    };

    trackApiErrors();
  }, []);
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: isClient ? new Date().toLocaleTimeString() : "",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Add loading message
    const loadingMessage = {
      id: Date.now() + 1,
      type: "bot",
      content: "Analyzing PDF content...",
      isLoading: true,
      timestamp: isClient ? new Date().toLocaleTimeString() : "",
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      let pdfContent = "";
      // Different analysis modes
      if (analyzeMode === "full" || analyzeMode === "summary") {
        // Get full PDF content for comprehensive analysis
        try {
          const fullResult = await GetFullPdfContent({
            fileId: fileId,
          });

          const fullPdfContent = JSON.parse(fullResult);

          // Handle special error cases
          if (
            fullPdfContent === "NO_CONTENT_AVAILABLE" ||
            fullPdfContent === "ERROR_RETRIEVING_CONTENT"
          ) {
            throw new Error(
              "Could not retrieve document content. Please try again.",
            );
          }

          pdfContent = fullPdfContent || "";
        } catch (error) {
          console.error("Error in full content retrieval:", error);
          throw new Error("Failed to analyze the document. Please try again.");
        }
      } else if (analyzeMode === "smart") {
        // Full-text search directly in Convex — no embedding API needed
        try {
          const result = await SearchAI({ query: inputValue, fileId });
          const searchResults = JSON.parse(result);

          if (
            searchResults &&
            searchResults.length === 1 &&
            (searchResults[0].pageContent === "NO_RESULTS_FOUND" ||
              searchResults[0].pageContent === "ERROR_DURING_SEARCH")
          ) {
            // Fallback: return all chunks for this file (no embedding needed)
            const fullResult = await GetFullPdfContent({ fileId });
            const fullPdfContent = JSON.parse(fullResult);
            if (
              fullPdfContent === "NO_CONTENT_AVAILABLE" ||
              fullPdfContent === "ERROR_RETRIEVING_CONTENT"
            ) {
              throw new Error("Could not find relevant content in the document.");
            }
            pdfContent = fullPdfContent || "";
          } else {
            searchResults?.forEach((item) => {
              pdfContent += item.pageContent + " ";
            });
          }
        } catch (error) {
          console.error("Error in smart search:", error);
          throw new Error("Failed to search the document content. Please try again.");
        }
      }
      if (!pdfContent || pdfContent.trim() === "") {
        // Handle empty content more gracefully
        setMessages((prev) => {
          const filteredMessages = prev.filter((msg) => !msg.isLoading);
          return [
            ...filteredMessages,
            {
              id: Date.now() + 2,
              type: "bot",
              content:
                "I couldn't find any relevant content in the PDF related to your query. Please try rephrasing your question or try a different query.",
              timestamp: isClient ? new Date().toLocaleTimeString() : "",
              isError: true,
            },
          ];
        });
        setIsLoading(false);
        return; // Exit the function early
      }

      // Generate dual AI response
      const modeHint =
        analyzeMode === "summary"
          ? "The user wants a concise, structured summary."
          : analyzeMode === "full"
            ? "The user wants a comprehensive, in-depth analysis of the entire document."
            : "Answer the specific question as precisely as possible using the document.";

      const PROMPT = `DOCUMENT TITLE: ${fileInfo?.fileName || "Unknown"}
ANALYSIS MODE: ${analyzeMode} — ${modeHint}

DOCUMENT CONTEXT:
${pdfContent.substring(0, 25000)}

USER QUESTION:
${inputValue}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: PROMPT }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `API error ${res.status}`);
      }

      const { pdfAnswer, aiInsights } = await res.json();

      // Remove loading message and add dual response
      setMessages((prev) => {
        const filteredMessages = prev.filter((msg) => !msg.isLoading);
        return [
          ...filteredMessages,
          {
            id: Date.now() + 2,
            type: "bot",
            pdfAnswer: pdfAnswer || "No PDF-based answer found.",
            aiInsights: aiInsights || "",
            content: pdfAnswer || "No PDF-based answer found.",
            timestamp: isClient ? new Date().toLocaleTimeString() : "",
            isDual: true,
          },
        ];
      });
    } catch (error) {
      console.error("Error:", error);

      // Provide more specific error messages based on error type
      let errorMessage = "Sorry, I encountered an error while analyzing the PDF. Please check your connection and try again.";
      
      if (error.message && error.message.includes("API key")) {
        errorMessage = "API key error: The AI service may be experiencing issues. Please try again in a few moments or contact support if this persists.";
      } else if (error.message && error.message.includes("content")) {
        errorMessage = "Could not extract sufficient content from your PDF. Please try using the 'Full Analysis' mode or upload a different document.";
      } else if (error.message && error.message.includes("timeout") || error.message && error.message.includes("timed out")) {
        errorMessage = "The request timed out. Your document may be too large or the server is busy. Please try again with a shorter query or try the 'Smart Search' mode.";
      }

      // Remove loading message and add error
      setMessages((prev) => {
        const filteredMessages = prev.filter((msg) => !msg.isLoading);
        return [
          ...filteredMessages,
          {
            id: Date.now() + 2,
            type: "bot",
            content: errorMessage,
            timestamp: isClient ? new Date().toLocaleTimeString() : "",
            isError: true,
          },
        ];
      });
      
      // Auto reset to smart mode if we had errors in other modes
      if (analyzeMode !== "smart") {
        setTimeout(() => {
          setAnalyzeMode("smart");
          console.log("Resetting to smart mode after error in", analyzeMode, "mode");
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content) => {
    if (!content) return "";
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^\* (.+)$/gm, "<li>$1</li>")
      .replace(/^(\d+)\. (.+)$/gm, "<li><span class='font-semibold'>$1.</span> $2</li>")
      // Group consecutive <li> lines into one <ul>
      .replace(/(<li>[\s\S]*?<\/li>)(\n<li>[\s\S]*?<\/li>)*/g, (match) =>
        `<ul class="list-disc pl-4 my-1 space-y-0.5">${match.replace(/\n/g, "")}</ul>`
      )
      .replace(/\n\n/g, "</p><p class='mb-2'>")
      .replace(/^(?!<[upo]|<\/[upo])(.*\S.*)$/gm, "<p class='mb-1'>$1</p>")
      .replace(/<p class='mb-[12]'><\/p>/g, "")
      .replace(
        /Key Takeaway:(.*)/g,
        '<div class="mt-2 pt-2 border-t border-gray-100 text-xs font-semibold text-gray-600">Key Takeaway:$1</div>',
      );
  };

  const quickActions = [
    {
      text: "Summarize this document",
      icon: <FileText size={16} />,
      mode: "summary",
    },
    {
      text: "What are the main points?",
      icon: <Sparkles size={16} />,
      mode: "smart",
    },
    {
      text: "Analyze the entire document",
      icon: <Bot size={16} />,
      mode: "full",
    },
  ];

  const handleQuickAction = (text, mode) => {
    setInputValue(text);
    if (mode) setAnalyzeMode(mode);

    // Auto-submit after a brief delay to give a natural feel
    setTimeout(() => {
      inputRef.current?.focus();
      handleSendMessage();
    }, 300);
  };
  return (
    <div className="chat-container bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              PDF Analysis Assistant
            </h2>
            <p className="text-sm text-gray-500">
              Ask me anything about your document
            </p>
          </div>
        </div>{" "}
      </div>{" "}
      {/* Messages Container - Scrollable */}
      <div className="chat-messages p-4 space-y-4 chat-scroll">
        {!isClient ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"} items-start space-x-3`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-green-400 to-blue-500 ml-3"
                      : "bg-gradient-to-r from-purple-400 to-pink-500 mr-3"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : message.isLoading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>{" "}
                {/* Message Content */}
                <div
                  className={`max-w-full ${
                    message.type === "user"
                      ? "rounded-2xl px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : message.isError
                        ? "rounded-2xl px-4 py-3 bg-red-50 border border-red-200 text-red-800"
                        : message.isDual
                          ? "w-full"
                          : "rounded-2xl px-4 py-3 bg-white border border-gray-200 text-gray-800 shadow-sm"
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing PDF content...</span>
                    </div>
                  ) : message.isDual ? (
                    <div className="space-y-2 max-w-full">
                      {/* PDF Answer Card */}
                      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="flex items-center space-x-2 px-3 py-1.5 border-b border-gray-100">
                          <span className="flex items-center space-x-1.5 bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                            <FileText className="w-3 h-3" />
                            <span>PDF ANSWER</span>
                          </span>
                        </div>
                        <div
                          className="prose prose-sm max-w-none text-gray-800 px-3 py-2"
                          style={{ wordBreak: "break-word" }}
                          dangerouslySetInnerHTML={{ __html: formatMessage(message.pdfAnswer) }}
                        />
                      </div>

                      {/* AI Insights Card */}
                      {message.aiInsights && (
                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                          <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
                            <span className="flex items-center space-x-1.5 bg-purple-100 text-purple-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                              <Bot className="w-3 h-3" />
                              <span>AI INSIGHTS</span>
                            </span>
                            <span className="text-[10px] text-gray-400">General knowledge · not from PDF</span>
                          </div>
                          <div
                            className="prose prose-sm max-w-none text-gray-800 px-3 py-2"
                            style={{ wordBreak: "break-word" }}
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.aiInsights) }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="max-w-full">
                      <div
                        className={`prose prose-sm max-w-none ${
                          message.type === "user" ? "prose-invert" : ""
                        }`}
                        style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(message.content),
                        }}
                      />
                    </div>
                  )}{" "}
                  {isClient && (
                    <div className="text-xs mt-2 opacity-70">
                      {message.timestamp || ""}
                    </div>
                  )}{" "}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>{" "}
      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 py-3 flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Try asking:
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.text, action.mode)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-sm shadow-sm"
              >
                {action.icon}
                <span>{action.text}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            💡 You can ask for summaries, explanations, specific information, or
            analysis of your document.
          </div>
        </div>
      )}
      {/* Input Area - Fixed at bottom */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        {" "}
        <div className="flex items-end space-x-3">
          <div className="flex-1 min-h-[44px] max-h-32 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your PDF..."
              className="flex-1 bg-transparent border-none outline-none resize-none px-4 py-3 text-gray-700 placeholder-gray-500 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              rows={1}
              style={{
                minHeight: "44px",
                maxHeight: "128px",
                overflowY: "auto",
                lineHeight: "1.5",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 128) + "px";
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
              inputValue.trim() && !isLoading
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default PdfChatInterface;
