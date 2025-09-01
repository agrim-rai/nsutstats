import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import { authenticateUser } from '@/lib/auth';
import { deleteFileFromS3 } from '@/lib/s3';

// GET single post by slug
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = await params;
    
    // Add timeout to database operations
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timed out')), 10000)
    );
    
    const postPromise = Post.findOne({ slug })
      .populate('author', 'username avatar bio')
      .populate('likes', 'username')
      .lean();
    
    const post = await Promise.race([postPromise, timeout]);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Increment views asynchronously to avoid blocking response
    Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } })
      .exec()
      .catch(error => console.error('Failed to increment views:', error));
    
    return NextResponse.json({ post });
    
  } catch (error) {
    console.error('Get post by slug error:', error);
    if (error.message === 'Database query timed out') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 408 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to load post. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT update post by slug
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
    
    const { slug } = await params;
    const { title, content, category, tags, featuredImage, status, attachments } = await request.json();
    
    const post = await Post.findOne({ slug });
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
    
    const updatedPost = await Post.findOne({ slug })
      .populate('author', 'username avatar');
    
    return NextResponse.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
    
  } catch (error) {
    console.error('Update post by slug error:', error);
    return NextResponse.json(
      { error: 'server error' },
      { status: 500 }
    );
  }
}

// DELETE post by slug
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
    
    const { slug } = await params;
    
    const post = await Post.findOne({ slug });
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
    
    await Post.findOneAndDelete({ slug });
    
    return NextResponse.json({
      message: 'Post deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete post by slug error:', error);
    return NextResponse.json(
      { error: 'server error' },
      { status: 500 }
    );
  }
}
