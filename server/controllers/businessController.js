import { db } from '../db/db.js';

export const getBusinesses = async (req, res) => {
  try {
    let list = await db.getBusinesses();
    if (req.user?.role === 'owner') {
      list = list.filter(b => b.id === req.user.businessId);
    }
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve businesses' });
  }
};

export const getPublicBusiness = async (req, res) => {
  const { id } = req.params;
  try {
    const list = await db.getBusinesses();
    const biz = list.find(b => b.id === id);
    if (!biz) {
      return res.status(404).json({ error: 'Business not found' });
    }
    // Return only public-facing details for client safety
    const publicDetails = {
      id: biz.id,
      name: biz.name,
      type: biz.type,
      googleReviewUrl: biz.googleReviewUrl,
      whatsappNumber: biz.whatsappNumber,
      primaryColor: biz.primaryColor,
    };
    return res.json(publicDetails);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve business information' });
  }
};

export const createBusiness = async (req, res) => {
  // Only admins can create new business locations
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only administrators can create locations' });
  }

  const { name, type, googleReviewUrl, whatsappNumber, primaryColor, ownerUsername, ownerPassword } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and Type are required' });
  }

  try {
    const list = await db.getBusinesses();
    const newBiz = {
      id: `biz-${Date.now()}`,
      name,
      type,
      googleReviewUrl: googleReviewUrl || '',
      whatsappNumber: whatsappNumber || '',
      primaryColor: primaryColor || '#6366f1',
      ownerUsername: ownerUsername || `owner-${Date.now()}`,
      ownerPassword: ownerPassword || 'password123',
      logoUrl: '',
      createdAt: new Date().toISOString().split('T')[0],
      analytics: {
        scans: 0,
        reviewsGenerated: 0,
        redirectsToGoogle: 0,
        ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    };

    list.push(newBiz);
    await db.saveBusinesses(list);
    return res.status(201).json(newBiz);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create business branch' });
  }
};

export const updateBusiness = async (req, res) => {
  const { id } = req.params;
  const { name, type, googleReviewUrl, whatsappNumber, primaryColor, ownerUsername, ownerPassword } = req.body;

  // Owners can only update their own business details
  if (req.user?.role === 'owner' && req.user.businessId !== id) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify other business locations' });
  }

  try {
    const list = await db.getBusinesses();
    const index = list.findIndex(b => b.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Business branch not found' });
    }

    list[index] = {
      ...list[index],
      name: name !== undefined ? name : list[index].name,
      type: type !== undefined ? type : list[index].type,
      googleReviewUrl: googleReviewUrl !== undefined ? googleReviewUrl : list[index].googleReviewUrl,
      whatsappNumber: whatsappNumber !== undefined ? whatsappNumber : list[index].whatsappNumber,
      primaryColor: primaryColor !== undefined ? primaryColor : list[index].primaryColor,
      ownerUsername: ownerUsername !== undefined ? ownerUsername : list[index].ownerUsername,
      ownerPassword: ownerPassword !== undefined ? ownerPassword : list[index].ownerPassword,
    };

    await db.saveBusinesses(list);
    return res.json(list[index]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update business branch' });
  }
};

export const deleteBusiness = async (req, res) => {
  // Only admins can delete business locations
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only administrators can delete locations' });
  }

  const { id } = req.params;

  try {
    let list = await db.getBusinesses();
    const exists = list.some(b => b.id === id);

    if (!exists) {
      return res.status(404).json({ error: 'Business branch not found' });
    }

    list = list.filter(b => b.id !== id);
    await db.saveBusinesses(list);
    return res.json({ success: true, message: 'Business branch deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete business branch' });
  }
};

export const incrementScan = async (req, res) => {
  const { id } = req.params;

  try {
    const list = await db.getBusinesses();
    const index = list.findIndex(b => b.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Business not found' });
    }

    list[index].analytics.scans += 1;
    await db.saveBusinesses(list);
    return res.json({ success: true, scans: list[index].analytics.scans });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to increment scan analytics' });
  }
};
