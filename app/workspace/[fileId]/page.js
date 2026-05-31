"use client"
import { useParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import WorkspaceHeader from '../_components/WorkspaceHeader'
import PdfViewer from '../_components/PdfViewer'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import PdfChatInterface from '../_components/PdfChatInterface'
import StudyMode from '../_components/StudyMode'
import { Maximize2, Minimize2, FileText, MessageCircle, BookOpen } from 'lucide-react'

const SHADOW = '3px 3px 0 #000'

function Workspace() {
  const { fileId } = useParams()
  const fileInfo = useQuery(api.fileStorage.GetFileRecord, { fileId })
  const [expandedView, setExpandedView] = useState(null)
  const [rightPanel, setRightPanel] = useState('chat')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (fileInfo?.fileUrl) setIsLoading(false)
  }, [fileInfo])

  const toggleView = (view) => setExpandedView(prev => prev === view ? null : view)

  return (
    <div className="h-screen flex flex-col bg-yellow-50">
      <WorkspaceHeader fileInfo={fileInfo} />

      <div className="flex-1 overflow-hidden flex">

        {/* ── PDF Panel ── */}
        <div className={`flex flex-col transition-all duration-300 border-r-4 border-black ${
          expandedView === 'right' ? 'w-0 opacity-0 overflow-hidden' :
          expandedView === 'pdf'   ? 'w-full' : 'w-1/2'
        }`}>
          <div className="bg-blue-600 border-b-4 border-black px-4 py-2.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white border-2 border-black rounded-lg flex items-center justify-center"
                style={{ boxShadow: '2px 2px 0 #000' }}>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-black text-white text-sm uppercase">PDF Document</span>
              {fileInfo?.fileName && (
                <span className="hidden lg:inline bg-blue-500 border border-blue-300 text-blue-100 text-xs font-bold px-2 py-0.5 rounded-full truncate max-w-[160px]">
                  {fileInfo.fileName}
                </span>
              )}
            </div>
            <button onClick={() => toggleView('pdf')}
              className="w-7 h-7 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:-translate-y-0.5 transition-transform"
              style={{ boxShadow: '2px 2px 0 #000' }}>
              {expandedView === 'pdf' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>

          <div className="flex-1 overflow-hidden bg-gray-100">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-16 h-16 bg-yellow-400 border-3 border-black rounded-2xl flex items-center justify-center animate-bounce"
                  style={{ border: '3px solid #000', boxShadow: SHADOW }}>
                  <FileText className="w-8 h-8 text-black" />
                </div>
                <p className="font-black text-black uppercase text-sm">Loading PDF...</p>
              </div>
            ) : (
              <PdfViewer fileUrl={fileInfo?.fileUrl} />
            )}
          </div>
        </div>

        {/* ── Right Panel (Chat / Study Mode) ── */}
        <div className={`flex flex-col h-full min-h-0 transition-all duration-300 ${
          expandedView === 'pdf'   ? 'w-0 opacity-0 overflow-hidden' :
          expandedView === 'right' ? 'w-full' : 'w-1/2'
        }`}>
          {/* Panel header with tab switcher */}
          <div className={`border-b-4 border-black px-4 py-2.5 flex items-center justify-between flex-shrink-0 ${
            rightPanel === 'chat' ? 'bg-purple-600' : 'bg-gray-900'
          }`}>
            <div className="flex items-center gap-2">
              {/* Tab buttons */}
              <button onClick={() => setRightPanel('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase border-2 transition-all ${
                  rightPanel === 'chat'
                    ? 'bg-white text-purple-700 border-white'
                    : 'bg-transparent text-white border-white/30 hover:border-white/60'
                }`}>
                <MessageCircle size={12} />
                <span>Chat</span>
              </button>
              <button onClick={() => setRightPanel('study')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase border-2 transition-all ${
                  rightPanel === 'study'
                    ? 'bg-white text-gray-900 border-white'
                    : 'bg-transparent text-white border-white/30 hover:border-white/60'
                }`}>
                <BookOpen size={12} />
                <span>Study Mode</span>
                <span className="bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">NEW</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              {rightPanel === 'chat' && (
                <div className="flex items-center gap-1.5 bg-green-400 border-2 border-black rounded-full px-2 py-0.5">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-black uppercase">Live</span>
                </div>
              )}
              <button onClick={() => toggleView('right')}
                className="w-7 h-7 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:-translate-y-0.5 transition-transform"
                style={{ boxShadow: '2px 2px 0 #000' }}>
                {expandedView === 'right' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

          {rightPanel === 'chat' ? <PdfChatInterface /> : <StudyMode />}
        </div>
      </div>
    </div>
  )
}

export default Workspace
