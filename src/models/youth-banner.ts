import mongoose from 'mongoose';

export interface BannerContent {
  imageUrl: string;
  welcome: string;
  title: string;
  subtitle: string;
  description: string;
  schedule?: string;
  location?: string;
}

const bannerSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  welcome: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  schedule: { type: String },
  location: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.YouthBanner || mongoose.model('YouthBanner', bannerSchema); 