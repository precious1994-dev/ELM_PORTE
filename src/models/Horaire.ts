import mongoose from 'mongoose';

export interface IHoraire {
  _id: mongoose.Types.ObjectId;
  day: string;
  time: string;
  description: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const HoraireSchema = new mongoose.Schema<IHoraire>({
  day: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Horaire || mongoose.model<IHoraire>('Horaire', HoraireSchema); 