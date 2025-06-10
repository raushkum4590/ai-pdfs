"use client"
import React, { useState, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Loader2Icon, Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import uuid4 from 'uuid4'
import { useUser } from '@clerk/nextjs'
import axios from 'axios'
  

function UploadPdfDialog({children,isMaxFile}) {

  const generateUploadUrl=useMutation(api.fileStorage.generateUploadUrl);
  const addFileEntery =useMutation(api.fileStorage.AddFileEntryToDb);
  const getFileUrl =useMutation(api.fileStorage.getFileUrl);
  const embeddDocument = useAction(api.myActions.ingest)
  const {user}=useUser();
  
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [open, setOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setFileName('');
    setError('');
    setSuccess(false);
    setUploadProgress(0);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      setError('Please select a file');
      return false;
    }
    
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file');
      return false;
    }
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return false;
    }
    
    setError('');
    return true;
  };

  const onFileSelect = (selectedFile) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      // Auto-generate filename from PDF name if not set
      if (!fileName) {
        const name = selectedFile.name.replace('.pdf', '');
        setFileName(name);
      }
    }
  };

  const handleFileInput = (event) => {
    const selectedFile = event.target.files[0];
    onFileSelect(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileName('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };  const onUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }
    
    if (!fileName.trim()) {
      setError('Please enter a file name');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setUploadProgress(10);

      const postUrl = await generateUploadUrl();
      setUploadProgress(25);

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) {
        throw new Error('Failed to upload file');
      }
      
      const { storageId } = await result.json();
      setUploadProgress(50);

      const fileId = uuid4();
      const fileUrl = await getFileUrl({ storageId });
      setUploadProgress(70);

      const createdBy = user?.primaryEmailAddress?.emailAddress || "Anonymous";
      await addFileEntery({
        fileId,
        storageId,
        fileName: fileName.trim(),
        fileUrl,
        createdBy,
      });
      setUploadProgress(85);

      // Process PDF for AI embedding
      const ApiResp = await axios.get('/api/pdf-loader?pdfUrl=' + fileUrl);
      await embeddDocument({
        splitText: ApiResp.data.result,
        fileId: fileId
      });
      setUploadProgress(100);

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        resetState();
      }, 1500);

    } catch (error) {
      console.error("Error during upload:", error);
      setError(error.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!loading) {
      setOpen(newOpen);
      if (!newOpen) {
        resetState();
      }
    }
  };
    return (
    <div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button 
            onClick={() => setOpen(true)} 
            disabled={isMaxFile} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-5 h-5" />
            <span>Upload PDF File</span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Upload PDF File</span>
            </DialogTitle>
            <DialogDescription>
              Upload a PDF file to start analyzing and chatting with your document using AI.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : file 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              
              {file ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="w-8 h-8" />
                    <span className="font-medium">File Selected</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm truncate max-w-48">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        disabled={loading}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drop your PDF here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse files
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    Maximum file size: 10MB
                  </div>
                </div>
              )}
            </div>

            {/* File Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                File Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter a descriptive name for your PDF"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                disabled={loading}
                className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">File uploaded successfully!</span>
              </div>
            )}            {/* Upload Progress */}
            {loading && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Processing your PDF...</span>
                  <span className="text-blue-600 font-semibold">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-3" />
                <div className="text-xs text-gray-500 text-center">
                  {uploadProgress < 30 && "Uploading file..."}
                  {uploadProgress >= 30 && uploadProgress < 60 && "Processing document..."}
                  {uploadProgress >= 60 && uploadProgress < 90 && "Analyzing content with AI..."}
                  {uploadProgress >= 90 && "Finalizing..."}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={onUpload} 
              disabled={loading || !file || !fileName.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UploadPdfDialog