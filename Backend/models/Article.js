import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    title: { type: String, default: "" },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Article", ArticleSchema);