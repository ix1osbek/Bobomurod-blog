import mongoose from "mongoose";
import slugify from "slugify";

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        image: { type: String, default: null },
        views: { type: Number, default: 0 },
        telegramMessageId: { type: Number },

        // 🔥 SEO fields
        slug: { type: String, unique: true },
        metaTitle: { type: String },
        metaDescription: { type: String },
        metaKeywords: [{ type: String }],
    },
    { timestamps: true }
);

// Slug avtomatik title'dan yaratiladi
postSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

export const Post = mongoose.model("Post", postSchema);
