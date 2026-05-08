require('dotenv').config();

const mongoose = require('mongoose');

const Lead = require('./models/Lead');

const mockLeads = [
  {
    name: 'Aarav Mehta',
    email: 'aarav@mehtadental.com',
    phone: '+91 98765 11111',
    location: 'Mumbai, India',
    company: 'Mehta Dental Studio',
    source: 'mock_seed',
    leadCategory: 'marketing_agency',
    serviceNeeded: 'Paid Ads',
    monthlyBudget: '$1500-$5000',
    timeline: 'ASAP',
    businessType: 'Local business',
    currentProblem: 'Clinic is getting traffic but not enough booked consultation calls.',
    notes: 'Wants paid ads and landing page help urgently.',
    intent: 'ready_to_buy',
    type: 'Local Business',
    score: 88,
    summary: 'High-intent local clinic with urgent lead generation need and healthy budget.',
    recommended_next_step: 'Call today and offer a paid ads plus landing page audit.'
  },
  {
    name: 'Sophia Carter',
    email: 'sophia@northstarhomes.com',
    phone: '+1 415 555 0188',
    location: 'San Francisco, USA',
    company: 'Northstar Homes',
    source: 'mock_seed',
    leadCategory: 'real_estate_agent',
    lookingTo: 'Buy',
    propertyType: 'Apartment',
    budgetRange: '$700k+',
    timeline: 'Immediately',
    locationPreference: 'Mission Bay or SoMa',
    notes: 'Buyer wants an apartment quickly near downtown San Francisco.',
    intent: 'ready_to_buy',
    type: 'Other',
    score: 92,
    summary: 'Immediate buyer with premium budget and clear location preference.',
    recommended_next_step: 'Call immediately and schedule a shortlist consultation.'
  },
  {
    name: 'Rohan Singh',
    email: 'rohan@urbanthreads.co',
    phone: '+91 98765 22222',
    location: 'Delhi, India',
    company: 'Urban Threads',
    source: 'mock_seed',
    leadCategory: 'marketing_agency',
    serviceNeeded: 'SEO',
    monthlyBudget: '$500-$1500',
    timeline: '1-3 months',
    businessType: 'Ecommerce',
    currentProblem: 'Organic traffic has flattened and paid acquisition is getting expensive.',
    notes: 'Interested in SEO but still comparing options.',
    intent: 'researching',
    type: 'Ecommerce',
    score: 58,
    summary: 'Good-fit ecommerce lead researching SEO with moderate budget and flexible timing.',
    recommended_next_step: 'Send a short SEO opportunity breakdown and follow up this week.'
  },
  {
    name: 'Maya Rodriguez',
    email: 'maya@example.com',
    phone: '+1 305 555 0142',
    location: 'Miami, USA',
    company: '',
    source: 'mock_seed',
    leadCategory: 'real_estate_agent',
    lookingTo: 'Sell',
    propertyType: 'Villa',
    budgetRange: '$300k-$700k',
    timeline: '1-3 months',
    locationPreference: 'Coral Gables',
    notes: 'Seller wants a valuation before listing their villa.',
    intent: 'researching',
    type: 'Other',
    score: 66,
    summary: 'Potential seller with a defined property and reasonable timeline, but still evaluating.',
    recommended_next_step: 'Offer a free valuation call and recent comparable sales report.'
  },
  {
    name: 'Emily Chen',
    email: 'emily@saasflow.io',
    phone: '+1 212 555 0170',
    location: 'New York, USA',
    company: 'SaaSFlow',
    source: 'mock_seed',
    leadCategory: 'marketing_agency',
    serviceNeeded: 'Automation',
    monthlyBudget: '$5000+',
    timeline: 'Within a month',
    businessType: 'SaaS',
    currentProblem: 'Sales team manually qualifies demo requests and loses follow-up speed.',
    notes: 'Needs automated lead routing and lifecycle emails.',
    intent: 'ready_to_buy',
    type: 'SaaS',
    score: 81,
    summary: 'Strong SaaS automation lead with high budget and clear operational pain.',
    recommended_next_step: 'Book a workflow mapping call and propose an automation roadmap.'
  },
  {
    name: 'Kabir Khan',
    email: 'kabir@example.com',
    phone: '+91 98765 33333',
    location: 'Bengaluru, India',
    company: 'Side Project Labs',
    source: 'mock_seed',
    leadCategory: 'marketing_agency',
    serviceNeeded: 'Social Media',
    monthlyBudget: 'Under $500',
    timeline: 'Exploring',
    businessType: 'Other',
    currentProblem: 'Wants general social media ideas for a side project.',
    notes: 'Low budget and no urgent commercial need.',
    intent: 'not_a_fit',
    type: 'Other',
    score: 24,
    summary: 'Low-budget exploratory lead without urgent business need.',
    recommended_next_step: 'Send a lightweight resource and avoid high-touch sales follow-up.'
  }
];

async function seedMockLeads() {
  if (!process.env.MONGO_URI) {
    throw new Error('Missing MONGO_URI in leads-api/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const removed = await Lead.deleteMany({ source: 'mock_seed' });
  const inserted = await Lead.insertMany(mockLeads);

  console.log(`Removed ${removed.deletedCount} previous mock leads.`);
  console.log(`Inserted ${inserted.length} mock leads.`);

  await mongoose.disconnect();
}

seedMockLeads().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});
