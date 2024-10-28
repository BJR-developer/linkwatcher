import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  checkInterval: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['up', 'down', 'pending'],
    default: 'pending'
  },
  lastChecked: {
    type: Date,
    default: null
  },
  nextCheck: {
    type: Date,
    default: Date.now
  },
  checksCount: {
    type: Number,
    default: 0
  },
  lastStatus: {
    code: Number,
    message: String
  }
}, {
  timestamps: true
});

export default mongoose.models.Url || mongoose.model('Url', urlSchema);