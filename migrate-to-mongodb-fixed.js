import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import { getAllUsers } from './utils/userStorage.js';

// Load environment variables
dotenv.config();

console.log('Starting migration from local storage to MongoDB (Fixed)...');

const migrateUsers = async () => {
  try {
    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not set. Please set up MongoDB first.');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all users from local storage
    const localUsers = getAllUsers();
    console.log(`📊 Found ${localUsers.length} users in local storage`);

    if (localUsers.length === 0) {
      console.log('ℹ️ No users to migrate');
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const localUser of localUsers) {
      try {
        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({ email: localUser.email });
        
        if (existingUser) {
          console.log(`⏭️ Skipping ${localUser.name} (${localUser.email}) - already exists in MongoDB`);
          skippedCount++;
          continue;
        }

        // Handle trainerId - convert string to ObjectId or set to null
        let trainerId = null;
        if (localUser.trainerId && localUser.trainerId !== '1') {
          // Try to convert to ObjectId if it's a valid MongoDB ObjectId
          if (mongoose.Types.ObjectId.isValid(localUser.trainerId)) {
            trainerId = localUser.trainerId;
          }
        }

        // Handle phone number conflicts by adding a suffix
        let phone = localUser.phone;
        const existingPhoneUser = await User.findOne({ phone: localUser.phone });
        if (existingPhoneUser) {
          phone = `${localUser.phone}-${Date.now()}`;
          console.log(`⚠️ Phone conflict for ${localUser.name}, using: ${phone}`);
        }

        // Create new user in MongoDB
        const mongoUser = new User({
          name: localUser.name,
          email: localUser.email,
          phone: phone,
          password: localUser.password, // Already hashed
          role: localUser.role,
          trainerId: trainerId,
          isVerified: localUser.isVerified !== undefined ? localUser.isVerified : true,
          isActive: localUser.isActive !== undefined ? localUser.isActive : true,
          createdAt: localUser.createdAt || new Date(),
          updatedAt: localUser.updatedAt || new Date()
        });

        await mongoUser.save();
        console.log(`✅ Migrated ${localUser.name} (${localUser.email}) - ${localUser.role}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrating ${localUser.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} users`);
    console.log(`⏭️ Skipped (already exists): ${skippedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);

    if (migratedCount > 0) {
      console.log('\n🎉 Migration completed! Your evaluators and students are now in MongoDB.');
      console.log('💡 You can now delete the local users.json file if you want.');
    }

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateUsers(); 