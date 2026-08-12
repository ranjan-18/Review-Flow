import mongoose from 'mongoose';
import dns from 'dns';
import { MONGO_URI } from '../config/env.js';

// Fix DNS resolution for MongoDB Atlas SRV lookups in Windows environment only
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    // fallback if DNS custom servers cannot be set
  }
}

// Mongoose Schemas & Models
const businessSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  googleReviewUrl: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  primaryColor: { type: String, default: '#6366f1' },
  logoUrl: { type: String, default: '' },
  ownerUsername: { type: String, default: '' },
  ownerPassword: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
  analytics: {
    scans: { type: Number, default: 0 },
    reviewsGenerated: { type: Number, default: 0 },
    redirectsToGoogle: { type: Number, default: 0 },
    ratingCounts: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  }
}, { timestamps: true });

const feedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  businessId: { type: String, required: true },
  rating: { type: Number, required: true },
  tags: [{ type: String }],
  comment: { type: String, default: '' },
  name: { type: String, default: 'Anonymous' },
  email: { type: String, default: '' },
  contact: { type: Boolean, default: false },
  status: { type: String, default: 'pending' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

const conversionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  businessId: { type: String, required: true },
  rating: { type: Number, required: true },
  tags: [{ type: String }],
  reviewText: { type: String, default: '' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

export const BusinessModel = mongoose.models.Business || mongoose.model('Business', businessSchema);
export const FeedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
export const ConversionModel = mongoose.models.Conversion || mongoose.model('Conversion', conversionSchema);

let isConnected = false;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`====================================================`);
    console.log(`  MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`====================================================`);
    
    // Seed initial data if MongoDB database is completely empty
    await seedInitialDataIfEmpty();
  } catch (err) {
    console.error('MongoDB Atlas Connection Error:', err.message);
  }
}

async function seedInitialDataIfEmpty() {
  try {
    const count = await BusinessModel.countDocuments();
    if (count === 0) {
      console.log('Seeding initial MongoDB documents...');
      await BusinessModel.insertMany([
        {
          id: "biz-4",
          name: "Olivia Spa & Physiotherapy",
          type: "wellness",
          googleReviewUrl: "https://www.google.com/search?q=Olivia+Spa",
          whatsappNumber: "919876543210",
          primaryColor: "#0891b2",
          ownerUsername: "olivia",
          ownerPassword: "password123",
          createdAt: "2026-08-12",
          analytics: {
            scans: 120,
            reviewsGenerated: 54,
            redirectsToGoogle: 38,
            ratingCounts: { 5: 32, 4: 15, 3: 4, 2: 2, 1: 1 }
          }
        },
        {
          id: "biz-1",
          name: "The Olive Garden Bistro",
          type: "restaurant",
          googleReviewUrl: "https://share.google/Pe8bgMKXGOZLBKsiu",
          whatsappNumber: "919876543210",
          primaryColor: "#ea580c",
          ownerUsername: "bistro",
          ownerPassword: "password123",
          createdAt: "2026-05-10",
          analytics: {
            scans: 487,
            reviewsGenerated: 218,
            redirectsToGoogle: 156,
            ratingCounts: { 5: 124, 4: 52, 3: 20, 2: 12, 1: 10 }
          }
        },
        {
          id: "biz-2",
          name: "Glow & Co. Hair Salon",
          type: "salon",
          googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJT7_tDeuEmsRUs3VSY412345",
          whatsappNumber: "919876543210",
          primaryColor: "#db2777",
          ownerUsername: "glow",
          ownerPassword: "password123",
          createdAt: "2026-06-15",
          analytics: {
            scans: 294,
            reviewsGenerated: 143,
            redirectsToGoogle: 110,
            ratingCounts: { 5: 98, 4: 32, 3: 8, 2: 3, 1: 2 }
          }
        },
        {
          id: "biz-3",
          name: "Apex Family Dental Clinic",
          type: "dental",
          googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJo3VSY4tDeuEmsRU12345678",
          whatsappNumber: "919876543210",
          primaryColor: "#0284c7",
          ownerUsername: "apex",
          ownerPassword: "password123",
          createdAt: "2026-07-01",
          analytics: {
            scans: 156,
            reviewsGenerated: 68,
            redirectsToGoogle: 45,
            ratingCounts: { 5: 35, 4: 20, 3: 6, 2: 4, 1: 3 }
          }
        }
      ]);
      console.log('MongoDB Businesses seeded successfully!');
    }

    const fbCount = await FeedbackModel.countDocuments();
    if (fbCount === 0) {
      await FeedbackModel.insertMany([
        {
          id: "fb-1",
          businessId: "biz-1",
          rating: 2,
          tags: ["Slow service", "Cold food"],
          comment: "We waited for almost an hour to get our pasta, and when it finally arrived, it was lukewarm. The waiter was nice but clearly overwhelmed.",
          name: "Marcus Aurelius",
          email: "marcus@rome.gov",
          contact: true,
          status: "pending",
          date: "2026-08-09"
        },
        {
          id: "fb-2",
          businessId: "biz-2",
          rating: 3,
          tags: ["Long wait time", "Overpriced"],
          comment: "Haircut is decent but I had to wait 20 minutes past my appointment time, and the price they charged didn't match the menu rate.",
          name: "Jessica Jones",
          email: "jessica@aliasinvestigations.com",
          contact: false,
          status: "pending",
          date: "2026-08-11"
        }
      ]);
      console.log('MongoDB Feedbacks seeded successfully!');
    }
  } catch (err) {
    console.error('Error seeding initial MongoDB data:', err);
  }
}

// Database Operations Interface backed by MongoDB Atlas
export const db = {
  getBusinesses: async () => {
    await connectDB();
    return await BusinessModel.find({}).lean();
  },

  saveBusinesses: async (businesses) => {
    await connectDB();
    for (const b of businesses) {
      await BusinessModel.findOneAndUpdate(
        { id: b.id },
        b,
        { upsert: true, new: true }
      );
    }
    const ids = businesses.map(b => b.id);
    await BusinessModel.deleteMany({ id: { $nin: ids } });
  },

  getFeedbacks: async () => {
    await connectDB();
    return await FeedbackModel.find({}).lean();
  },

  saveFeedbacks: async (feedbacks) => {
    await connectDB();
    for (const f of feedbacks) {
      await FeedbackModel.findOneAndUpdate(
        { id: f.id },
        f,
        { upsert: true, new: true }
      );
    }
    const ids = feedbacks.map(f => f.id);
    await FeedbackModel.deleteMany({ id: { $nin: ids } });
  },

  getConversions: async () => {
    await connectDB();
    return await ConversionModel.find({}).lean();
  },

  saveConversions: async (conversions) => {
    await connectDB();
    for (const c of conversions) {
      await ConversionModel.findOneAndUpdate(
        { id: c.id },
        c,
        { upsert: true, new: true }
      );
    }
    const ids = conversions.map(c => c.id);
    await ConversionModel.deleteMany({ id: { $nin: ids } });
  }
};
