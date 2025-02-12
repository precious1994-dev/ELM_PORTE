import mongoose from 'mongoose'

export interface IContactInformations {
  phone: string
  email: string
  address: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  transportation: {
    metro: string
    bus: string
  }
  parking: string
  socialMedia: {
    facebook: string
    instagram: string
    youtube: string
  }
}

// Delete the model if it exists to prevent OverwriteModelError
if (mongoose.models.ContactInformations) {
  delete mongoose.models.ContactInformations
}

const contactInformationsSchema = new mongoose.Schema<IContactInformations>({
  phone: {
    type: String,
    required: true,
    default: '+33 1 23 45 67 89'
  },
  email: {
    type: String,
    required: true,
    default: 'contact@eglise.fr'
  },
  address: {
    street: {
      type: String,
      required: true,
      default: "123 Rue de l'Église"
    },
    city: {
      type: String,
      required: true,
      default: 'Paris'
    },
    postalCode: {
      type: String,
      required: true,
      default: '75000'
    },
    country: {
      type: String,
      required: true,
      default: 'France'
    }
  },
  transportation: {
    metro: {
      type: String,
      required: true,
      default: 'Ligne 6, station Église'
    },
    bus: {
      type: String,
      required: true,
      default: 'Lignes 30, 56, arrêt Église'
    }
  },
  parking: {
    type: String,
    required: true,
    default: 'Un parking gratuit est disponible pour nos visiteurs le dimanche.'
  },
  socialMedia: {
    facebook: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: ''
    },
    youtube: {
      type: String,
      default: ''
    }
  }
})

export default mongoose.model<IContactInformations>('ContactInformations', contactInformationsSchema) 