import mongoose from "mongoose";

const youthTeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
  },
  {
    timestamps: true,
  }
);

const YouthTeam = mongoose.models.YouthTeam || mongoose.model("YouthTeam", youthTeamSchema);

export default YouthTeam; 