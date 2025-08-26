import { NextRequest, NextResponse } from 'next/server'
import { uploadInlineImageToS3 } from '@/lib/s3'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Generate unique image ID for tracking
    const imageId = uuidv4()
    
    // Upload to S3 in attachments folder
    const fileData = await uploadInlineImageToS3(file, imageId)
    
    return NextResponse.json({ 
      message: 'Inline image uploaded successfully',
      imageId,
      file: fileData
    })
  } catch (error) {
    console.error('Inline image upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed: ' + error.message 
    }, { status: 500 })
  }
}
