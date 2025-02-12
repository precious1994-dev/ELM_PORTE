import mongoose from 'mongoose'

export interface IFemmesBanner {
  imageUrl: string
  welcome: string
  title: string
  subtitle: string
  description: string
  schedule: string
  location: string
  updatedAt: Date
}

const femmesBannerSchema = new mongoose.Schema<IFemmesBanner>({
  imageUrl: { type: String, default: '' },
  welcome: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  schedule: { type: String, default: '' },
  location: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Delete the existing model if it exists to prevent OverwriteModelError
if (mongoose.models.FemmesBanner) {
  delete mongoose.models.FemmesBanner
}

const FemmesBanner = mongoose.model<IFemmesBanner>('FemmesBanner', femmesBannerSchema)

export default FemmesBanner 