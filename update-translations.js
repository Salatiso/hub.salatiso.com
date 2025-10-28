import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, 'src', 'locales');
const enFile = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

// Get all language files except English
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'en.json');

console.log('Updating translations for all languages...\n');

// Update each language file
files.forEach(file => {
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Add new sections if they don't exist
  if (!data.events) {
    data.events = enData.events; // Copy English translations for now
  } else {
    // Update existing sections with new keys
    data.events = { ...enData.events, ...data.events };
  }

  // Ensure all new keys are present
  data.events = enData.events;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Updated ${file}`);
});

console.log('\n🎉 All translation files updated successfully!');
console.log('Note: Non-English translations contain English text as placeholders.');
console.log('Please translate them to the appropriate languages.');