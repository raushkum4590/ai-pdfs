import { chatSession } from '@/configs/AIModel';
import { api } from '@/convex/_generated/api';
import { query } from '@/convex/_generated/server';

import { useAction } from 'convex/react';
import { Bold, Heading, Highlighter, Italic, ListOrdered, Quote, Sparkles, Table, Underline } from 'lucide-react';
import { useParams } from 'next/navigation';
import React from 'react';

function Editorextension({ editor }) {
  const {fileId}=useParams();

   const SearchAI=useAction(api.myActions.search)
   const onAiClick = async () => {
    try {
      // Get the selected text from the editor
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
        ''
      );
      console.log('Selected Text:', selectedText);
  
      if (!selectedText) {
        console.error('No text selected');
        return;
      }
  
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
      });
  
      if (!AllUnformattedAns) {
        console.error('No relevant content found in the PDF.');
        return;
      }
  
      // Add the PDF content to the editor in a structured manner
      const pdfContent = `<div style="border: 1px solid #ccc; padding: 15px; margin-top: 20px;">
                            <h3 style="text-align: center; color: #2c3e50;">Information from PDF:</h3>
                            <p style="font-style: italic;">(Extracted Content from PDF)</p>
                            <p>${AllUnformattedAns}</p>
                          </div>`;
  
      // Prompt AI to answer using both the question and extracted PDF content
      const PROMPT = `
        Based on the provided question: "${selectedText}" 
        and the following PDF content: "${AllUnformattedAns}", 
        generate an answer using both the PDF content and your AI understanding. 
        Provide a plain-text answer.
      `;
  
      // Get the AI's response
      const AiModelResult = await chatSession.sendMessage(PROMPT);
  
      // Extract and clean the AI's response
      const aiAnswer =
        AiModelResult.response?.text() ||
        'No response generated from the provided PDF content and AI understanding.';
      console.log('AI Response:', aiAnswer);
  
      // Generalized Structured AI Response
      const aiContent = `<div style="border: 1px solid #ccc; padding: 15px; margin-top: 20px;">
                          <h3 style="text-align: center; color: #16a085;">AI Generated Answer:</h3>
                          <p><strong>Answer to your query:</strong></p>
                          <p>${aiAnswer}</p>
                        </div>`;
  
      // Combine the current editor content with both PDF and AI-generated content
      const AllText = editor.getHTML();
      editor.commands.setContent(AllText + pdfContent + aiContent);
  
    } catch (error) {
      console.error('Error in onAiClick:', error);
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
          </button>
          <button
            onClick={() => onAiClick()}
            className={('hover:text-blue-500')}
          >
            <Sparkles/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Editorextension;
