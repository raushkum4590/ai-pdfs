import { chatSession } from '@/configs/AIModel';
import { api } from '@/convex/_generated/api';
import { query } from '@/convex/_generated/server';

import { useAction } from 'convex/react';
import { Bold, Heading, Highlighter, Italic, ListOrdered, Quote, Sparkles, Table, Underline, FileText, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

function Editorextension({ editor }) {  
   const {fileId}=useParams();
   const [isLoadingAi, setIsLoadingAi] = useState(false);
   const [isLoadingFullPdf, setIsLoadingFullPdf] = useState(false);

   const SearchAI=useAction(api.myActions.search);
   const GetFullPdfContent=useAction(api.myActions.getFullPdfContent);
     const onAiClick = async () => {
    setIsLoadingAi(true);
    
    try {
      // Check if editor is available
      if (!editor) {
        console.error('Editor is not available');
        setIsLoadingAi(false);
        return;
      }

      // Get the selected text from the editor
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ''
      );
      console.log('Selected Text:', selectedText);
  
      if (!selectedText) {
        console.error('No text selected');
        alert('Please select text first before generating AI response.');
        setIsLoadingAi(false);
        return;
      }

      // Check if fileId is available
      if (!fileId) {
        console.error('No file ID available');
        setIsLoadingAi(false);
        return;
      }

      // Show initial loading message in editor
      const loadingContent = `<div style="border: 2px solid #f39c12; padding: 20px; margin-top: 20px; background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                               <h2 style="text-align: center; color: #f39c12; margin-bottom: 20px; font-size: 24px; font-weight: bold;">🔄 Generating AI Response...</h2>
                               <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                                 <div style="display: inline-block; animation: spin 1s linear infinite; font-size: 24px;">⚡</div>
                                 <p style="margin-top: 10px; color: #f39c12; font-weight: bold;">Analyzing PDF content and generating response...</p>
                                 <p style="color: #7f8c8d; font-size: 14px;">This may take a few seconds</p>
                               </div>
                             </div>
                             <style>
                               @keyframes spin {
                                 0% { transform: rotate(0deg); }
                                 100% { transform: rotate(360deg); }
                               }
                             </style>`;
      
      const currentText = editor.getHTML();
      editor.commands.setContent(currentText + loadingContent);
  
      // Fetch content from the PDF based on fileId
      const result = await SearchAI({
        query: selectedText,
        fileId: fileId, // Ensure this identifies the correct PDF
      });
  
      const UnformattedAns = JSON.parse(result);
  
      // Combine all content from the PDF search results
      let AllUnformattedAns = '';
      UnformattedAns?.forEach((item) => {
        AllUnformattedAns += item.pageContent;
      });      if (!AllUnformattedAns) {
        console.error('No relevant content found in the PDF.');
        return;
      }

      // Prompt AI to answer using both the question and extracted PDF content with structured formatting
      const PROMPT = `
        Based on the provided question: "${selectedText}" 
        and the following PDF content: "${AllUnformattedAns}", 
        
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
      
      // Get the AI's response
      let AiModelResult;
      let aiAnswer = 'Unable to generate AI response.';
      
      try {
        AiModelResult = await chatSession.sendMessage(PROMPT);
        aiAnswer = AiModelResult.response?.text() || 'No response generated from the AI model.';
      } catch (aiError) {
        console.error('AI Model Error:', aiError);
        aiAnswer = 'Error generating AI response. Please check your API configuration.';
      }
        // Process AI response to convert markdown-like formatting to HTML
      const formatAiResponse = (text) => {
        return text
          // Convert **bold** to <strong>
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          // Convert * bullet points to <li>
          .replace(/^\* (.*$)/gim, '<li>$1</li>')
          // Convert numbered points
          .replace(/^(\d+)\. (.*$)/gim, '<li><strong>$1.</strong> $2</li>')
          // Wrap consecutive <li> items in <ul>
          .replace(/(<li>.*<\/li>)(?:\s*<li>.*<\/li>)*/g, (match) => `<ul>${match}</ul>`)
          // Convert double line breaks to paragraphs
          .replace(/\n\n/g, '</p><p>')
          // Wrap in paragraph tags
          .replace(/^(.*)$/gm, '<p>$1</p>')
          // Clean up empty paragraphs
          .replace(/<p><\/p>/g, '')
          // Clean up nested lists
          .replace(/<\/ul><ul>/g, '');
      };

      const formattedAiAnswer = formatAiResponse(aiAnswer);
      console.log('AI Response:', aiAnswer);
  
      // Enhanced Structured AI Response with better styling
      const aiContent = `<div style="border: 2px solid #16a085; padding: 20px; margin-top: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                          <h2 style="text-align: center; color: #16a085; margin-bottom: 20px; font-size: 24px; font-weight: bold;">🤖 AI Generated Analysis</h2>
                          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="line-height: 1.8; font-size: 16px; color: #2c3e50;">
                              ${formattedAiAnswer}
                            </div>
                          </div>
                          <div style="margin-top: 15px; padding: 10px; background: #e8f5e8; border-radius: 5px; border-left: 4px solid #16a085;">
                            <small style="color: #16a085; font-weight: bold;">📄 Source: Content extracted from your uploaded PDF</small>
                          </div>                        </div>`;      // Remove loading content and add AI response
      const finalText = currentText + aiContent;
      editor.commands.setContent(finalText);
      
      setIsLoadingAi(false);
  
    } catch (error) {
      console.error('Error in onAiClick:', error);
      
      // Remove loading and show error
      const errorContent = `<div style="border: 2px solid #e74c3c; padding: 20px; margin-top: 20px; background: linear-gradient(135deg, #fdf2f2 0%, #fce4e4 100%); border-radius: 10px;">
                              <h2 style="text-align: center; color: #e74c3c; margin-bottom: 15px;">❌ Error</h2>
                              <p style="color: #e74c3c; text-align: center;">An error occurred while processing your request. Please try again.</p>
                            </div>`;
      
      const currentTextError = editor.getHTML();
      editor.commands.setContent(currentTextError + errorContent);
      
      setIsLoadingAi(false);
      alert('An error occurred while processing your request. Please try again.');
    }
  };
  const onReadFullPdf = async () => {
    setIsLoadingFullPdf(true);
    
    try {
      // Check if editor is available
      if (!editor) {
        console.error('Editor is not available');
        setIsLoadingFullPdf(false);
        return;
      }

      // Check if fileId is available
      if (!fileId) {
        console.error('No file ID available');
        setIsLoadingFullPdf(false);
        return;
      }

      // Show loading message
      const loadingContent = `<div style="border: 2px solid #3498db; padding: 20px; margin-top: 20px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                               <h2 style="text-align: center; color: #3498db; margin-bottom: 20px; font-size: 24px; font-weight: bold;">📄 Loading Full PDF...</h2>
                               <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                                 <div style="display: inline-block; animation: spin 1s linear infinite; font-size: 24px;">📖</div>
                                 <p style="margin-top: 10px; color: #3498db; font-weight: bold;">Extracting complete document content...</p>
                               </div>
                             </div>`;
      
      const initialText = editor.getHTML();
      editor.commands.setContent(initialText + loadingContent);
  
      // Fetch all content from the PDF
      const result = await GetFullPdfContent({
        fileId: fileId,
      });
  
      const fullPdfContent = JSON.parse(result);
  
      // Combine all content from the PDF
      let allContent = '';
      fullPdfContent?.forEach((item) => {
        allContent += item.pageContent + '\n\n';
      });
  
      if (!allContent) {
        console.error('No content found in the PDF.');
        return;
      }
  
      // Add the full PDF content to the editor with enhanced styling
      const pdfContent = `<div style="border: 2px solid #3498db; padding: 20px; margin-top: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="text-align: center; color: #2c3e50; margin-bottom: 15px; font-size: 24px; font-weight: bold;">📄 Complete PDF Content</h2>
                            <div style="max-height: 500px; overflow-y: auto; padding: 20px; background: white; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                              <div style="white-space: pre-wrap; font-family: 'Georgia', serif; line-height: 1.8; font-size: 15px; color: #2c3e50;">
                                ${allContent}
                              </div>
                            </div>
                            <div style="margin-top: 15px; padding: 10px; background: #e8f4fd; border-radius: 5px; border-left: 4px solid #3498db;">
                              <small style="color: #3498db; font-weight: bold;">📖 Full document content extracted from your PDF</small>
                            </div>                          </div>`;
  
      // Remove loading and add the full PDF content
      const finalText = initialText + pdfContent;
      editor.commands.setContent(finalText);
      
      setIsLoadingFullPdf(false);
  
    } catch (error) {
      console.error('Error in onReadFullPdf:', error);
      
      // Remove loading and show error
      const errorContent = `<div style="border: 2px solid #e74c3c; padding: 20px; margin-top: 20px; background: linear-gradient(135deg, #fdf2f2 0%, #fce4e4 100%); border-radius: 10px;">
                              <h2 style="text-align: center; color: #e74c3c; margin-bottom: 15px;">❌ Error Loading PDF</h2>
                              <p style="color: #e74c3c; text-align: center;">Unable to load full PDF content. Please try again.</p>
                            </div>`;
      
      const initialTextError = editor.getHTML();
      editor.commands.setContent(initialTextError + errorContent);
      
      setIsLoadingFullPdf(false);
      alert('An error occurred while reading the full PDF. Please try again.');
    }
  };
  
  return editor&& (
    <div className="p-5">
      <div className="control-group " >
        <div className="button-group flex gap-5">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'text-blue-500' : ''}
          >
            <Bold />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            <Italic />
           
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          >
            <Heading/>
        
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'is-active' : ''}
          >
            <Underline/>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'is-active' : ''}
          >
            <Highlighter/>
          </button>
          <button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          >
            <Table/>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
          >
            <ListOrdered/>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'is-active' : ''}
          >
            <Quote/>
          </button>          <button
            onClick={() => onAiClick()}
            className={`${isLoadingAi ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'}`}
            title="AI Answer from PDF (select text first)"
            disabled={isLoadingAi}
          >
            {isLoadingAi ? <Loader2 className="animate-spin" /> : <Sparkles/>}
          </button>
          <button
            onClick={() => onReadFullPdf()}
            className={`${isLoadingFullPdf ? 'opacity-50 cursor-not-allowed' : 'hover:text-green-500'}`}
            title="Read Full PDF Content"
            disabled={isLoadingFullPdf}
          >
            {isLoadingFullPdf ? <Loader2 className="animate-spin" /> : <FileText/>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Editorextension;
