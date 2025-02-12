import mongoose from 'mongoose'

export interface IContactBanner {
  imageUrl: string
  title: string
  subtitle: string
  description: string
}

// Delete the model if it exists to prevent OverwriteModelError
if (mongoose.models.ContactBanner) {
  delete mongoose.models.ContactBanner
}

const contactBannerSchema = new mongoose.Schema<IContactBanner>({
  imageUrl: {
    type: String,
    required: true,
    default: '/images/contact-banner.jpg'
  },
  title: {
    type: String,
    required: true,
    default: 'Contactez-nous'
  },
  subtitle: {
    type: String,
    required: true,
    default: 'Nous sommes à votre écoute'
  },
  description: {
    type: String,
    required: true,
    default: 'N\'hésitez pas à nous contacter pour toute question ou demande d\'information.'
  }
})

export default mongoose.model<IContactBanner>('ContactBanner', contactBannerSchema) 