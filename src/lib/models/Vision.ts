import mongoose, { Schema, model, models } from 'mongoose';

interface IVision {
  mainTitle: string;
  subtitle: string;
  description: string;
  points: {
    id: string;
    title: string;
    description: string;
  }[];
}

const visionPointSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const visionSchema = new Schema<IVision>({
  mainTitle: {
    type: String,
    required: true,
    default: "Notre Vision"
  },
  subtitle: {
    type: String,
    required: true,
    default: "Notre Vision pour l'Avenir"
  },
  description: {
    type: String,
    required: true,
    default: "Notre vision est de créer un environnement où chaque personne peut grandir spirituellement et s'épanouir dans sa relation avec Dieu."
  },
  points: {
    type: [visionPointSchema],
    required: true,
    default: () => ([
      {
        id: "1",
        title: "Une Communauté Vibrante",
        description: "Construire une communauté dynamique où chacun peut trouver sa place et grandir dans sa foi."
      },
      {
        id: "2",
        title: "Formation Spirituelle",
        description: "Offrir une formation biblique solide pour équiper chaque membre dans sa marche avec Dieu."
      },
      {
        id: "3",
        title: "Impact Local",
        description: "Être une lumière dans notre communauté locale à travers des actions concrètes d'amour et de service."
      }
    ])
  }
});

// Delete the existing model if it exists to prevent OverwriteModelError
if (mongoose.models.Vision) {
  delete mongoose.models.Vision;
}

const Vision = model<IVision>('Vision', visionSchema);

export default Vision; 