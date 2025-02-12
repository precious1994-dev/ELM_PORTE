import mongoose from 'mongoose';

const SeriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Add case-insensitive collation to the name index
SeriesSchema.index({ name: 1 }, { 
  unique: true,
  collation: { locale: 'fr', strength: 2 }
});

SeriesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Drop and recreate the model to ensure index changes take effect
const Series = mongoose.models.Series;
if (Series) {
  mongoose.deleteModel('Series');
}

export default mongoose.models.Series || mongoose.model('Series', SeriesSchema); 