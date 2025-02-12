import mongoose from 'mongoose'

export interface ITeamMember {
  name: string
  role: string
  imageUrl: string
}

export interface IFemmesEquipe {
  sectionTitle: string
  subtitle: string
  description: string
  members: ITeamMember[]
}

// Delete the model if it exists to prevent OverwriteModelError
if (mongoose.models.FemmesEquipe) {
  delete mongoose.models.FemmesEquipe
}

const teamMemberSchema = new mongoose.Schema<ITeamMember>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  imageUrl: { type: String, required: true }
})

const femmesEquipeSchema = new mongoose.Schema<IFemmesEquipe>({
  sectionTitle: {
    type: String,
    required: true,
    default: 'Notre Équipe'
  },
  subtitle: {
    type: String,
    required: true,
    default: 'Leadership'
  },
  description: {
    type: String,
    required: true,
    default: 'Une équipe dévouée au service et à l\'accompagnement spirituel des femmes.'
  },
  members: {
    type: [teamMemberSchema],
    required: true,
    default: [
      {
        name: 'Claire Dubois',
        role: 'Responsable du Ministère',
        imageUrl: '/images/team/claire.jpg'
      },
      {
        name: 'Marie-Anne Laurent',
        role: 'Coordinatrice des Activités',
        imageUrl: '/images/team/marie-anne.jpg'
      },
      {
        name: 'Sophie Martin',
        role: 'Responsable des Études Bibliques',
        imageUrl: '/images/team/sophie.jpg'
      }
    ]
  }
})

const FemmesEquipe = mongoose.model<IFemmesEquipe>('FemmesEquipe', femmesEquipeSchema)

export default FemmesEquipe 