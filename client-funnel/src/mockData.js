// Mock database and Review Generation Engine for the Review Automation SaaS

export const BUSINESS_TYPES = [
  {
    id: "restaurant",
    label: "🍽️ Restaurants & Cafés",
    positiveTags: ["Delicious food", "Excellent service", "Cozy vibe", "Impeccable cleanliness", "Good value for money", "Friendly staff", "Great presentation"],
    negativeTags: ["Slow service", "Cold food", "Poor hygiene", "High prices", "Incorrect order", "Rude staff", "Loud environment"],
    defaultColor: "#ea580c" // Orange-red
  },
  {
    id: "salon",
    label: "💇 Salons & Barbers",
    positiveTags: ["Talented stylist", "Friendly staff", "Relaxing ambiance", "Great value", "Immaculate cleanliness", "Attention to detail", "Premium products"],
    negativeTags: ["Long wait time", "Unfriendly staff", "Not what I asked for", "Overpriced", "Messy station", "Rushed cut"],
    defaultColor: "#db2777" // Pink
  },
  {
    id: "clinic",
    label: "🏥 Clinics & Healthcare",
    positiveTags: ["Empathetic doctor", "Short wait time", "Friendly staff", "Clean clinic", "Highly professional", "Clear explanations", "Caring environment"],
    negativeTags: ["Long wait time", "Rushed checkup", "Unclean facilities", "Rude staff", "Lack of communication", "Overcharged"],
    defaultColor: "#0d9488" // Teal
  },
  {
    id: "hotel",
    label: "🏨 Hotels & Guest Houses",
    positiveTags: ["Comfy beds", "Great location", "Excellent service", "Clean rooms", "Delicious breakfast", "Helpful staff", "Stunning views"],
    negativeTags: ["Dirty room", "Loud noise", "Bad service", "Old facilities", "Poor Wi-Fi", "Broken amenities", "Unhelpful front desk"],
    defaultColor: "#2563eb" // Blue
  },
  {
    id: "gym",
    label: "🏋️ Gyms & Fitness Centers",
    positiveTags: ["Great equipment", "Helpful trainers", "Clean facility", "Fun classes", "Welcoming vibe", "Spacious layout", "Great community"],
    negativeTags: ["Crowded", "Broken machines", "Dirty showers", "Unhelpful staff", "High membership cost", "Loud/annoying music"],
    defaultColor: "#16a34a" // Green
  },
  {
    id: "retail",
    label: "🛍️ Retail Stores",
    positiveTags: ["Great collection", "Helpful staff", "Reasonable pricing", "Easy checkout", "Clean layout", "High-quality products", "Unique items"],
    negativeTags: ["Limited stock", "Rude staff", "Long checkout line", "Overpriced", "Messy store", "Difficult returns"],
    defaultColor: "#4f46e5" // Indigo
  },
  {
    id: "car_dealership",
    label: "🚗 Car Dealerships & Garages",
    positiveTags: ["Honest mechanics", "Transparent pricing", "Fast service", "Friendly staff", "Clean waiting room", "No pushy sales", "Quality repair"],
    negativeTags: ["Overpriced repairs", "Pushy sales staff", "Delays in service", "Unclear estimates", "Poor communication", "Messy work"],
    defaultColor: "#dc2626" // Red
  },
  {
    id: "real_estate",
    label: "🏠 Real-Estate Agencies",
    positiveTags: ["Professional agent", "Smooth process", "Highly responsive", "Deep market knowledge", "Honest guidance", "Great negotiation"],
    negativeTags: ["Hard to reach", "Unprofessional agent", "Hidden fees", "Delayed updates", "Pushy behavior", "Misleading info"],
    defaultColor: "#7c3aed" // Violet
  },
  {
    id: "coaching",
    label: "🎓 Coaching & Training Centers",
    positiveTags: ["Expert instructors", "Engaging lectures", "Personal attention", "Great resources", "Helpful feedback", "Inspiring environment"],
    negativeTags: ["Unorganized classes", "Inexperienced teachers", "Lack of study material", "Crowded rooms", "High fees"],
    defaultColor: "#059669" // Emerald green
  },
  {
    id: "dental",
    label: "🦷 Dental Clinics",
    positiveTags: ["Painless procedure", "Professional care", "Modern clinic", "Friendly staff", "Gentle dentists", "Short wait time", "Highly hygienic"],
    negativeTags: ["Painful treatment", "Unprofessional service", "Unclean tools", "Long waiting room time", "Overpriced fillings", "Rude receptionist"],
    defaultColor: "#0284c7" // Light Blue
  },
  {
    id: "wellness",
    label: "🧘 Wellness & Spas",
    positiveTags: ["Extremely relaxing", "Skilled therapist", "Peaceful ambiance", "Clean facility", "Rejuvenating treatment", "Aromatherapy", "Friendly staff"],
    negativeTags: ["Rushed treatment", "Noisy environment", "Unfriendly therapist", "Expensive packages", "Dirty towels", "Cold massage room"],
    defaultColor: "#0891b2" // Cyan
  },
  {
    id: "home_service",
    label: "🔧 Home & Service Providers",
    positiveTags: ["Punctual", "Professional", "High quality work", "Reasonable price", "Cleaned up fully", "Great communication", "Quick fix"],
    negativeTags: ["Arrived late", "Poor quality work", "Left a mess", "Overcharged", "Rude technician", "Didn't fix the problem"],
    defaultColor: "#ca8a04" // Yellow/Gold
  },
  {
    id: "photography",
    label: "📸 Photography Studios",
    positiveTags: ["Creative shots", "Talented photographer", "Comfortable session", "Fast photo delivery", "High-quality edits", "Friendly direction"],
    negativeTags: ["Awkward session", "Delayed delivery", "Poor lighting/edits", "Unprofessional behavior", "Overpriced packages", "Lost files"],
    defaultColor: "#be185d" // Dark pink/rose
  },
  {
    id: "wedding_event",
    label: "💍 Wedding & Event Businesses",
    positiveTags: ["Stunning coordination", "Flawless execution", "Beautiful decor", "Highly professional", "Stress-free planning", "Accommodating staff"],
    negativeTags: ["Poor coordination", "Late setup", "Rude coordinator", "Hidden fees", "Did not follow plan", "Bad communication"],
    defaultColor: "#9333ea" // Purple
  }
];

// Helper to get default tags for any unregistered category
export const DEFAULT_POSITIVE_TAGS = ["Excellent service", "Great value", "Friendly staff", "Highly recommend", "Clean and safe"];
export const DEFAULT_NEGATIVE_TAGS = ["Poor service", "Too expensive", "Long wait", "Rude interaction", "Needs improvement"];

// Preset mock businesses to make the SaaS experience rich immediately
export const DEFAULT_BUSINESSES = [
  {
    id: "biz-4",
    name: "Olivia Spa & Physiotherapy",
    type: "wellness",
    googleReviewUrl: "https://www.google.com/search?sca_esv=1a87055de532744c&cs=1&sxsrf=APpeQnvUVQ9fqDqGrDLREsJic4ym8hBN-w:1786530070479&q=Olivia+Spa+IN+Physiotherapy&spell=1&sa=X&ved=2ahUKEwiMsOyR75qWAxUmSmwGHZDEH_kQBSgAegQIFBAB&cshid=1786530124549967&biw=1536&bih=695&dpr=1.25#sv=CAESzQEKuQEStgEKd0FKaVQ0dExmcGZjU2VYMUZZMnY4TERhTEFrT2wyeWFaZ0RMRWthaHVETExtdDdpUTZPRFV5YlN1NG1GNGZFLUw3Q2tfOXc4YmVNeHEtamJ3RUtGenZWWHRLLUo4MHc2bUIxUThPUm1ubUd0RTZSWXJmOEZfTUtnEhdXVWw4YXRtSEFiQ1o0LUVQNGNUdzRRRRoiQURzcjlmVFlHYVdJQVdmejMtTzBycVJPQWwwdU1PeldCZxIEODA1MRoBMyoAMAA4AUAAGAAg1JKF6QVKAhAB",
    primaryColor: "#0891b2",
    logoUrl: "",
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
    primaryColor: "#ea580c",
    logoUrl: "",
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
    primaryColor: "#db2777",
    logoUrl: "",
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
    primaryColor: "#0284c7",
    logoUrl: "",
    createdAt: "2026-07-01",
    analytics: {
      scans: 156,
      reviewsGenerated: 68,
      redirectsToGoogle: 45,
      ratingCounts: { 5: 35, 4: 20, 3: 6, 2: 4, 1: 3 }
    }
  }
];

// Presets for AI review generation to guarantee uniqueness and natural language flow
const ADJECTIVES = {
  positive: ["wonderful", "fantastic", "amazing", "outstanding", "excellent", "superb", "top-tier", "first-class", "lovely", "stellar", "terrific", "brilliant", "delightful"],
  emphasis: ["truly", "absolutely", "extremely", "really", "incredibly", "very", "thoroughly", "exceptionally"],
  verbs: ["impressed", "pleased", "blown away", "delighted", "thrilled", "satisfied"]
};

const STARTERS = {
  enthusiastic: [
    "Wow! I had a [ADJ] experience at [BIZ]!",
    "If you are looking for the absolute best, [BIZ] is the place to go!",
    "I'm still smiling after my visit to [BIZ]. What a [ADJ] establishment!",
    "Had the most [ADJ] time at [BIZ] today!",
    "Five stars all the way for [BIZ]! They are [EMP] doing things right.",
    "I can't say enough good things about my recent visit to [BIZ]!"
  ],
  professional: [
    "I recently visited [BIZ] and wanted to share my positive feedback.",
    "My experience at [BIZ] was [ADJ] from start to finish.",
    "I was [EMP] [VERB] with the level of quality and professionalism at [BIZ].",
    "I highly recommend [BIZ] for anyone seeking high-quality service.",
    "I had a very positive visit to [BIZ] and will definitely return.",
    "[BIZ] sets a high standard for customer care and general quality."
  ],
  short: [
    "Excellent experience at [BIZ].",
    "Highly recommend [BIZ]!",
    "Had a [ADJ] visit to [BIZ].",
    "Really [VERB] with my experience at [BIZ].",
    "[BIZ] is definitely my go-to choice now.",
    "Great service and atmosphere at [BIZ]."
  ]
};

const BODY_TRANSITIONS = [
  "Specifically, the [TAG1] and [TAG2] stood out immediately.",
  "What stood out most was their [TAG1], and the [TAG2] was also top notch.",
  "I was particularly impressed by their [TAG1], plus the [TAG2] was great.",
  "Everything from the [TAG1] to the [TAG2] was handled perfectly.",
  "The [TAG1] was superb, and the overall [TAG2] made it even better.",
  "Their attention to [TAG1] is amazing, and I really appreciated the [TAG2]."
];

const BODY_SINGLE_TAG = [
  "In particular, the [TAG] was absolutely [ADJ].",
  "The [TAG] was the absolute highlight of my visit.",
  "I was especially impressed by the [TAG].",
  "Their attention to [TAG] was clearly evident during my visit.",
  "The [TAG] exceeded my expectations.",
  "Special shoutout to their [TAG] which was [ADJ]."
];

const SIGN_OFFS = [
  "I will definitely be returning soon!",
  "Highly recommend this spot to anyone in the area.",
  "They've earned a customer for life.",
  "Keep up the fantastic work, guys!",
  "Definitely check them out if you get the chance.",
  "Can't wait for my next visit!",
  "A solid recommendation from me.",
  "Thanks to the team for making my day!"
];

// Helper to shuffle arrays
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper to clean tags (e.g. lowercase and remove emojis/icons for mid-sentence flow)
function cleanTagForSentence(tag) {
  let cleaned = tag.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{E000}-\u{F8FF}]|/gu, '').trim();
  return cleaned.toLowerCase();
}

/**
 * Generates a guaranteed unique AI review text based on business parameters and user input
 */
export function generateReviewText(bizName, rating, selectedTags, customNote, tone = "enthusiastic") {
  // If rating is 1-2, we can generate a constructive review (though in our flow, this goes to private feedback)
  if (rating <= 2) {
    const badStarters = [
      "I recently visited [BIZ] and unfortunately did not have the best experience.",
      "I wanted to share some feedback regarding my recent visit to [BIZ].",
      "Hoping the management at [BIZ] sees this, as there are areas that need attention.",
      "My visit to [BIZ] left a bit to be desired today."
    ];
    let starter = badStarters[Math.floor(Math.random() * badStarters.length)].replace("[BIZ]", bizName);
    
    let tagText = "";
    if (selectedTags.length > 0) {
      const cleanedTags = selectedTags.map(cleanTagForSentence);
      if (cleanedTags.length === 1) {
        tagText = ` I felt that the ${cleanedTags[0]} could have been much better.`;
      } else {
        const shuffled = shuffle(cleanedTags);
        tagText = ` I noticed issues with the ${shuffled[0]} and also the ${shuffled[1]}.`;
      }
    }
    
    let noteText = customNote ? ` Specifically, ${customNote.trim()}` : "";
    let endText = " Hopefully, these issues can be addressed soon.";
    
    return `${starter}${tagText}${noteText}${endText}`;
  }

  // Positive review generation logic with multiple layers of randomness for uniqueness
  const activeTone = STARTERS[tone] ? tone : "enthusiastic";
  const starterTemplates = STARTERS[activeTone];
  let starter = starterTemplates[Math.floor(Math.random() * starterTemplates.length)];
  
  // Pick random adjectives/verbs for placeholders
  const adj = ADJECTIVES.positive[Math.floor(Math.random() * ADJECTIVES.positive.length)];
  const emp = ADJECTIVES.emphasis[Math.floor(Math.random() * ADJECTIVES.emphasis.length)];
  const verb = ADJECTIVES.verbs[Math.floor(Math.random() * ADJECTIVES.verbs.length)];
  
  starter = starter
    .replace("[BIZ]", bizName)
    .replace("[ADJ]", adj)
    .replace("[EMP]", emp)
    .replace("[VERB]", verb);

  let body = "";
  if (selectedTags && selectedTags.length > 0) {
    const cleanedTags = selectedTags.map(cleanTagForSentence);
    const shuffledTags = shuffle(cleanedTags);
    
    if (shuffledTags.length >= 2) {
      const template = BODY_TRANSITIONS[Math.floor(Math.random() * BODY_TRANSITIONS.length)];
      body = " " + template
        .replace("[TAG1]", shuffledTags[0])
        .replace("[TAG2]", shuffledTags[1])
        .replace("[ADJ]", ADJECTIVES.positive[Math.floor(Math.random() * ADJECTIVES.positive.length)]);
    } else {
      const template = BODY_SINGLE_TAG[Math.floor(Math.random() * BODY_SINGLE_TAG.length)];
      body = " " + template
        .replace("[TAG]", shuffledTags[0])
        .replace("[ADJ]", ADJECTIVES.positive[Math.floor(Math.random() * ADJECTIVES.positive.length)]);
    }
  }

  // Insert custom note naturally
  let note = "";
  if (customNote && customNote.trim().length > 0) {
    const noteTemplates = [
      ` Especially loved that [NOTE].`,
      ` It was really great that [NOTE].`,
      ` I also wanted to mention: [NOTE].`,
      ` [NOTE] - which made the visit even better.`,
      ` I should also add that [NOTE].`
    ];
    
    let noteContent = customNote.trim();
    // Lowercase first letter if it doesn't look like a proper noun
    if (noteContent.charAt(0) === noteContent.charAt(0).toUpperCase() && !/^[A-Z]{2,}/.test(noteContent)) {
      // Check if it's "I"
      if (!noteContent.startsWith("I ") && !noteContent.startsWith("I'm")) {
        noteContent = noteContent.charAt(0).toLowerCase() + noteContent.slice(1);
      }
    }
    
    // Remove trailing period if present, since our template handles it
    if (noteContent.endsWith(".")) {
      noteContent = noteContent.slice(0, -1);
    }
    
    note = noteTemplates[Math.floor(Math.random() * noteTemplates.length)].replace("[NOTE]", noteContent);
  }

  // Append closing sign-off
  const signOff = " " + SIGN_OFFS[Math.floor(Math.random() * SIGN_OFFS.length)];
  
  // Clean double spaces or double periods
  let finalReview = `${starter}${body}${note}${signOff}`;
  finalReview = finalReview.replace(/\s+/g, " ");
  finalReview = finalReview.replace(/\.\./g, ".");
  
  return finalReview;
}
