import { Schema, model, models, Model } from 'mongoose';

interface ISermon {
  title: string;
  speaker: string;
  date: Date;
  passage: string;
  description: string;
  duration: string;
  image: string;
  pasteurImage?: string;
  youtubeUrl: string;
  series?: string;
  isWeeklyMessage?: boolean;
  weeklyMessageExpiry?: Date;
}

const sermonSchema = new Schema<ISermon>({
  title: {
    type: String,
    required: true,
  },
  speaker: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  passage: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  pasteurImage: {
    type: String,
    required: false,
  },
  youtubeUrl: {
    type: String,
    required: true,
  },
  series: {
    type: String,
    required: false,
  },
  isWeeklyMessage: {
    type: Boolean,
    default: false,
  },
  weeklyMessageExpiry: {
    type: Date,
    required: false,
  },
}, {
  timestamps: true,
});

// Fix for "Cannot read properties of undefined (reading 'Sermon')"
const Sermon = (models.Sermon || model<ISermon>('Sermon', sermonSchema)) as Model<ISermon>;

export type { ISermon };
export default Sermon; 