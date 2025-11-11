export default function handler(req, res) {
  if (req.method === 'POST') {
    const { name, template } = req.body;
    // Server-side log
    console.log(`[LOG] Certificate generated for: ${name} (Template: ${template})`);
    res.status(200).json({ success: true, message: 'Generation logged' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}