export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const baseUrl = process.env.LITELLM_BASE_URL || process.env.VITE_LITELLM_BASE_URL || 'http://13.126.102.204:4000';
  const apiKey = process.env.LITELLM_API_KEY || process.env.VITE_LITELLM_API_KEY || 'sk-ONyS5ZITbsCtHZZGZa4VHg';

  try {
    const response = await fetch(`${baseUrl}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `LiteLLM returned status ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    return res.status(500).json({ error: error.message });
  }
}
