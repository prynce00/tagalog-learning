import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON data
const jsonFilePath = path.join(__dirname, "../src/data/filipino_words.json");
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

// Directory to save the sound files
const soundDirectory = path.join(__dirname, "../src/assets/sounds");

// Create the sound folder if it doesn't exist
if (!fs.existsSync(soundDirectory)) {
  fs.mkdirSync(soundDirectory);
}

const downloadMP3 = async (word) => {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=fil&q=${encodeURIComponent(
    word
  )}`;
  const filePath = path.join(soundDirectory, `${word}.mp3`);

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, response.data);
    console.log(`⬇️  Downloaded: ${word}`);
    return true;
  } catch (err) {
    console.error(`❌ Error downloading ${word}:`, err.message);
    return false;
  }
};

const downloadAllWords = async () => {
  const existingFiles = new Set(fs.readdirSync(soundDirectory));
  const expectedFiles = new Set(jsonData.map((item) => `${item.word}.mp3`));
  let downloadCount = 0;

  // Step 1: Download only missing MP3s
  for (const item of jsonData) {
    const filename = `${item.word}.mp3`;
    if (!existingFiles.has(filename)) {
      const success = await downloadMP3(item.word);
      if (success) downloadCount++;
    }
  }

  // Step 2: Delete extra MP3s not in the JSON list
  let deleteCount = 0;
  for (const file of existingFiles) {
    if (
      !expectedFiles.has(file) &&
      file.endsWith(".mp3") &&
      !file.includes("error")
    ) {
      fs.unlinkSync(path.join(soundDirectory, file));
      console.log(`🗑️  Deleted: ${file}`);
      deleteCount++;
    }
  }

  // Final report
  console.log(
    `\n✅ Done! Downloaded: ${downloadCount}, Deleted: ${deleteCount}`
  );
};

// Start the process
downloadAllWords();
