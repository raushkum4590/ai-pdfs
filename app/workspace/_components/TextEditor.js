import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'
import Editorextension from './Editorextension'

function TextEditor() {
    const editor = useEditor({
        extensions: [StarterKit,
            Placeholder.configure({
                placeholder:'start your not here....'
            })
        ],
       
        editorProps:{
        attributes: {
            class:'focus:outline-none h-screen p-5',
        }}
      })
      if (!editor) {
        return <div>Loading editor...</div>;
      }
  return (
    <div>
        <Editorextension editor={editor}/> 
        <div className='overflow-scroll h-[88vh]'>
        <EditorContent editor={editor} />
        </div>
    </div>
  )
}

export default TextEditor