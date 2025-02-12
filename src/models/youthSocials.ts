import mongoose from 'mongoose'

const youthSocialsSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ['instagram', 'facebook', 'youtube', 'tiktok']
    },
    url: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

const YouthSocials = mongoose.models.YouthSocials || mongoose.model('YouthSocials', youthSocialsSchema)

export default YouthSocials 