# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Recommended - Free)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Free" tier (M0)

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier
3. Select your preferred cloud provider and region
4. Click "Create"

### Step 3: Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `telugu_user`
5. Password: `telugu123` (or your own password)
6. Select "Read and write to any database"
7. Click "Add User"

### Step 4: Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

### Step 6: Create .env File
Create a `.env` file in the `server` directory with:

```env
MONGODB_URI=mongodb+srv://telugu_user:your_password@cluster0.xxxxx.mongodb.net/telugu-learning?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
PORT=5000
NODE_ENV=development
```

**Important:** Replace `your_password` with the actual password you set in Step 3.

## Option 2: Local MongoDB

### Step 1: Install MongoDB
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. Start MongoDB service

### Step 2: Create .env File
```env
MONGODB_URI=mongodb://localhost:27017/telugu-learning
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
PORT=5000
NODE_ENV=development
```

## Test Your Setup

After creating the `.env` file, run:

```bash
cd server
node setup-mongodb.js
```

If successful, you'll see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
✅ Database: telugu-learning
✅ Ready to use MongoDB for evaluators and students!
```

## Restart Your Server

After setting up MongoDB, restart your server:

```bash
node server.js
```

You should now see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 Server running on port 5000
```

## Troubleshooting

- **Connection failed**: Check your password and IP whitelist
- **Authentication failed**: Verify username/password
- **Network error**: Ensure your IP is whitelisted in Atlas
- **Port already in use**: Change PORT in .env file
