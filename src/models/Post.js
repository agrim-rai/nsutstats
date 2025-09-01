 import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  }
})

const inlineImageSchema = new mongoose.Schema({
  imageId: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
})

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 250
  },
  content: {
    type: String,
    required: true,
    minlength: 10
  },
  richContent: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  excerpt: {
    type: String,
    maxlength: 300,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  featuredImage: {
    type: String,
    default: ''
  },
  attachments: [attachmentSchema],
  inlineImages: [inlineImageSchema],
  readTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Helper function to generate slug from title
function generateSlug(title) {
  let slug = title
    .toLowerCase()
    .trim()
    // Replace accented characters with their base equivalents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens and alphanumeric
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
  
  // If slug is empty, generate a random one based on timestamp
  if (!slug) {
    slug = `post-${Date.now()}`;
  }
  
  return slug;
}

// Create excerpt from content if not provided
postSchema.pre('validate', async function(next) {
  // Generate slug from title if not provided or if title changed
  if (!this.slug || this.isModified('title')) {
    let baseSlug = generateSlug(this.title);
    let uniqueSlug = baseSlug;
    let counter = 1;
    
    // Check for slug uniqueness
    while (await this.constructor.findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = uniqueSlug;
  }
  
  next();
});

postSchema.pre('save', function(next) {
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200) + (this.content.length > 200 ? '...' : '');
  }
  
  // Calculate read time (rough estimate: 200 words per minute)
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }
  
  next();
});

// Index for search functionality
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Ensure imageId uniqueness within each post (not globally)
postSchema.index({ 'inlineImages.imageId': 1 }, { sparse: true });

export default mongoose.models.Post || mongoose.model('Post', postSchema);
