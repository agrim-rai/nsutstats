import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import User from '@/models/User';
import { authenticateUser } from '@/lib/auth';

// GET comments for a post by slug
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    
    const skip = (page - 1) * limit;
    
    // Find post by slug
    const post = await Post.findOne({ slug });
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    const comments = await Comment.find({ post: post._id, parentComment: null })
      .populate('author', 'username avatar')
      .populate('likes', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Comment.countDocuments({ post: post._id, parentComment: null });
    
    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get comments by slug error:', error);
    return NextResponse.json(
      { error: 'server error' },
      { status: 500 }
    );
  }
}

// POST create new comment for post by slug
export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { slug } = await params;
    const { content, parentComment } = await request.json();
    
    // Validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    // Find post by slug
    const post = await Post.findOne({ slug });
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // If parent comment is provided, check if it exists
    if (parentComment) {
      const parentCommentDoc = await Comment.findById(parentComment);
      if (!parentCommentDoc) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }
    
    const comment = new Comment({
      content: content.trim(),
      author: user.userId,
      post: post._id,
      parentComment: parentComment || null
    });
    
    await comment.save();
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar');
    
    return NextResponse.json({
      message: 'Comment created successfully',
      comment: populatedComment
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create comment by slug error:', error);
    return NextResponse.json(
      { error: 'server error' },
      { status: 500 }
    );
  }
}
