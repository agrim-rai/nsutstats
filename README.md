# NSUT Stats - ML Data Analysis & Statistics Platform

A comprehensive platform for publishing and exploring ML data analysis, statistical insights, and data-driven research content. Built with Next.js, MongoDB, and AWS S3 for secure file storage.

## Features

### 🔐 Authentication System
- **User Login**: Regular users can read articles and leave comments using email authentication
- **Admin Login**: Dedicated admin portal for content management
- **Username-based Registration**: Simple registration without email requirement
- **Unique Username Validation**: Ensures username uniqueness across all users

### 📊 Content Management
- **Statistical Analysis**: Publish comprehensive ML data analysis and statistical content
- **Rich Content Support**: Titles, categories, tags, content, and featured images
- **File Attachments**: Upload and attach images, code snippets, and documents to articles
- **Draft System**: Save articles as drafts or publish immediately

### 📁 File Upload System
- **AWS S3 Integration**: All files stored securely in AWS S3 bucket
- **Organized Storage**: Files stored in `/nsutstats/` folder structure
- **Multiple File Types**: Support for images, code files, documents, and more
- **File Size Limits**: 10MB maximum file size with type validation

### 💬 Interactive Features
- **Comment System**: Users can comment on articles
- **Category & Tag Filtering**: Browse content by categories and tags
- **Search Functionality**: Full-text search across articles

### 🎨 Modern UI/UX
- **Clean Design**: Minimalist, modern interface with consistent spacing
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Simple Loading States**: Clean, non-animated loading indicators
- **Accessibility**: Proper semantic HTML and keyboard navigation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: AWS S3 with AWS SDK v3
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Prerequisites

- Node.js 18+ 
- MongoDB database (local or MongoDB Atlas)
- AWS S3 bucket with appropriate permissions
- AWS IAM user with S3 access

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/nsutstats
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/nsutstats

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password

# AWS S3 Configuration
S3_BUCKET_NAME=your-s3-bucket-name
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_KEY=your-s3-secret-key
S3_REGION=us-east-1
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nsutstats
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your configuration values

4. **Set up AWS S3**
   - Create an S3 bucket
   - Configure CORS policy for your bucket:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "ExposeHeaders": []
     }
   ]
   ```
   - Create an IAM user with S3 permissions
   - Get access keys and add them to your environment variables

5. **Set up MongoDB**
   - Create a MongoDB database (local or Atlas)
   - Update the `MONGODB_URI` in your environment variables

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Use the admin credentials to create your first analysis

## Usage

### Admin Features
- **Login**: Access admin portal at `/admin` with admin credentials
- **Create Articles**: Navigate to "New Analysis" to create statistical content with file attachments
- **Edit Articles**: Click edit on any article to modify content and attachments
- **Delete Articles**: Remove articles with confirmation dialog

### User Features
- **Browse Articles**: View all published statistical analysis on the home page
- **Filter by Category/Tags**: Use the navigation to filter content
- **Read Articles**: Click on any article to read full content and view attachments
- **Comment**: Leave comments on articles (requires login)
- **Download Attachments**: View and download attached files

### File Upload
- **Supported Types**: Images (JPEG, PNG, GIF, WebP), text files, code files, PDFs, JSON, etc.
- **Size Limit**: Maximum 10MB per file
- **Storage**: All files stored in `/nsutstats/` folder in S3 bucket
- **Access**: Files are publicly accessible via S3 URLs

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login (email-based)
- `POST /api/auth/admin-login` - Admin login (username-based)
- `POST /api/auth/register` - User registration (username-based, no email)

### Posts
- `GET /api/posts` - Get all articles with pagination and filtering
- `POST /api/posts` - Create new article (admin only)
- `GET /api/posts/[id]` - Get single article
- `PUT /api/posts/[id]` - Update article (admin only)
- `DELETE /api/posts/[id]` - Delete article (admin only)

### Comments
- `GET /api/posts/[id]/comments` - Get comments for an article
- `POST /api/posts/[id]/comments` - Add comment to an article

### File Upload
- `POST /api/upload` - Upload file to S3 (admin only)

### Categories & Tags
- `GET /api/categories` - Get all categories with article counts
- `GET /api/tags` - Get all tags with article counts

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Admin Authorization**: Role-based access control
- **Username Uniqueness**: Ensures unique usernames across all users
- **File Type Validation**: Whitelist of allowed file types
- **File Size Limits**: Prevents abuse of storage
- **CORS Configuration**: Proper cross-origin resource sharing setup

## Recent Updates

- **Enhanced Branding**: Updated to "NSUT Stats - ML Data Analysis & Statistics"
- **Improved User Experience**: Simplified registration without email requirement
- **Admin Portal**: Dedicated admin login page at `/admin`
- **Better Content Focus**: Emphasis on statistical analysis and ML content
- **Cleaner Loading States**: Replaced animated loaders with simple loading indicators
- **Proper English**: Improved grammar and content throughout the platform

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure all environment variables are set
- Configure MongoDB connection string for production
- Update S3 CORS policy for your production domain
- Set up proper SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.
