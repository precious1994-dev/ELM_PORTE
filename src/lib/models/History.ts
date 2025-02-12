import mongoose from 'mongoose';

export interface IHistoryItem {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface IHistory {
  mainTitle: string;
  subtitle: string;
  description: string;
  items: IHistoryItem[];
}

const historyItemSchema = new mongoose.Schema<IHistoryItem>({
  id: { type: String, required: true },
  year: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }
});

const historySchema = new mongoose.Schema<IHistory>({
  mainTitle: {
    type: String,
    required: true,
    default: "Notre Histoire"
  },
  subtitle: {
    type: String,
    required: true,
    default: "Un Héritage de Foi et d'Amour"
  },
  description: {
    type: String,
    required: true,
    default: "Depuis notre création, nous nous engageons à nourrir la foi des plus jeunes à travers un enseignement biblique adapté et des activités enrichissantes."
  },
  items: [historyItemSchema]
}, {
  timestamps: true
});

// Delete the existing model if it exists to prevent OverwriteModelError
if (mongoose.models.History) {
  delete mongoose.models.History;
}

const History = mongoose.model<IHistory>('History', historySchema);

export default History; 