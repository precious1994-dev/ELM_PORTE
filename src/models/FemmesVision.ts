import mongoose from 'mongoose'

export interface IVisionPoint {
  title: string
  description: string
  icon: string
}

export interface IFemmesVision {
  subtitle: string
  title: string
  description: string
  points: IVisionPoint[]
}

const visionPointSchema = new mongoose.Schema<IVisionPoint>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true }
})

const femmesVisionSchema = new mongoose.Schema<IFemmesVision>({
  subtitle: { 
    type: String, 
    default: 'Notre Vision'
  },
  title: { 
    type: String, 
    default: 'Notre Mission'
  },
  description: { 
    type: String, 
    default: 'Encourager chaque femme à découvrir son identité en Christ et à vivre pleinement son appel.'
  },
  points: {
    type: [visionPointSchema],
    default: [
      {
        title: 'Croissance Spirituelle',
        description: 'Approfondir sa relation avec Dieu à travers la prière et l\'étude de la Parole.',
        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
      },
      {
        title: 'Soutien Mutuel',
        description: 'Créer un environnement bienveillant où chaque femme peut trouver écoute et encouragement.',
        icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
      },
      {
        title: 'Développement Personnel',
        description: 'Accompagner chaque femme dans son épanouissement spirituel et personnel.',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z'
      }
    ]
  }
}, {
  timestamps: true
})

// Delete the existing model if it exists to prevent OverwriteModelError
if (mongoose.models.FemmesVision) {
  delete mongoose.models.FemmesVision
}

const FemmesVision = mongoose.model<IFemmesVision>('FemmesVision', femmesVisionSchema)

export default FemmesVision 