"use client"
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import WorkspaceHeader from '../_components/WorkspaceHeader';
import PdfViewer from '../_components/PdfViewer';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import PdfChatInterface from '../_components/PdfChatInterface';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';

function Workspace() {
   const {fileId}=useParams();
   const fileInfo=useQuery(api.fileStorage.GetFileRecord,{
    fileId: fileId
   });
   const [expandedView, setExpandedView] = useState(null); // 'pdf', 'chat', or null for split view
   const [isLoading, setIsLoading] = useState(true);
   
   useEffect(() => {
      if (fileInfo?.fileUrl) {
        setIsLoading(false);
      }
   }, [fileInfo]);

  const toggleView = (view) => {
    if (expandedView === view) {
      setExpandedView(null); // Return to split view
    } else {
      setExpandedView(view); // Expand the selected view
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
        <WorkspaceHeader fileInfo={fileInfo} />

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Left Panel - PDF Viewer */}
            <div className={`border-r border-gray-200 bg-gray-100 flex flex-col transition-all duration-300 ease-in-out ${
              expandedView === 'chat' ? 'w-0 opacity-0 overflow-hidden' : 
              expandedView === 'pdf' ? 'w-full' : 'w-1/2'
            }`}>
              <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-gray-800">📄 PDF Document</span>
                    {fileInfo?.fileName && (
                      <span className="text-sm text-gray-600 truncate max-w-xs ml-3">
                        {fileInfo.fileName}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => toggleView('pdf')} 
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                    title={expandedView === 'pdf' ? "Exit fullscreen" : "Expand PDF view"}
                  >
                    {expandedView === 'pdf' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <PdfViewer fileUrl={fileInfo?.fileUrl} />
                )}
              </div>
            </div>

            {/* Right Panel - Chat Interface */}
            <div className={`bg-white flex flex-col h-full min-h-0 transition-all duration-300 ease-in-out ${
              expandedView === 'pdf' ? 'w-0 opacity-0 overflow-hidden' : 
              expandedView === 'chat' ? 'w-full' : 'w-1/2'
            }`}>
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">💬 AI Assistant</span>
                <button 
                  onClick={() => toggleView('chat')} 
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title={expandedView === 'chat' ? "Exit fullscreen" : "Expand chat view"}
                >
                  {expandedView === 'chat' ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
              <PdfChatInterface />
            </div>
          </div>
        </div>
    </div>
  )
}

export default Workspace