import { Schema, model, models } from 'mongoose';

const communitySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  yearsPresence: {
    type: Number,
    required: true,
    min: 0,
  },
  activeMembers: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Community = models.Community || model('Community', communitySchema);

export default Community; 