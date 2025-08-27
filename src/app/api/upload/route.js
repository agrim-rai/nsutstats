import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { uploadFileToS3, generateFileName } from '@/lib/s3';

export async function POST(request) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/markdown',
      'text/html',
      'application/pdf',
      'application/json',
      'application/javascript',
      'text/css',
      'text/xml',
      'application/x-ipynb+json', // Jupyter Notebook
      'application/zip',           // ZIP files
      'application/x-zip-compressed', // Alternative ZIP MIME type
      'application/octet-stream'   // Fallback for .ipynb files that might not have correct MIME type
    ];

    // Additional validation for specific file extensions
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'txt', 'md', 'html', 'pdf', 'json', 'js', 'css', 'xml', 'ipynb', 'zip'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'File type not allowed. Supported types: images, documents, code files, Jupyter notebooks (.ipynb), and ZIP files' },
        { status: 400 }
      );
    }
    
    // Special handling for .ipynb files
    if (fileExtension === 'ipynb' && !file.type.includes('json') && file.type !== 'application/octet-stream') {
      return NextResponse.json(
        { error: 'Invalid Jupyter notebook file' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileName = generateFileName(file.name);
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3 with proper content type
    const fileUrl = await uploadFileToS3(buffer, fileName, file.type);

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: {
        fileName,
        originalName: file.name,
        fileUrl,
        fileSize: file.size,
        fileType: file.type
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
