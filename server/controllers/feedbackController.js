import { db } from '../db/db.js';

export const getFeedbacks = async (req, res) => {
  try {
    let list = await db.getFeedbacks();
    if (req.user?.role === 'owner') {
      list = list.filter(f => f.businessId === req.user.businessId);
    }
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve feedback logs' });
  }
};

export const getConversions = async (req, res) => {
  try {
    let list = await db.getConversions();
    if (req.user?.role === 'owner') {
      list = list.filter(r => r.businessId === req.user.businessId);
    }
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve conversion logs' });
  }
};

export const createFeedback = async (req, res) => {
  const { businessId, rating, tags, comment, name, email, contact } = req.body;

  if (!businessId || !rating) {
    return res.status(400).json({ error: 'Business ID and Rating are required' });
  }

  try {
    // 1. Save feedback log
    const feedbacks = await db.getFeedbacks();
    const newFb = {
      id: `fb-${Date.now()}`,
      businessId,
      rating: parseInt(rating),
      tags: tags || [],
      comment: comment || '',
      name: name || 'Anonymous',
      email: email || 'Not provided',
      contact: !!contact,
      status: 'pending', // Default status for interactive Feedback Console
      date: new Date().toISOString().split('T')[0]
    };
    feedbacks.push(newFb);
    await db.saveFeedbacks(feedbacks);

    // 2. Increment rating count in business analytics
    const businesses = await db.getBusinesses();
    const idx = businesses.findIndex(b => b.id === businessId);
    if (idx !== -1) {
      businesses[idx].analytics.reviewsGenerated += 1;
      const rVal = parseInt(rating);
      if (businesses[idx].analytics.ratingCounts[rVal] !== undefined) {
        businesses[idx].analytics.ratingCounts[rVal] += 1;
      } else {
        businesses[idx].analytics.ratingCounts[rVal] = 1;
      }
      await db.saveBusinesses(businesses);
    }

    return res.status(201).json(newFb);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to log feedback submission' });
  }
};

export const updateFeedbackStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const list = await db.getFeedbacks();
    const index = list.findIndex(f => f.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Feedback log not found' });
    }

    // Owner checks: restrict to own businessId
    if (req.user?.role === 'owner' && req.user.businessId !== list[index].businessId) {
      return res.status(403).json({ error: 'Forbidden: You cannot modify feedback logs of other business locations' });
    }

    list[index].status = status;
    await db.saveFeedbacks(list);

    return res.json(list[index]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update feedback status' });
  }
};

export const createConversion = async (req, res) => {
  const { businessId, rating, tags, reviewText } = req.body;

  if (!businessId || !rating) {
    return res.status(400).json({ error: 'Business ID and Rating are required' });
  }

  try {
    // 1. Save conversion entry
    const conversions = await db.getConversions();
    const newConv = {
      id: `conv-${Date.now()}`,
      businessId,
      rating: parseInt(rating),
      tags: tags || [],
      reviewText: reviewText || '',
      date: new Date().toISOString().split('T')[0]
    };
    conversions.push(newConv);
    await db.saveConversions(conversions);

    // 2. Increment review generation and rating count in business analytics
    const businesses = await db.getBusinesses();
    const idx = businesses.findIndex(b => b.id === businessId);
    if (idx !== -1) {
      businesses[idx].analytics.reviewsGenerated += 1;
      businesses[idx].analytics.redirectsToGoogle += 1; // It was a conversion click-through
      const rVal = parseInt(rating);
      if (businesses[idx].analytics.ratingCounts[rVal] !== undefined) {
        businesses[idx].analytics.ratingCounts[rVal] += 1;
      } else {
        businesses[idx].analytics.ratingCounts[rVal] = 1;
      }
      await db.saveBusinesses(businesses);
    }

    return res.status(201).json(newConv);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to log review conversion' });
  }
};
