import fs from "fs";
import path from "path";
import axios from "axios";
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const jsonFilePath = path.join(__dirname, "../src/data/filipino_words.json");
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

// Directory to save the sound files
const soundDirectory = "./sound";

// Create the sound folder if it doesn't exist
if (!fs.existsSync(soundDirectory)) {
  fs.mkdirSync(soundDirectory);
}

// Function to download MP3 file from the generated URL
const downloadMP3 = async (word) => {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=fil&q=${encodeURIComponent(
    word
  )}`;

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // Define the file path to save the MP3
    const filePath = path.join(soundDirectory, `${word}.mp3`);

    // Write the audio data to an MP3 file
    fs.writeFileSync(filePath, response.data);

    console.log(`Downloaded: ${word}`);
  } catch (err) {
    console.error(`Error downloading ${word}:`, err);
  }
};

// Loop through the JSON data and download MP3 for each word
const downloadAllWords = async () => {
  for (const item of jsonData) {
    const word = item.word;
    await downloadMP3(word); // Download MP3 for each word
  }
};

// Start the process
downloadAllWords();
