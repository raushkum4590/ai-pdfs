"use client"
import React, { useState, useRef, useEffect } from 'react';
import { chatSession } from '@/configs/AIModel';
import { api } from '@/convex/_generated/api';
import { useAction } from 'convex/react';
import { useParams } from 'next/navigation';
import { Send, Bot, User, FileText, Loader2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ChatInterface() {
  const { fileId } = useParams();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "👋 Hi! I'm your PDF analysis assistant. Ask me anything about your uploaded document and I'll provide detailed insights based on the content.",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const SearchAI = useAction(api.myActions.search);
  const GetFullPdfContent = useAction(api.myActions.getFullPdfContent);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatAiResponse = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li><strong>$1.</strong> $2</li>')
      .replace(/(<li>.*<\/li>)(?:\s*<li>.*<\/li>)*/g, (match) => `<ul class="list-disc pl-4 space-y-1">${match}</ul>`)
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/^(.*)$/gm, '<p class="mb-2">$1</p>')
      .replace(/<p class="mb-2"><\/p>/g, '')
      .replace(/<\/ul><ul class="list-disc pl-4 space-y-1">/g, '');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: 'loading',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Search PDF content
      const result = await SearchAI({
        query: inputMessage,
        fileId: fileId,
      });

      const searchResults = JSON.parse(result);
      let pdfContent = '';
      searchResults?.forEach((item) => {
        pdfContent += item.pageContent + ' ';
      });

      if (!pdfContent) {
        throw new Error('No relevant content found in the PDF.');
      }

      // Generate AI response
      const PROMPT = `
        Based on the user's question: "${inputMessage}" 
        and the following PDF content: "${pdfContent}", 
        
        Please provide a comprehensive, well-structured answer that:
        1. Uses the PDF content as the primary source
        2. Organizes information with clear headings and subheadings
        3. Uses bullet points and numbering for clarity
        4. Includes specific details from the PDF
        5. Adds broader context when relevant
        
        Format your response with:
        - **Bold headings** for main sections
        - * Bullet points for key information
        - Clear paragraph breaks
        - Logical organization and flow
        
        Make it educational, detailed, and easy to follow like an academic explanation.
      `;

      const aiResult = await chatSession.sendMessage(PROMPT);
      const aiResponse = aiResult.response?.text() || 'Unable to generate response.';

      // Remove loading message and add AI response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.content !== 'loading');
        return [...filtered, {
          id: Date.now() + 2,
          type: 'bot',
          content: aiResponse,
          timestamp: new Date(),
          pdfSource: pdfContent.substring(0, 200) + '...',
        }];
      });

    } catch (error) {
      console.error('Error:', error);
      
      // Remove loading message and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.content !== 'loading');
        return [...filtered, {
          id: Date.now() + 3,
          type: 'bot',
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
          timestamp: new Date(),
          isError: true,
        }];
      });
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.replace(/<[^>]*>/g, ''));
  };
  const suggestedQuestions = [
    "📋 What are the main topics covered in this document?",
    "🔍 Can you summarize the key findings?",
    "⭐ What are the most important points to remember?",
    "🔬 Explain the methodology used in this document",
    "💡 What conclusions does this document reach?",
    "📊 Are there any statistics or data mentioned?",
    "🎯 What is the purpose of this document?"
  ];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">PDF Analysis Assistant</h2>
            <p className="text-sm text-gray-500">Ask questions about your document</p>
          </div>
          <div className="ml-auto">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div 
            key={message.id} 
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            style={{
              animationDelay: `${index * 0.1}s`,
              animation: 'slideUp 0.3s ease-out forwards'
            }}
          >
            <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                  : message.isError 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-600'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={`rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                  : message.isError
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-white border border-gray-200'
              }`}>
                {message.content === 'loading' ? (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm">Analyzing PDF content...</span>
                  </div>
                ) : (
                  <>
                    <div 
                      className={`prose prose-sm max-w-none ${message.type === 'user' ? 'text-white prose-invert' : 'text-gray-800'}`}
                      dangerouslySetInnerHTML={{ 
                        __html: message.type === 'bot' ? formatAiResponse(message.content) : message.content 
                      }}
                    />
                    
                    {/* Message Actions */}
                    {message.type === 'bot' && message.content !== 'loading' && !message.isError && (
                      <>
                        {message.pdfSource && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-center space-x-2 text-blue-700 text-xs font-medium mb-1">
                              <FileText className="w-3 h-3" />
                              <span>Source from PDF:</span>
                            </div>
                            <p className="text-xs text-blue-600 italic">{message.pdfSource}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.content)}
                            className="h-6 px-2 text-xs hover:bg-blue-50 transition-colors"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-green-50 transition-colors">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-red-50 transition-colors">
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
                
                <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Suggested Questions (show when no messages except welcome) */}
        {messages.length === 1 && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg animate-fade-in">
            <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Try asking these questions:
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-md"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'slideUp 0.3s ease-out forwards'
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about your PDF document..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
              rows="2"
              disabled={isLoading}
              maxLength={1000}
            />
            {inputMessage && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {inputMessage.length}/1000
              </div>
            )}
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span className="flex items-center space-x-1">
            <span>💡</span>
            <span>Press Enter to send, Shift+Enter for new line</span>
          </span>
          <span className="text-gray-400">Powered by AI</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

export default ChatInterface;
