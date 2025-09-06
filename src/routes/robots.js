
import { Router } from "express";

const router = Router();

router.get("/robots.txt", (req, res) => {
  const robots = `
User-agent: *
Allow: /

Sitemap: https://ixlosware.uz/sitemap.xml
  `;
  res.type("text/plain");
  res.send(robots);
});

export default router;
