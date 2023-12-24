import { Schema, model } from "mongoose";

const mentorSchema = new Schema(
  {
    name: String,
    student: {
      type: Array,
    },
  },
  { timestamps: true }
);

const mentorModel = model("mentor", mentorSchema);

export default mentorModel;
