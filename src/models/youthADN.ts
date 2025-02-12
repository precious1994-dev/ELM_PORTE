import mongoose from 'mongoose';

export interface VisionCard {
  icon: string;
  title: string;
  description: string;
}

export interface AdnContent {
  mainTitle: string;
  subtitle: string;
  description: string;
  cards: VisionCard[];
}

const adnSchema = new mongoose.Schema({
  mainTitle: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  cards: [{
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  }]
}, {
  timestamps: true
});

export default mongoose.models.YouthADN || mongoose.model('YouthADN', adnSchema); 