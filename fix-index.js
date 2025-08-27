// Script to fix the duplicate key error by dropping the problematic index
import mongoose from 'mongoose';

async function fixIndex() {
  try {
    // Connect to MongoDB (adjust connection string as needed)
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    
    console.log('Connected to MongoDB');
    
    // Get the posts collection
    const db = mongoose.connection.db;
    const collection = db.collection('posts');
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));
    
    // Look for the problematic index
    const problematicIndex = indexes.find(idx => 
      idx.name.includes('inlineImages.imageId') || 
      (idx.key && idx.key['inlineImages.imageId'])
    );
    
    if (problematicIndex) {
      console.log('Found problematic index:', problematicIndex.name);
      await collection.dropIndex(problematicIndex.name);
      console.log('Dropped problematic index successfully');
    } else {
      console.log('No problematic index found - checking for similar patterns...');
      
      // Check for any index that might be causing issues
      for (const index of indexes) {
        if (index.key && Object.keys(index.key).some(key => key.includes('imageId'))) {
          console.log('Found potential problematic index:', index.name, index.key);
          try {
            await collection.dropIndex(index.name);
            console.log('Dropped index:', index.name);
          } catch (error) {
            console.log('Could not drop index:', index.name, error.message);
          }
        }
      }
    }
    
    console.log('Index fix completed');
    
  } catch (error) {
    console.error('Error fixing index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixIndex();
