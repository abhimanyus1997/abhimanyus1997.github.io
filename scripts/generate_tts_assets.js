import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUDIO_DIR = path.join(__dirname, '..', 'public', 'static', 'audio');
fs.mkdirSync(AUDIO_DIR, { recursive: true });

const ttsUrl = 'https://tts.abhimanyu.fyi/tts';

const audios = {
  // Abhimanyu Welcome Messages
  'welcome-abhimanyu-1': "Access granted. Welcome back, pilot Abhimanyu. Systems initialized.",
  'welcome-abhimanyu-2': "Welcome back, Abhimanyu. The neural core is fully operational.",
  'welcome-abhimanyu-3': "Authentication successful. Good to see you, Abhimanyu.",
  'welcome-abhimanyu-4': "Neural link synchronized. Welcome back, commander Abhimanyu.",

  // Unknown Sir Welcome Messages
  'welcome-unknown-male-1': "You are not Abhimanyu. But happy to welcome you, sir.",
  'welcome-unknown-male-2': "Intruder alert. Just kidding. Welcome, sir.",
  'welcome-unknown-male-3': "Access restricted to pilot. Welcome anyway, sir.",
  'welcome-unknown-male-4': "Identity mismatch. But you are welcome here, sir.",

  // Unknown Madam Welcome Messages
  'welcome-unknown-female-1': "You are not Abhimanyu. But happy to welcome you, madam.",
  'welcome-unknown-female-2': "Intruder alert. Just kidding. Welcome, madam.",
  'welcome-unknown-female-3': "Access restricted to pilot. Welcome anyway, madam.",
  'welcome-unknown-female-4': "Identity mismatch. But you are welcome here, madam.",

  // Group Welcome Messages
  'welcome-group-1': "I can see a lot of people around you, but I want to focus on you.",
  'welcome-group-2': "Multiple subjects detected. Locking coordinate focus on the primary pilot.",
  'welcome-group-3': "Crowded environment detected. Isolating main neural profile link.",

  // Navigation Prompt Query
  'welcome-prompt-query': "Where would you like to go? You can say: Projects, Experience, or About."
};

async function generate() {
  console.log(`Generating TTS audio files in ${AUDIO_DIR}...`);
  for (const [filename, text] of Object.entries(audios)) {
    const filePath = path.join(AUDIO_DIR, `${filename}.wav`);
    if (fs.existsSync(filePath)) {
      console.log(`Skipping ${filename}.wav (already exists)`);
      continue;
    }
    
    console.log(`Generating: ${filename}.wav -> "${text}"`);
    try {
      const params = new URLSearchParams();
      params.append('text', text);
      
      const response = await fetch(ttsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      console.log(`Saved ${filename}.wav`);
      
      // Delay slightly between requests
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      console.error(`Failed to generate ${filename}.wav:`, err);
    }
  }
  console.log("TTS audio generation completed!");
}

generate();
