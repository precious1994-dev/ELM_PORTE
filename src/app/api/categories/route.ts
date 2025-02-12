import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import mongoose from 'mongoose';

// Define Category Schema if not already defined elsewhere
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Get the model, or create it if it doesn't exist
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({});
    
    return NextResponse.json(categories.map(category => ({
      id: category._id.toString(),
      name: category.name
    })));
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: "Le nom de la catégorie est requis" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return NextResponse.json(
        { error: "Cette catégorie existe déjà" },
        { status: 400 }
      );
    }

    const category = await Category.create({ name });

    return NextResponse.json({
      id: category._id.toString(),
      name: category.name
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de la catégorie est requis" },
        { status: 400 }
      );
    }

    await dbConnect();
    const result = await Category.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la catégorie" },
      { status: 500 }
    );
  }
} 