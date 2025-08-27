'use client'

import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface RichContentRendererProps {
  content: string
  inlineImages?: any[]
  className?: string
}

const renderNode = (node: any, index: string | number, inlineImages?: any[]): React.ReactNode => {
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
            renderNode(child, `${index}-${childIndex}`, inlineImages)
          )}
        </div>
      )

    case 'paragraph':
      return (
        <p key={index} className="mb-4 leading-relaxed text-gray-900 dark:text-gray-100">
          {content?.map((child: any, childIndex: number) => 
            renderNode(child, `${index}-${childIndex}`, inlineImages)
          )}
        </p>
      )

    case 'heading':
      const level = attrs?.level || 1
      const headingClasses = {
        1: 'text-3xl font-bold mb-6 mt-8 text-gray-900 dark:text-white',
        2: 'text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-white',
        3: 'text-xl font-bold mb-3 mt-5 text-gray-900 dark:text-white',
        4: 'text-lg font-bold mb-2 mt-4 text-gray-900 dark:text-white',
        5: 'text-base font-bold mb-2 mt-3 text-gray-900 dark:text-white',
        6: 'text-sm font-bold mb-1 mt-2 text-gray-900 dark:text-white'
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
          renderNode(child, `${index}-${childIndex}`, inlineImages)
        )
      )

    case 'bulletList':
      return (
        <ul key={index} className="list-disc list-inside mb-4 space-y-1 text-gray-900 dark:text-gray-100">
          {content?.map((child: any, childIndex: number) => 
            renderNode(child, `${index}-${childIndex}`, inlineImages)
          )}
        </ul>
      )

    case 'orderedList':
      return (
        <ol key={index} className="list-decimal list-inside mb-4 space-y-1 text-gray-900 dark:text-gray-100">
          {content?.map((child: any, childIndex: number) => 
            renderNode(child, `${index}-${childIndex}`, inlineImages)
          )}
        </ol>
      )

    case 'listItem':
      return (
        <li key={index} className="leading-relaxed text-gray-900 dark:text-gray-100">
          {content?.map((child: any, childIndex: number) => 
            renderNode(child, `${index}-${childIndex}`, inlineImages)
          )}
        </li>
      )

    case 'blockquote':
      return (
        <blockquote key={index} className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 dark:bg-blue-900/20 italic text-gray-900 dark:text-gray-100">
          {content?.map((child: any, childIndex: number) => 
            renderNode(child, `${index}-${childIndex}`, inlineImages)
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
      const src = attrs?.src || ''
      const alt = attrs?.alt || ''
      const title = attrs?.title || ''
      const imageId = attrs?.['data-image-id'] || ''
      
      // If we have image metadata and it's an inline image, ensure URL is correct
      let finalSrc = src
      if (imageId && inlineImages) {
        const imageMetadata = inlineImages.find(img => img.imageId === imageId)
        if (imageMetadata) {
          finalSrc = imageMetadata.fileUrl
        }
      }
      
      // Fallback handling for missing images
      if (!finalSrc) {
        return (
          <div key={index} className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center my-4">
            <p className="text-gray-500 text-sm">Image not available</p>
          </div>
        )
      }
      
      return (
        <div key={index} className="my-6 text-center">
          <div className="relative inline-block">
            <img
              src={finalSrc}
              alt={alt}
              title={title}
              className="max-w-full h-auto rounded-lg shadow-md mx-auto cursor-pointer hover:shadow-lg transition-shadow"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = '<div class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center my-4"><p class="text-gray-500 text-sm">Image failed to load</p></div>'
                }
              }}
              onClick={() => window.open(finalSrc, '_blank')}
            />
            <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
              <a
                href={finalSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70 transition-all"
                title="Open full size"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          {alt && (
            <p className="text-sm text-gray-600 mt-2 italic">{alt}</p>
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
              renderNode(child, `${index}-${childIndex}`, inlineImages)
            )}
          </div>
        )
      }
      return null
  }
}

export default function RichContentRenderer({ content, inlineImages = [], className = "" }: RichContentRendererProps) {
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
      {renderNode(parsedContent, 'root', inlineImages)}
    </div>
  )
}
