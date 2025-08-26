'use client'

import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import { 
  Bold, 
  Italic, 
  Underline, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Image as ImageIcon,
  Undo,
  Redo
} from 'lucide-react'

// Import languages for syntax highlighting
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import sql from 'highlight.js/lib/languages/sql'

// Create lowlight instance
const lowlight = createLowlight()

// Register languages
lowlight.register('javascript', javascript)
lowlight.register('typescript', typescript)
lowlight.register('python', python)
lowlight.register('css', css)
lowlight.register('html', html)
lowlight.register('json', json)
lowlight.register('sql', sql)

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  onImageUpload?: (file: File) => Promise<string>
  placeholder?: string
  className?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-gray-200 p-4 bg-white rounded-t-lg">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded ${editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <button
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) {
                // This will be handled by the parent component
                const url = URL.createObjectURL(file)
                editor.chain().focus().setImage({ src: url }).run()
              }
            }
            input.click()
          }}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  onImageUpload,
  placeholder = "Start writing your content...",
  className = ""
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg bg-gray-900 text-gray-100 p-4 overflow-x-auto',
        },
      }),
    ],
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none p-4 min-h-[400px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    },
  })

  // Handle image uploads
  const handleImageUpload = async (file: File) => {
    if (onImageUpload) {
      try {
        const url = await onImageUpload(file)
        editor?.chain().focus().setImage({ src: url }).run()
      } catch (error) {
        console.error('Failed to upload image:', error)
      }
    }
  }

  // Handle paste events for images
  const handlePaste = (event: ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile()
          if (file && onImageUpload) {
            event.preventDefault()
            handleImageUpload(file)
          }
        }
      }
    }
  }

  // Add paste event listener
  React.useEffect(() => {
    const editorElement = editor?.view.dom
    if (editorElement) {
      editorElement.addEventListener('paste', handlePaste)
      return () => {
        editorElement.removeEventListener('paste', handlePaste)
      }
    }
  }, [editor, onImageUpload])

  if (!isMounted) {
    return (
      <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
        <div className="border-b border-gray-200 p-4 bg-white rounded-t-lg">
          <div className="flex flex-wrap gap-2">
            <div className="p-2 text-gray-400">
              <Undo className="h-4 w-4" />
            </div>
            <div className="p-2 text-gray-400">
              <Redo className="h-4 w-4" />
            </div>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <div className="p-2 text-gray-400">
              <Bold className="h-4 w-4" />
            </div>
            <div className="p-2 text-gray-400">
              <Italic className="h-4 w-4" />
            </div>
            <div className="p-2 text-gray-400">
              <Underline className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div className="p-4 min-h-[400px] bg-gray-50">
          <div className="text-gray-400">{placeholder}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className}`}>
      <MenuBar editor={editor} />
      <div className="relative">
        <EditorContent editor={editor} />
        {!editor?.getText() && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}
