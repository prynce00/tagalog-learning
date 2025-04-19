import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your JSON file
const jsonFilePath = path.join(__dirname, "../src/data/filipino_words.json");

// Read and parse JSON
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

// One-liner removeDuplicates function (keeping first occurrence)
const removeDuplicates = (data) =>
  Object.values(
    data.reduce(
      (acc, cur) => (acc[cur.word] ? acc : { ...acc, [cur.word]: cur }),
      {}
    )
  );

// Clean the data
const cleanedData = removeDuplicates(jsonData);

// Write cleaned data back to file
fs.writeFileSync(jsonFilePath, JSON.stringify(cleanedData, null, 2), "utf8");

console.log("✅ Duplicate entries removed based on 'word' and file updated.");
