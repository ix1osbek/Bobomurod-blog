import { Post } from "../entities/Post.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
import { bot } from "../utils/telegram.js";
import slugify from "slugify";
import mongoose from "mongoose";

// READ ALL + SEARCH + PAGINATION
export const getPosts = asyncHandler(async (req, res) => {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 9;

    const query = search
        ? { $or: [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }] }
        : {};

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    res.json({
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: posts,
    });
});

// READ ONE (slug orqali ishlaydi, lekin nomi o'zgarmadi)
export const getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let post = null;

    // ID orqali qidirish
    if (mongoose.Types.ObjectId.isValid(id)) {
        post = await Post.findById(id);
        if (post) {
            // Frontend sahifasiga redirect
            return res.redirect(301, `https://ixlosware.uz/api/post/${post.slug}`);
        }
    }

    // Slug orqali qidirish
    post = await Post.findOne({ slug: id });

    if (!post) {
        return res.status(404).json({ message: "Post topilmadi" });
    }

    res.json({ success: true, data: post });
});


// CREATE
export const createPost = asyncHandler(async (req, res) => {
    const { title, content, metaTitle, metaDescription, metaKeywords } = req.body;
    if (!title || !content) throw new Error("Title va content talab qilinadi");

    let imageUrl = null;
    if (req.file) {
        const fileExt = req.file.originalname.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;

        const { error } = await supabase.storage.from("images").upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
        });
        if (error) throw new Error("Rasm yuklashda xatolik: " + error.message);

        imageUrl = supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl;
    }

    // 🔥 Meta fields
    const finalMetaTitle = metaTitle || title;
    const finalMetaDescription =
        metaDescription || content.substring(0, 160).replace(/\n/g, " ");
    const finalMetaKeywords =
        metaKeywords?.length ? metaKeywords : title.split(" ").slice(0, 10);

    const newPost = await Post.create({
        title,
        content,
        image: imageUrl,
        metaTitle: finalMetaTitle,
        metaDescription: finalMetaDescription,
        metaKeywords: finalMetaKeywords,
    });

    const postUrl = `https://ixlosware.uz/post/${newPost.slug}`;
    let caption = `<b>${title}</b>\n\n${content}\n\n<a href="${postUrl}">Post manbasi!</a>`;

    let telegramMessage;
    if (imageUrl) {
        telegramMessage = await bot.sendPhoto(process.env.TELEGRAM_CHANNEL_ID, imageUrl, {
            caption,
            parse_mode: "HTML",
        });
    } else {
        telegramMessage = await bot.sendMessage(process.env.TELEGRAM_CHANNEL_ID, caption, {
            parse_mode: "HTML",
        });
    }

    newPost.telegramMessageId = telegramMessage.message_id;
    await newPost.save();

    res.status(201).json({ success: true, data: newPost });
});

// UPDATE
export const updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, metaTitle, metaDescription, metaKeywords } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post topilmadi" });

    if (req.file) {
        const fileExt = req.file.originalname.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const { error } = await supabase.storage.from("images").upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
        });
        if (error) throw new Error("Rasm yuklashda xatolik: " + error.message);
        post.image = supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl;
    }

    // 🔥 Title va slug yangilash
    if (title && title !== post.title) {
        post.title = title;
        post.slug = slugify(title, { lower: true, strict: true });
    }

    post.content = content || post.content;

    // 🔥 Meta yangilash
    post.metaTitle = metaTitle || post.title;
    post.metaDescription = metaDescription || post.content.substring(0, 160).replace(/\n/g, " ");
    post.metaKeywords = metaKeywords?.length ? metaKeywords : post.title.split(" ").slice(0, 10);

    await post.save();

    // 🔥 Telegram xabarni yangilash
    if (post.telegramMessageId) {
        const postUrl = `https://ixlosware.uz/post/${post.slug}`;
        let caption = `<b>${post.title}</b>\n\n${post.content}\n\n<a href="${postUrl}">Post manbasi!</a>`;

        try {
            if (post.image) {
                await bot.editMessageCaption(caption, {
                    chat_id: process.env.TELEGRAM_CHANNEL_ID,
                    message_id: post.telegramMessageId,
                    parse_mode: "HTML",
                });
            } else {
                await bot.editMessageText(caption, {
                    chat_id: process.env.TELEGRAM_CHANNEL_ID,
                    message_id: post.telegramMessageId,
                    parse_mode: "HTML",
                });
            }
        } catch (err) {
            console.error("Telegram xabarni update qilishda xato:", err.message);
        }
    }

    res.json({ success: true, data: post });
});
// DELETE
export const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params; // _id orqali o'chiriladi

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post topilmadi" });

    if (post.telegramMessageId) {
        try {
            await bot.deleteMessage(process.env.TELEGRAM_CHANNEL_ID, post.telegramMessageId);
        } catch (err) {
            console.error("Telegram xabarni o'chirishda xato:", err.message);
        }
    }
    await Post.findByIdAndDelete(id);

    res.json({ success: true, message: "Post o'chirildi va Telegramdan ham o'chirildi" });
});

// ADD VIEW (slug orqali)
export const addView = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findOneAndUpdate(
        { slug: id },
        { $inc: { views: 1 } },
        { new: true }
    );

    if (!post) return res.status(404).json({ message: "Post topilmadi" });
    res.json({ success: true, data: { views: post.views } });
});
