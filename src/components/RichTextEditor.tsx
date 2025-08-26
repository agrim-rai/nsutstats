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
import { uploadInlineImageToS3 } from '@/lib/imageUpload'

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
  onInlineImageUpload?: (imageId: string, imageData: any) => void
  placeholder?: string
  className?: string
}

const MenuBar = ({ editor, onImageUpload, isUploading }: { editor: any, onImageUpload?: () => void, isUploading: boolean }) => {
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
          onClick={onImageUpload}
          disabled={isUploading}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
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
  onInlineImageUpload,
  placeholder = "Start writing your content...",
  className = ""
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const handlePasteImage = React.useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return false
    
    setIsUploading(true)
    try {
      const { imageId, fileUrl } = await uploadInlineImageToS3(file)
      
      // Store image metadata for later saving with post
      if (onInlineImageUpload) {
        onInlineImageUpload(imageId, {
          imageId,
          fileName: `${imageId}-${file.name}`,
          originalName: file.name,
          fileUrl,
          fileSize: file.size,
          fileType: file.type,
        })
      }
      
      // Insert image then attach special data attribute for tracking
      editor?.chain()
        .focus()
        .setImage({ src: fileUrl, alt: file.name })
        .updateAttributes('image', { 'data-image-id': imageId })
        .run()
      
      return true
    } catch (error) {
      console.error('Failed to upload pasted image:', error)
      return false
    } finally {
      setIsUploading(false)
    }
  }, [onInlineImageUpload])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md my-4',
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
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || [])
        
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (file) {
              event.preventDefault()
              handlePasteImage(file)
              return true
            }
          }
        }
        
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    },
  })

  // Handle image uploads
  const handleImageUpload = React.useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsUploading(true)
        try {
          // Use inline image upload for consistency
          const { imageId, fileUrl } = await uploadInlineImageToS3(file)
          
          // Store image metadata for later saving with post
          if (onInlineImageUpload) {
            onInlineImageUpload(imageId, {
              imageId,
              fileName: `${imageId}-${file.name}`,
              originalName: file.name,
              fileUrl,
              fileSize: file.size,
              fileType: file.type,
            })
          }
          
          // Insert image then attach special data attribute for tracking
          editor?.chain()
            .focus()
            .setImage({ src: fileUrl, alt: file.name })
            .updateAttributes('image', { 'data-image-id': imageId })
            .run()
        } catch (error) {
          console.error('Image upload failed:', error)
        } finally {
          setIsUploading(false)
        }
      }
    }
    input.click()
  }, [editor, onInlineImageUpload])

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
      <MenuBar editor={editor} onImageUpload={handleImageUpload} isUploading={isUploading} />
      
      {/* Image Upload Status */}
      {isUploading && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-600">Uploading image...</span>
          </div>
        </div>
      )}
      
      <div className="relative">
        <EditorContent editor={editor} />
        {!editor?.getText() && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
      
      {/* Help text */}
      <div className="px-4 pb-3 text-xs text-gray-500 border-t border-gray-200">
        💡 Tip: You can paste images directly from your clipboard (Ctrl+V / Cmd+V) or use the image button above
      </div>
    </div>
  )
}