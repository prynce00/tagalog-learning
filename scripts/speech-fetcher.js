const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Load your HSK JSON data
const hskData = require('../src/data/hsk_characters.json'); // Adjust the path as needed

const url = 'https://www.texttovoice.online/scripts/awsRequest2.php';
const soundDir = path.resolve(__dirname, 'sound');

// Create the sound directory if it doesn't exist
if (!fs.existsSync(soundDir)) {
  fs.mkdirSync(soundDir);
}

const downloadSound = async ({character, pinyin}) => {
  // Encode the pinyin to create a safe filename
  const encodedPinyin = encodeURIComponent(pinyin);
  const voiceDir = path.join(soundDir, 'Zhiyu'); // Directory for the voice
  const filePath = path.join(voiceDir, `${encodedPinyin}.mp3`); // File path using pinyin

  // Check if the file already exists
  if (fs.existsSync(filePath)) {
    console.log(`File already exists for pinyin: ${pinyin}`);
    return { character, sound: { Zhiyu: filePath } }; // Return existing sound
  }

  const formData = new FormData();
  formData.append('ttv_mode', 1);
  formData.append('bgMusic', '');
  formData.append('userID', 'guest1472761379');
  formData.append('provider', 'aws');
  formData.append('text', character);
  formData.append('voice', 'Zhiyu');
  formData.append('language', 'cmn-CN');
  formData.append('speed', 100);
  formData.append('volume', 3);
  formData.append('exaggeration', '');
  formData.append('usePremium', 0);
  formData.append('premium', 0);
  formData.append('voiceStyle', 'neutral');
  formData.append('isEmotion', 0);
  formData.append('vol', 0.3);
  formData.append('rand', 20);
  formData.append('isSample', 0);
  formData.append('useSSML', 0);
  formData.append('voiceName', 'Zhiyu');

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log(`Downloading sound for character: ${character} with pinyin: ${pinyin}`);
    const content = response.data; // Adjust if necessary to get the correct structure
    const downloadUrl = `https://www.texttovoice.online/${content.content}`; // Correct URL structure

    const audioResponse = await axios.get(downloadUrl, { responseType: 'stream' });

    // Create the directory for the voice if it doesn't exist
    if (!fs.existsSync(voiceDir)) {
      fs.mkdirSync(voiceDir, { recursive: true });
    }

    const writer = fs.createWriteStream(filePath);
    audioResponse.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Downloaded sound for pinyin: ${pinyin}`);
        resolve({ character, sound: { Zhiyu: filePath } });
      });
      writer.on('error', (err) => {
        console.error(`Error writing file for ${character}:`, err.message);
        reject(err);
      });
    });
  } catch (error) {
    console.error(`Error downloading sound for ${character}:`, error.message);
    return null; // Return null or handle the error as needed
  }
};



const processHSKData = async () => {
  const results = [];

  for (const item of hskData) {
    const { character, pinyin} = item; 
    const soundData = await downloadSound({character,pinyin});
    if (soundData) {
      item.sound = soundData.sound; // Add sound entry to the item
      results.push(item);
    }
  }

  // Optionally save the updated HSK data to a new file
  fs.writeFileSync(path.join(__dirname, 'updated_hsk.json'), JSON.stringify(results, null, 2));
  console.log('All sounds downloaded and updated in HSK data.');
};

// Start processing
processHSKData();
