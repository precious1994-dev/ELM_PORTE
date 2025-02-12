import mongoose from 'mongoose'

export interface IActivity {
  title: string
  description: string
  imageUrl: string
  schedule?: string
  location?: string
}

export interface IFemmesActivites {
  sectionTitle: string
  subtitle: string
  description: string
  activities: IActivity[]
}

const activitySchema = new mongoose.Schema<IActivity>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  schedule: { type: String },
  location: { type: String }
})

const femmesActivitesSchema = new mongoose.Schema<IFemmesActivites>({
  sectionTitle: { 
    type: String, 
    default: 'Nos Activités' 
  },
  subtitle: { 
    type: String, 
    default: 'Rejoignez-nous' 
  },
  description: { 
    type: String, 
    default: 'Découvrez nos différentes activités conçues pour encourager la croissance spirituelle et la communion fraternelle.'
  },
  activities: {
    type: [activitySchema],
    default: [
      {
        title: 'Études Bibliques',
        description: 'Des moments d\'étude approfondie de la Parole de Dieu en petits groupes.',
        imageUrl: '/images/bible-study.jpg',
        schedule: 'Mardi 19h00',
        location: 'Salle principale'
      },
      {
        title: 'Petit-déjeuner Prière',
        description: 'Un temps de prière et de partage autour d\'un petit-déjeuner convivial.',
        imageUrl: '/images/prayer-breakfast.jpg',
        schedule: 'Samedi 9h00',
        location: 'Cafétéria'
      },
      {
        title: 'Retraites Spirituelles',
        description: 'Des weekends de ressourcement spirituel et de communion fraternelle.',
        imageUrl: '/images/retreat.jpg',
        schedule: 'Trimestriel',
        location: 'Selon l\'événement'
      }
    ]
  }
}, {
  timestamps: true
})

// Delete the existing model if it exists to prevent OverwriteModelError
if (mongoose.models.FemmesActivites) {
  delete mongoose.models.FemmesActivites
}

const FemmesActivites = mongoose.model<IFemmesActivites>('FemmesActivites', femmesActivitesSchema)

export default FemmesActivites 