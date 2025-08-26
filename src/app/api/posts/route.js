import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
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
    
    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments(query);
    
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
    return NextResponse.json(
      { error: 'server error ' },
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
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required to create posts' },
        { status: 403 }
      );
    }
    
    const { title, content, richContent, category, tags, featuredImage, status, attachments, excerpt, readTime } = await request.json();
    
    // Validation
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }
    
    const post = new Post({
      title,
      content,
      richContent: richContent || null,
      category,
      tags: tags || [],
      featuredImage: featuredImage || '',
      status: status || 'published',
      attachments: attachments || [],
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
    return NextResponse.json(
      { error: 'server error ' },
      { status: 500 }
    );
  }
}
