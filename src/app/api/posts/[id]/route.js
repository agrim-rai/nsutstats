import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { authenticateUser } from '@/lib/auth';
import { deleteFileFromS3 } from '@/lib/s3';

// GET single post
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const post = await Post.findById(id)
      .populate('author', 'username avatar bio')
      .populate('likes', 'username');
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Increment views
    post.views += 1;
    await post.save();
    
    return NextResponse.json({ post });
    
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update post
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
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
        { error: 'Admin access required to update posts' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    const { title, content, category, tags, featuredImage, status, attachments } = await request.json();
    
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags;
    if (featuredImage !== undefined) post.featuredImage = featuredImage;
    if (status) post.status = status;
    if (attachments) post.attachments = attachments;
    
    await post.save();
    
    const updatedPost = await Post.findById(id)
      .populate('author', 'username avatar');
    
    return NextResponse.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
    
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE post
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
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
        { error: 'Admin access required to delete posts' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Delete attached files from S3
    if (post.attachments && post.attachments.length > 0) {
      for (const attachment of post.attachments) {
        try {
          await deleteFileFromS3(attachment.fileName);
        } catch (error) {
          console.error('Failed to delete file from S3:', error);
        }
      }
    }
    
    await Post.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: 'Post deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
