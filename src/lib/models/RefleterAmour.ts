import mongoose, { Schema, model, models } from 'mongoose';

interface IValue {
  id: string;
  title: string;
  description: string;
}

interface IRefleterAmour {
  mainTitle: string;
  subtitle: string;
  description: string;
  values: IValue[];
}

const valueSchema = new Schema<IValue>({
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

const refleterAmourSchema = new Schema<IRefleterAmour>({
  mainTitle: {
    type: String,
    required: true,
    default: "Refléter l'Amour du Christ"
  },
  subtitle: {
    type: String,
    required: true,
    default: "Notre Mission"
  },
  description: {
    type: String,
    required: true,
    default: "Notre engagement est de refléter l'amour du Christ dans tout ce que nous faisons, en créant un environnement bienveillant où chaque enfant peut grandir dans sa foi."
  },
  values: {
    type: [valueSchema],
    required: true,
    default: () => ([
      {
        id: "1",
        title: "Un Accueil Chaleureux",
        description: "Nous croyons en l'importance d'accueillir chaque personne avec amour et bienveillance, comme le Christ nous a accueillis."
      },
      {
        id: "2",
        title: "Le Service aux Autres",
        description: "Suivant l'exemple du Christ, nous nous engageons à servir notre prochain et à répondre aux besoins de notre communauté."
      },
      {
        id: "3",
        title: "La Croissance Spirituelle",
        description: "Nous encourageons chacun à grandir dans sa relation avec Dieu et à développer une foi authentique et vivante."
      }
    ])
  }
});

// Delete the existing model if it exists to prevent OverwriteModelError
if (mongoose.models.RefleterAmour) {
  delete mongoose.models.RefleterAmour;
}

const RefleterAmour = model<IRefleterAmour>('RefleterAmour', refleterAmourSchema);

export default RefleterAmour; 