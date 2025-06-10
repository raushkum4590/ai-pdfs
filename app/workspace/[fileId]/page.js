"use client"
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import WorkspaceHeader from '../_components/WorkspaceHeader';
import PdfViewer from '../_components/PdfViewer';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import PdfChatInterface from '../_components/PdfChatInterface';

function Workspace() {
   const {fileId}=useParams();
   const fileInfo=useQuery(api.fileStorage.GetFileRecord,{
    fileId: fileId
   })
   
   useEffect(()=>{
      console.log(fileInfo)
   },[fileInfo])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
        <WorkspaceHeader/>

        {/* Main Content Area - Chat Only */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-2 gap-0">
            {/* Left Panel - PDF Viewer */}
            <div className="border-r border-gray-200 bg-gray-100 flex flex-col">
              <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">📄 PDF Document</span>
                  {fileInfo?.fileName && (
                    <span className="text-sm text-gray-600 truncate max-w-xs">
                      {fileInfo.fileName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <PdfViewer fileUrl={fileInfo?.fileUrl} />
              </div>
            </div>
              {/* Right Panel - Chat Interface */}
            <div className="bg-white flex flex-col h-full min-h-0">
              <PdfChatInterface />
            </div>
          </div>
        </div>
    </div>
  )
}

export default Workspace