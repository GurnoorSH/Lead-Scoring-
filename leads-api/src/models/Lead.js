const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    source: { type: String, trim: true, default: 'website' },
    leadCategory: {
      type: String,
      enum: ['marketing_agency', 'real_estate_agent', 'unknown'],
      default: 'unknown'
    },

    serviceNeeded: { type: String, trim: true, default: '' },
    monthlyBudget: { type: String, trim: true, default: '' },
    businessType: { type: String, trim: true, default: '' },
    currentProblem: { type: String, trim: true, default: '' },

    lookingTo: { type: String, trim: true, default: '' },
    propertyType: { type: String, trim: true, default: '' },
    budgetRange: { type: String, trim: true, default: '' },
    locationPreference: { type: String, trim: true, default: '' },
    timeline: { type: String, trim: true, default: '' },

    intent: { type: String, trim: true, default: '' },
    type: { type: String, trim: true, default: '' },
    score: { type: Number, min: 0, max: 100, default: 0 },
    summary: { type: String, trim: true, default: '' },
    recommended_next_step: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['hot', 'warm', 'cold'],
      default: 'cold'
    },
    emailSent: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

LeadSchema.pre('validate', function setStatusFromScore(next) {
  if (typeof this.score === 'number') {
    this.status = this.score >= 70 ? 'hot' : this.score >= 40 ? 'warm' : 'cold';
  }
  next();
});

module.exports = mongoose.model('Lead', LeadSchema);
