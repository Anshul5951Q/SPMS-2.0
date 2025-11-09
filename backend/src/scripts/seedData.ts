import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ParkingSlot from '../models/ParkingSlot';

dotenv.config();

// Function to generate parking slots
const generateParkingSlots = () => {
  const slots = [];
  
  for (let floor = 1; floor <= 2; floor++) {
    for (let section of ['A', 'B', 'C']) {
      for (let i = 1; i <= 10; i++) {
        const slotType = i % 10 === 0 ? 'handicap' : 
                         i % 5 === 0 ? 'electric' : 'standard';
        
        slots.push({
          section,
          number: i,
          floor,
          type: slotType,
          isAvailable: true,
          price: 50, // ₹50 per hour
        });
      }
    }
  }
  
  return slots;
};

// Connect to MongoDB
const seedDatabase = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parking-system';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding data');
    
    // Clear existing data
    await ParkingSlot.deleteMany({});
    console.log('Cleared existing parking slot data');
    
    // Generate and insert new data
    const parkingSlots = generateParkingSlots();
    await ParkingSlot.insertMany(parkingSlots);
    
    console.log(`Successfully seeded ${parkingSlots.length} parking slots`);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 