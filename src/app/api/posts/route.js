import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import { authenticateUser } from '@/lib/auth';

// GET all posts
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { status: 'published' };
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Use Promise.race to add timeout to database operations
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timed out')), 10000)
    );
    
    const postsPromise = Post.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance
    
    const totalPromise = Post.countDocuments(query);
    
    const [posts, total] = await Promise.race([
      Promise.all([postsPromise, totalPromise]),
      timeout
    ]);
    
    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Get posts error:', error);
    if (error.message === 'Database query timed out') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 408 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to load posts. Please try again.' },
      { status: 500 }
    );
  }
}

// POST create new post
export async function POST(request) {
  try {
    await connectDB();
    
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Users can create posts (not restricted to admin only)
    console.log('Creating post for user:', { userId: user.userId, role: user.role });
    
    const { title, content, richContent, category, tags, featuredImage, status, attachments, excerpt, readTime, inlineImages } = await request.json();
    
    // Validation
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }
    
    // Filter out any invalid inline images
    const validInlineImages = (inlineImages || []).filter(img => 
      img && img.imageId && img.fileName && img.fileUrl
    );

    const post = new Post({
      title,
      content,
      richContent: richContent || null,
      category,
      tags: tags || [],
      featuredImage: featuredImage || '',
      status: status || 'published',
      attachments: attachments || [],
      inlineImages: validInlineImages,
      excerpt: excerpt || content.substring(0, 200),
      readTime: readTime || Math.ceil(content.length / 200),
      author: user.userId
    });
    
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar');
    
    return NextResponse.json({
      message: 'Post created successfully',
      post: populatedPost
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create post error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: `Validation failed: ${errors.join(', ')}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create post. Please try again.' },
      { status: 500 }
    );
  }
}
