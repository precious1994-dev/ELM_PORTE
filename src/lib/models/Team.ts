import mongoose, { Model } from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const teamSchema = new mongoose.Schema({
  members: [memberSchema],
  subtitle: {
    type: String,
    default: "Une Équipe Dévouée",
  },
  description: {
    type: String,
    default: "Notre équipe passionnée s'engage à guider et à inspirer les enfants dans leur cheminement spirituel.",
  },
}, { timestamps: true });

// Use type assertion to handle the model type
const Team = (mongoose.models.Team || mongoose.model('Team', teamSchema)) as Model<any>;

export { Team }; 