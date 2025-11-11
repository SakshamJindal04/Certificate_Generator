// pages/api/templates.js

export default function handler(req, res) {
  // Only respond to GET requests
  if (req.method === 'GET') {
    res.status(200).json([
      {
        id: "tpl-classic",
        name: "Classic Elegant",
        description: "Gold border, serif fonts, traditional.",
        thumbnail: "/images/thumb-classic.png",
      },
      {
        id: "tpl-modern",
        name: "Modern Minimal",
        description: "Clean lines, sans-serif, corporate.",
        thumbnail: "/images/thumb-modern.png",
      },
      {
        id: "tpl-dark",
        name: "Dark Premium",
        description: "Dark background with gold text.",
        thumbnail: "/images/thumb-dark.png",
      },
    ]);
  } else {
    // For any method other than GET
    res.status(405).json({ error: "Method not allowed" });
  }
}