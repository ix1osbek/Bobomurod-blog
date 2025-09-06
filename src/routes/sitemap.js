// routes/sitemap.js
import { Router } from "express";
import {Post} from "../entities/Post.js";
 // sizning post modelingiz

const router = Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const posts = await Post.find().select("slug createdAt");

    const baseUrl = "https://ixlosware.uz";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    posts.forEach(post => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/post/${post.slug}</loc>\n`;
      xml += `    <lastmod>${post.createdAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);

  } catch (error) {
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
