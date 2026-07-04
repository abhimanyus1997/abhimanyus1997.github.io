export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, voice_url } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const ttsUrl = process.env.TTS_BASE_URL || 'http://13.126.102.204:5555/tts';

  try {
    const formData = new FormData();
    formData.append('text', text);
    if (voice_url) {
      formData.append('voice_url', voice_url);
    }

    const response = await fetch(ttsUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `TTS error: ${errorText}` });
    }

    // Set headers for binary audio response
    res.setHeader('Content-Type', 'audio/wav');
    
    // Read the body as buffer and send it
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Error in TTS proxy:', error);
    return res.status(500).json({ error: error.message });
  }
}
