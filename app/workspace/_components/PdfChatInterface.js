"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileText, Sparkles } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { chatSession } from '@/configs/AIModel';

const PdfChatInterface = () => {
  const { fileId } = useParams();  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI PDF Assistant powered by advanced language models. I can help you with:\n\n• Answering questions about your document\n• Providing summaries of sections or the entire document\n• Extracting key insights and information\n• Explaining complex concepts\n• Finding specific details\n\nWhat would you like to know about your document?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const SearchAI = useAction(api.myActions.search);
  const GetFullPdfContent = useAction(api.myActions.getFullPdfContent);  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: 'Analyzing PDF content...',
      isLoading: true,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Search for relevant content in PDF
      const result = await SearchAI({
        query: inputValue,
        fileId: fileId,
      });

      const searchResults = JSON.parse(result);
      let pdfContent = '';
      searchResults?.forEach((item) => {
        pdfContent += item.pageContent + ' ';
      });

      if (!pdfContent) {
        throw new Error('No relevant content found in the PDF.');
      }      // Generate AI response with enhanced prompt
      const PROMPT = `
        You are an advanced AI assistant specialized in document analysis. Based on the user's question: "${inputValue}" 
        and the following PDF content: "${pdfContent}", 
        
        Please provide a comprehensive, well-structured answer that:
        1. Directly addresses the user's question using information from the PDF
        2. Organizes information with clear sections and bullet points
        3. Provides specific examples and details from the document
        4. Uses a professional yet conversational tone
        5. If the PDF doesn't contain the requested information, clearly state this and suggest related topics that are covered
        
        Format your response clearly with:
        - Main points as bullet points
        - Use **bold** for emphasis
        - Include relevant quotes from the PDF when applicable
        - End with a brief summary if the response is long
        
        If the question is about:
        - Summarization: Provide a structured summary with key points
        - Specific facts: Give precise answers with page references if possible
        - Analysis: Provide deeper insights and interpretation
        - Explanation: Break down complex concepts into understandable parts
        - **Bold headings** for main sections
        - * Bullet points for key information
        - Clear paragraph breaks
        - Logical organization and flow
        
        Make it educational, detailed, and easy to follow like an academic explanation.
      `;

      const aiResponse = await chatSession.sendMessage(PROMPT);
      const aiAnswer = aiResponse.response?.text() || 'Sorry, I couldn\'t generate a response. Please try again.';

      // Remove loading message and add AI response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        return [...filteredMessages, {
          id: Date.now() + 2,
          type: 'bot',
          content: aiAnswer,
          timestamp: new Date().toLocaleTimeString(),
          sourceText: pdfContent.substring(0, 200) + '...' // Show snippet of source
        }];
      });

    } catch (error) {
      console.error('Error:', error);
      
      // Remove loading message and add error
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        return [...filteredMessages, {
          id: Date.now() + 2,
          type: 'bot',
          content: 'Sorry, I encountered an error while analyzing the PDF. Please check your connection and try again.',
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li><strong>$1.</strong> $2</li>')
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
      .split('\n\n')
      .map(paragraph => paragraph.includes('<ul>') ? paragraph : `<p>${paragraph}</p>`)
      .join('');
  };

  const quickActions = [
    { text: "Summarize this document", icon: <FileText size={16} /> },
    { text: "What are the main points?", icon: <Sparkles size={16} /> },
    { text: "Explain the key concepts", icon: <Bot size={16} /> },
  ];

  const handleQuickAction = (text) => {
    setInputValue(text);
    inputRef.current?.focus();
  };  return (
    <div className="chat-container bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">PDF Analysis Assistant</h2>
            <p className="text-sm text-gray-500">Ask me anything about your document</p>
          </div>
        </div>
      </div>      {/* Messages Container - Scrollable */}
      <div className="chat-messages p-4 space-y-4 chat-scroll">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-green-400 to-blue-500 ml-3' 
                  : 'bg-gradient-to-r from-purple-400 to-pink-500 mr-3'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : message.isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>              {/* Message Content */}
              <div className={`rounded-2xl px-4 py-3 max-w-full ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : message.isError
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
              }`}>
                {message.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing PDF content...</span>
                  </div>
                ) : (
                  <div className="max-w-full">                    <div 
                      className={`prose prose-sm max-w-none ${
                        message.type === 'user' ? 'prose-invert' : ''
                      }`}
                      style={{ 
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxHeight: message.type === 'bot' ? '300px' : 'none',
                        overflowY: message.type === 'bot' && message.content.length > 500 ? 'auto' : 'visible'
                      }}
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                    {message.sourceText && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500 flex items-center space-x-1">
                          <FileText size={12} />
                          <span className="truncate">Source: {message.sourceText}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="text-xs mt-2 opacity-70">
                  {message.timestamp}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 py-3 flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-100">
          <div className="text-sm font-medium text-gray-700 mb-3">Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.text)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-sm shadow-sm"
              >
                {action.icon}
                <span>{action.text}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            💡 You can ask for summaries, explanations, specific information, or analysis of your document.
          </div>
        </div>
      )}

      {/* Input Area - Fixed at bottom */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">        <div className="flex items-end space-x-3">
          <div className="flex-1 min-h-[44px] max-h-32 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your PDF..."
              className="flex-1 bg-transparent border-none outline-none resize-none px-4 py-3 text-gray-700 placeholder-gray-500 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              rows={1}
              style={{ 
                minHeight: '44px',
                maxHeight: '128px',
                overflowY: 'auto',
                lineHeight: '1.5'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
