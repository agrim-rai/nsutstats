import connectDB from './src/lib/db.js';
import User from './src/models/User.js';

async function setupAdmin() {
  try {
    await connectDB();
    
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminUsername || !adminPassword) {
      console.error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in environment variables');
      process.exit(1);
    }
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: adminUsername });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Admin user ID:', existingAdmin._id);
      process.exit(0);
    }
    
    // Create admin user with plain text password
    const adminUser = new User({
      username: adminUsername,
      password: adminPassword,
      role: 'admin',
      email: 'admin@nsutstats.com' // You can change this
    });
    
    await adminUser.save();
    
    console.log('Admin user created successfully');
    console.log('Admin user ID:', adminUser._id);
    console.log('Username:', adminUser.username);
    console.log('Role:', adminUser.role);
    
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
}

setupAdmin();
