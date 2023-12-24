import { Schema, model } from "mongoose";

const studentSchema = new Schema(
  {
    name: String,
    mentor: String,
    previousmentor: String,
  },
  { timestamps: true }
);

const studentModel = model("student", studentSchema);

export default studentModel;
