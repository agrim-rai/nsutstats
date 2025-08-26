'use client'

import { useState } from 'react'
import RichTextEditor from '@/components/RichTextEditor'
import RichContentRenderer from '@/components/RichContentRenderer'

export default function DemoPage() {
  const [content, setContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Rich Text Editor Demo</h1>
        <p className="text-gray-600">
          This page demonstrates the rich text editor functionality. Try formatting text, adding images, and inserting code blocks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Editor</h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
          
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your content here... You can use the toolbar to format text, add headings, lists, code blocks, and images."
            className="min-h-[500px]"
          />
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="border border-gray-300 rounded-lg p-6 bg-white min-h-[500px] overflow-y-auto">
              {content ? (
                <RichContentRenderer content={content} />
              ) : (
                <p className="text-gray-400 italic">Start typing in the editor to see the preview...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Features List */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Editor Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Text Formatting</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Bold, italic, underline</li>
              <li>• Headings (H1, H2, H3)</li>
              <li>• Bullet and numbered lists</li>
              <li>• Blockquotes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Advanced Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Code blocks with syntax highlighting</li>
              <li>• Image upload and paste</li>
              <li>• Undo/redo functionality</li>
              <li>• Responsive design</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sample Content */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Content</h3>
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <RichContentRenderer 
            content={JSON.stringify({
              type: 'doc',
              content: [
                {
                  type: 'heading',
                  attrs: { level: 1 },
                  content: [{ type: 'text', text: 'Welcome to NSUT Stats' }]
                },
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'This is a ' },
                    { type: 'text', marks: [{ type: 'bold' }], text: 'rich text editor' },
                    { type: 'text', text: ' built with ' },
                    { type: 'text', marks: [{ type: 'code' }], text: 'Tiptap' },
                    { type: 'text', text: ' and Next.js.' }
                  ]
                },
                {
                  type: 'heading',
                  attrs: { level: 2 },
                  content: [{ type: 'text', text: 'Features' }]
                },
                {
                  type: 'bulletList',
                  content: [
                    {
                      type: 'listItem',
                      content: [{ type: 'text', text: 'Text formatting (bold, italic, underline)' }]
                    },
                    {
                      type: 'listItem',
                      content: [{ type: 'text', text: 'Headings and lists' }]
                    },
                    {
                      type: 'listItem',
                      content: [{ type: 'text', text: 'Code blocks with syntax highlighting' }]
                    },
                    {
                      type: 'listItem',
                      content: [{ type: 'text', text: 'Image upload and paste' }]
                    }
                  ]
                },
                {
                  type: 'heading',
                  attrs: { level: 2 },
                  content: [{ type: 'text', text: 'Code Example' }]
                },
                {
                  type: 'codeBlock',
                  attrs: { language: 'javascript' },
                  content: [{ type: 'text', text: 'function hello() {\n  console.log("Hello, World!");\n}\n\nhello();' }]
                },
                {
                  type: 'heading',
                  attrs: { level: 2 },
                  content: [{ type: 'text', text: 'Quote' }]
                },
                {
                  type: 'blockquote',
                  content: [{ type: 'text', text: 'Data is the new oil. - Clive Humby' }]
                }
              ]
            })}
          />
        </div>
      </div>
    </div>
  )
}
