# Rich Text Editor Implementation

This document describes the rich text editor implementation for the NSUT Stats blog platform.

## Features

### Rich Text Editor (Create/Edit Pages)
- **Text Formatting**: Bold, italic, underline, headings (H1, H2, H3)
- **Lists**: Bullet lists and ordered lists
- **Code Blocks**: Syntax-highlighted code blocks with support for multiple languages
- **Images**: Drag & drop, paste, or click to upload images
- **Blockquotes**: Styled quote blocks
- **Auto-save**: Content is automatically saved as you type

### Post Viewer (Single Post Page)
- **Rich Content Rendering**: Displays formatted content exactly as authored
- **Syntax Highlighting**: Code blocks with proper syntax highlighting
- **Responsive Images**: Images scale properly on all devices
- **Fallback Support**: Gracefully handles both rich content and plain text posts

## Technical Implementation

### Dependencies Added
```json
{
  "@tiptap/react": "^2.0.0",
  "@tiptap/pm": "^2.0.0", 
  "@tiptap/starter-kit": "^2.0.0",
  "@tiptap/extension-image": "^2.0.0",
  "@tiptap/extension-code-block": "^2.0.0",
  "@tiptap/extension-code-block-lowlight": "^2.0.0",
  "lowlight": "^3.0.0",
  "react-syntax-highlighter": "^15.5.0",
  "highlight.js": "^11.9.0"
}
```

### Key Components

1. **RichTextEditor** (`src/components/RichTextEditor.tsx`)
   - Tiptap-based editor with custom toolbar
   - Image upload integration
   - Paste-to-upload functionality
   - Syntax highlighting for code blocks

2. **RichContentRenderer** (`src/components/RichContentRenderer.tsx`)
   - Renders Tiptap JSON content
   - Syntax highlighting for code blocks
   - Responsive image handling
   - Fallback to plain text

3. **Image Upload Utility** (`src/lib/imageUpload.ts`)
   - S3 upload integration
   - Automatic file naming
   - Error handling

### Database Schema Updates

The Post model now includes:
```javascript
richContent: {
  type: mongoose.Schema.Types.Mixed,
  default: null
}
```

### Environment Variables

Add these to your `.env` file:
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```

## Usage

### Creating Posts
1. Navigate to `/create`
2. Fill in title, category, and tags
3. Use the rich text editor to write content:
   - Click toolbar buttons for formatting
   - Paste images directly from clipboard
   - Drag & drop images into the editor
   - Use code block button for syntax-highlighted code
4. Upload additional files in the attachments section
5. Publish or save as draft

### Viewing Posts
- Rich content is automatically rendered on post pages
- Code blocks show syntax highlighting
- Images are responsive and optimized
- Fallback to plain text for older posts

## File Structure

```
src/
├── components/
│   ├── RichTextEditor.tsx      # Editor component
│   └── RichContentRenderer.tsx # Content renderer
├── lib/
│   └── imageUpload.ts          # S3 upload utilities
├── app/
│   ├── create/page.tsx         # Updated create page
│   └── posts/[id]/page.tsx     # Updated post viewer
└── models/
    └── Post.js                 # Updated schema
```

## Styling

The editor and rendered content use custom CSS classes:
- `.ProseMirror` - Editor styles
- `.prose` - Rendered content styles
- Syntax highlighting themes from `react-syntax-highlighter`

## Browser Support

- Modern browsers with ES6+ support
- File API for image uploads
- Clipboard API for paste-to-upload

## Performance Considerations

- Images are uploaded to S3 for better performance
- Code syntax highlighting is lazy-loaded
- Rich content is stored as JSON for efficient rendering
- Fallback mechanisms ensure backward compatibility

## Security

- Image uploads are validated and sanitized
- S3 uploads use signed URLs
- Content is sanitized before rendering
- Authentication required for post creation

## Future Enhancements

- Table support
- Math equation rendering
- Collaborative editing
- Version history
- Advanced image editing
- Custom themes for syntax highlighting
