'use client'

import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface RichContentRendererProps {
  content: string
  className?: string
}

const renderNode = (node: any, index: string | number): React.ReactNode => {
  if (typeof node === 'string') {
    return node
  }

  if (!node || typeof node !== 'object') {
    return null
  }

  const { type, content, attrs, marks } = node

  // Handle text nodes with marks
  if (type === 'text') {
    let text = node.text || ''
    
    if (marks) {
      marks.forEach((mark: any) => {
        switch (mark.type) {
          case 'bold':
            text = <strong key={`bold-${index}`}>{text}</strong>
            break
          case 'italic':
            text = <em key={`italic-${index}`}>{text}</em>
            break
          case 'underline':
            text = <u key={`underline-${index}`}>{text}</u>
            break
          case 'code':
            text = <code key={`code-${index}`} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{text}</code>
            break
        }
      })
    }
    
    return text
  }

  // Handle different node types
  switch (type) {
    case 'doc':
      return (
        <div key={index}>
          {content?.map((child: any, childIndex: number) => 
            renderNode(child, `${index}-${childIndex}`)
          )}
        </div>
      )

    case 'paragraph':
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {content?.map((child: any, childIndex: number) => 
            renderNode(child, `${index}-${childIndex}`)
          )}
        </p>
      )

    case 'heading':
      const level = attrs?.level || 1
      const headingClasses = {
        1: 'text-3xl font-bold mb-6 mt-8',
        2: 'text-2xl font-bold mb-4 mt-6',
        3: 'text-xl font-bold mb-3 mt-5',
        4: 'text-lg font-bold mb-2 mt-4',
        5: 'text-base font-bold mb-2 mt-3',
        6: 'text-sm font-bold mb-1 mt-2'
      }
      
      const HeadingComponent = level === 1 ? 'h1' : 
                              level === 2 ? 'h2' : 
                              level === 3 ? 'h3' : 
                              level === 4 ? 'h4' : 
                              level === 5 ? 'h5' : 'h6'
      
      return React.createElement(
        HeadingComponent,
        { 
          key: index, 
          className: headingClasses[level as keyof typeof headingClasses] 
        },
        content?.map((child: any, childIndex: number) => 
          renderNode(child, `${index}-${childIndex}`)
        )
      )

    case 'bulletList':
      return (
        <ul key={index} className="list-disc list-inside mb-4 space-y-1">
          {content?.map((child: any, childIndex: number) => 
            renderNode(child, `${index}-${childIndex}`)
          )}
        </ul>
      )

    case 'orderedList':
      return (
        <ol key={index} className="list-decimal list-inside mb-4 space-y-1">
          {content?.map((child: any, childIndex: number) => 
            renderNode(child, `${index}-${childIndex}`)
          )}
        </ol>
      )

    case 'listItem':
      return (
        <li key={index} className="leading-relaxed">
          {content?.map((child: any, childIndex: number) => 
            renderNode(child, `${index}-${childIndex}`)
          )}
        </li>
      )

    case 'blockquote':
      return (
        <blockquote key={index} className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 italic">
          {content?.map((child: any, childIndex: number) => 
            renderNode(child, `${index}-${childIndex}`)
          )}
        </blockquote>
      )

    case 'codeBlock':
      const language = attrs?.language || 'text'
      const codeContent = content?.[0]?.text || ''
      
      return (
        <div key={index} className="mb-6">
          <SyntaxHighlighter
            language={language}
            style={tomorrow}
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
            }}
            showLineNumbers={codeContent.split('\n').length > 5}
          >
            {codeContent}
          </SyntaxHighlighter>
        </div>
      )

    case 'image':
      return (
        <div key={index} className="my-6 text-center">
          <img
            src={attrs?.src}
            alt={attrs?.alt || ''}
            className="max-w-full h-auto rounded-lg shadow-md mx-auto"
            loading="lazy"
          />
          {attrs?.alt && (
            <p className="text-sm text-gray-600 mt-2 italic">{attrs.alt}</p>
          )}
        </div>
      )

    case 'horizontalRule':
      return <hr key={index} className="my-8 border-gray-300" />

    default:
      // For unknown node types, try to render content
      if (content) {
        return (
          <div key={index}>
            {content.map((child: any, childIndex: number) => 
              renderNode(child, `${index}-${childIndex}`)
            )}
          </div>
        )
      }
      return null
  }
}

export default function RichContentRenderer({ content, className = "" }: RichContentRendererProps) {
  if (!content) {
    return null
  }

  let parsedContent
  try {
    parsedContent = typeof content === 'string' ? JSON.parse(content) : content
  } catch (error) {
    console.error('Failed to parse rich content:', error)
    // Fallback to plain text
    return (
      <div className={`prose prose-lg max-w-none ${className}`}>
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    )
  }

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {renderNode(parsedContent, 'root')}
    </div>
  )
}
