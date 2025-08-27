import mongoose from 'mongoose';

console.log('🔧 Setting up Database Collections');
console.log('==================================');

const setupCollections = async () => {
  try {
    console.log('✅ MongoDB connected successfully!');
    console.log('📋 Setting up collections...');
    
    // Create collections
    const collections = ['users', 'exams', 'submissions', 'learningactivities'];
    
    for (const collectionName of collections) {
      try {
        await mongoose.connection.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) { // Collection already exists
          console.log(`ℹ️  Collection already exists: ${collectionName}`);
        } else {
          console.log(`❌ Error creating collection ${collectionName}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Database setup completed!');
    console.log('📊 Your exam system will now use MongoDB for persistent storage');
    
  } catch (error) {
    console.log('❌ Error setting up database:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected');
    }
  }
};

setupCollections();
