import mongoose, { Schema, model, models } from 'mongoose'

// Banner Model
const BannerSchema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true })

// Vision Model
const VisionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  points: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true })

// About Model
const AboutSchema = new Schema({
  mainTitle: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  cards: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true })

// Schedule Model
const ScheduleSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  maxParticipants: { type: Number, required: true },
  currentParticipants: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Team Member Model
const TeamMemberSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Process Model
const ProcessSchema = new Schema({
  mainTitle: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  steps: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true })

// Check if the model exists before creating a new one
export const BaptemeBanner = models.BaptemeBanner || model('BaptemeBanner', BannerSchema)
export const BaptemeVision = models.BaptemeVision || model('BaptemeVision', VisionSchema)
export const BaptemeAbout = models.BaptemeAbout || model('BaptemeAbout', AboutSchema)
export const BaptemeSchedule = models.BaptemeSchedule || model('BaptemeSchedule', ScheduleSchema)
export const BaptemeTeam = models.BaptemeTeam || model('BaptemeTeam', TeamMemberSchema)
export const BaptemeProcess = models.BaptemeProcess || model('BaptemeProcess', ProcessSchema) 