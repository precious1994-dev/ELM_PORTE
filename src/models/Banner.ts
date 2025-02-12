import mongoose from 'mongoose';

export interface IBanner {
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new mongoose.Schema<IBanner>(
  {
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Banner || mongoose.model<IBanner>('Banner', bannerSchema); 