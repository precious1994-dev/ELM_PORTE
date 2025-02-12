import mongoose from 'mongoose'

const SlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
  },
  buttonLink: {
    type: String,
  },
})

const VisionItemSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})

const VisionSectionSchema = new mongoose.Schema({
  mainTitle: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  items: {
    type: [VisionItemSchema],
    required: true,
  },
})

const HomepageSchema = new mongoose.Schema({
  sliderSection: {
    slides: {
      type: [SlideSchema],
      required: true,
      default: [],
    },
  },
  visionSection: {
    type: VisionSectionSchema,
    required: true,
  },
}, {
  timestamps: true,
})

export default mongoose.models.Homepage || mongoose.model('Homepage', HomepageSchema) 