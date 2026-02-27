const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Optional: Test creating a collection
    const db = mongoose.connection.db;
    await db.createCollection('test_collection');
    console.log('✅ Successfully created test collection!');
    
    // Clean up
    await db.collection('test_collection').drop();
    console.log('✅ Test collection cleaned up');
    
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();