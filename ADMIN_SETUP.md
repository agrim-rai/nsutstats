# Admin Setup Guide

## Overview
This application uses a database-based admin authentication system. The admin user is stored in the database with proper ObjectId references, which resolves the authentication issues.

## Setup Instructions

### 1. Environment Variables
Make sure you have the following environment variables set in your `.env.local` file:

1. Copy the `env.example` file to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and set your actual values:
   ```env
   MONGODB_URI=mongodb://localhost:27017/nsutstats
   JWT_SECRET=your-super-secret-jwt-key-here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-admin-password
   ```

   **Important**: Replace the placeholder values with your actual configuration.

### 2. Create Admin User
Run the following command to create the admin user in the database:

```bash
npm run setup-admin
```

This script will:
- Connect to your MongoDB database
- Check if an admin user already exists
- Create a new admin user if one doesn't exist
- Hash the password securely
- Display the admin user ID

### 3. Admin Login
Once the admin user is created, you can log in at `/admin` using the credentials you set in the environment variables.

## How It Works

### Before (Issues)
- Admin token was generated with `userId: 'admin'` (string)
- Database models expected ObjectId references
- This caused 401 errors when trying to fetch posts

### After (Fixed)
- Admin user is stored in the database with proper ObjectId
- Admin token contains the actual user ID from the database
- All API routes work correctly with admin authentication

## API Routes

The following routes now work correctly for admin users:

- `GET /api/user/posts` - Shows all posts for admin users
- `POST /api/posts` - Allows admin to create posts
- `PUT /api/posts/[id]` - Allows admin to update posts
- `DELETE /api/posts/[id]` - Allows admin to delete posts
- `POST /api/posts/[id]/comments` - Allows admin to create comments

## Dashboard Features

When logged in as admin, the dashboard will:
- Show "Manage all blog posts" instead of "Manage your blog posts"
- Display "All Posts" instead of "Your Posts"
- Allow the admin to see and manage all posts in the system
