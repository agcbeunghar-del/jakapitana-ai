export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { modelBase64Data, modelMimeType, fullPrompt } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    // Request ke Gemini API lewat server-side (bukan browser)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: fullPrompt },
                { inlineData: { mimeType: modelMimeType, data: modelBase64Data } },
              ],
            },
          ],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({ error: data.error || "Gemini API Error" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
