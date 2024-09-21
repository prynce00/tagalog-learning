const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const baseUrl = 'http://hanzidb.org/character-list/by-frequency?page=';
const totalPages = 100; // Total number of pages to fetch
const results = [];

async function fetchPage(pageNumber) {
  try {
    const { data } = await axios.get(`${baseUrl}${pageNumber}`);
    const $ = cheerio.load(data);

    $('table tbody tr').each((i, row) => {
      const columns = $(row).find('td');
      if (columns.length > 0) {
        const character = $(columns[0]).text().trim();
        const pinyin = $(columns[1]).text().trim();
        const definition = $(columns[2]).text().trim();
        const hsk = $(columns[5]).text().trim();

        results.push({ character, pinyin, definition, hsk });
      }
    });
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error.message);
  }
}

async function fetchAllPages() {
  for (let i = 1; i <= totalPages; i++) {
    console.log(`Fetching page ${i}...`);
    await fetchPage(i);
  }

  fs.writeFileSync('hsk_characters.json', JSON.stringify(results, null, 2));
  console.log('Scraping complete. Data saved to hsk_characters.json');
}

fetchAllPages();
