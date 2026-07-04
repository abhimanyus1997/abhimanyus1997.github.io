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

  const baseUrl = process.env.LITELLM_BASE_URL || process.env.VITE_LITELLM_BASE_URL || 'http://13.126.102.204:4000';
  const apiKey = process.env.LITELLM_API_KEY || process.env.VITE_LITELLM_API_KEY || 'sk-ONyS5ZITbsCtHZZGZa4VHg';

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `LiteLLM error: ${errorText}` });
    }

    // Support streaming if requested
    if (req.body.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
      res.end();
    } else {
      const data = await response.json();
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error('Error in chat proxy:', error);
    return res.status(500).json({ error: error.message });
  }
}
