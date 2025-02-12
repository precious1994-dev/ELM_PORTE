import mongoose, { Schema } from "mongoose";

const childrenTeamSchema = new Schema(
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
  },
  {
    timestamps: true,
  }
);

const ChildrenTeam = mongoose.models.ChildrenTeam || mongoose.model("ChildrenTeam", childrenTeamSchema);

export default ChildrenTeam; 