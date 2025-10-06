export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { modelBase64Data, modelMimeType, fullPrompt } = req.body;

    if (!modelBase64Data || !modelMimeType || !fullPrompt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: fullPrompt },
            { inlineData: { mimeType: modelMimeType, data: modelBase64Data } },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return res.status(response.status).json({ error: errBody });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
