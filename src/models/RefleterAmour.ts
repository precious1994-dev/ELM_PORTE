import mongoose from 'mongoose';

interface IRefleterAmour {
  title: string;
  subtitle?: string;
  description: string;
  content: {
    title: string;
    description: string;
  }[];
}

const refleterAmourSchema = new mongoose.Schema<IRefleterAmour>({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  content: [{
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

export type { IRefleterAmour };
export default mongoose.models.RefleterAmour || mongoose.model<IRefleterAmour>('RefleterAmour', refleterAmourSchema); 