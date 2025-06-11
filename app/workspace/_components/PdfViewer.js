import React, { useState, useEffect } from 'react'
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react'

function PdfViewer({fileUrl}) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (fileUrl) {
      // Reset states when a new PDF is loaded
      setIsLoading(true);
      setZoomLevel(100);
      setRotation(0);
    }
  }, [fileUrl]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No PDF document loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* PDF Controls */}
      <div className="flex items-center justify-center space-x-4 py-2 bg-gray-50 border-b border-gray-200">
        <button 
          onClick={handleZoomOut}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <span className="text-sm font-medium">{zoomLevel}%</span>
        <button 
          onClick={handleZoomIn}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          onClick={handleRotate}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          title="Rotate"
        >
          <RotateCw size={18} />
        </button>
      </div>
      
      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-gray-100 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-sm text-blue-600">Loading PDF...</p>
            </div>
          </div>
        )}
        
        <div 
          style={{ 
            transform: `scale(${zoomLevel/100}) rotate(${rotation}deg)`, 
            transformOrigin: 'center center',
            height: '100%'
          }}
          className="transition-transform duration-200 ease-in-out"
        >
          <iframe 
            src={fileUrl+"#toolbar=0"} 
            height='100%' 
            width='100%' 
            className='h-full border-none'
            onLoad={handleIframeLoad}
            title="PDF Document Viewer"
          />
        </div>
      </div>
    </div>
  )
}

export default PdfViewer