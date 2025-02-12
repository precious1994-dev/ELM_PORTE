import mongoose, { Schema } from "mongoose";

const youthScheduleSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    day: {
      type: String,
      required: [true, "Day is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Delete the model if it exists to prevent OverwriteModelError
if (mongoose.models.YouthSchedule) {
  delete mongoose.models.YouthSchedule;
}

const YouthSchedule = mongoose.model("YouthSchedule", youthScheduleSchema);

export default YouthSchedule; 