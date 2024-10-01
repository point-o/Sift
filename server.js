const express = require('express');
const { get } = require('axios');
const { load } = require('cheerio');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');

const app = express();
const port = 8080;

// CSV file path
const path = 'titles.csv';

// CSV writer configuration
const csvWriter = createObjectCsvWriter({
  path: path,
  header: [
    { id: 'Title', title: 'Title' },
    { id: 'Url', title: 'URL' }
  ]
});

app.use(express.json());

// Define the POST route
app.post('/send', async (req, res) => {
  try {
    // Extract properties separately from request body
    const urls = req.body.urls;
    const excludeWords = req.body.excludeKeywords;
    const includeWords = req.body.filterKeywords;

    // Ensure arrays are assigned properly, with default empty arrays if not present
    const validatedUrls = Array.isArray(urls) ? urls : [];
    const validatedExcludeWords = Array.isArray(excludeWords) ? excludeWords : [];
    const validatedIncludeWords = Array.isArray(includeWords) ? includeWords : [];

    // Log the received values for debugging
    console.log('Received URLs:', validatedUrls);
    console.log('Include Words:', validatedIncludeWords);
    console.log('Exclude Words:', validatedExcludeWords);

    // Validate input
    if (validatedUrls.length === 0) {
      throw new Error('Invalid input: `urls` should be a non-empty array');
    }

    // Call the scraping function
    await scrapeTitles(validatedUrls, validatedIncludeWords, validatedExcludeWords);

    // Send response to the client
    res.json('Scraping has finished.');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Fetch robots.txt
async function getRobotsTxt(baseUrl) {
  try {
    const robotsTxtUrl = `${baseUrl}/robots.txt`;
    const { data } = await get(robotsTxtUrl);
    return data;
  } catch (error) {
    console.error(`Failed to fetch robots.txt from ${baseUrl}:`, error.message);
    return '';
  }
}

// Parse robots.txt
function parseRobotsTxt(robotsTxt) {
  const disallowedPaths = (robotsTxt.match(/Disallow: (.+)/g) || []).map(line => line.replace('Disallow: ', '').trim());
  const crawlDelayMatch = robotsTxt.match(/Crawl-delay: (\d+)/);
  const crawlDelay = crawlDelayMatch ? parseInt(crawlDelayMatch[1], 10) * 1000 : 700;
  return { disallowedPaths, crawlDelay };
}

// Check if URL is disallowed
function isUrlDisallowed(url, disallowedPaths) {
  const urlPath = new URL(url).pathname;
  return disallowedPaths.some(disallowedPath => {
    if (!disallowedPath) return false;
    if (disallowedPath === '/') return false;
    return urlPath.startsWith(disallowedPath);
  });
}

// Scrape titles from URLs
async function scrapeTitles(urls, includeWords = [], excludeWords = []) {
  try {
    const titles = [];

    for (const baseUrl of urls) {
      try {
        // Check if we're allowed
        const robotsTxt = await getRobotsTxt(new URL(baseUrl).origin);
        const { disallowedPaths, crawlDelay } = parseRobotsTxt(robotsTxt);

        // If not allowed, move on to the next URL
        if (isUrlDisallowed(baseUrl, disallowedPaths)) {
          console.log(`Scraping disallowed for ${baseUrl} according to robots.txt`);
          continue;
        }

        // Fetch page content
        const { data } = await get(baseUrl);

        // Load and parse page content to extract titles
        const $ = load(data);

        $("p").each((i, element) => {
          const paragraphText = $(element).text().trim();
          if (paragraphText) {
            console.log('Paragraph Text analyzed.');

            // Check if the title matches include and exclude criteria
            const matchesIncludeWords = includeWords.length === 0 || includeWords.some(word => paragraphText.toLowerCase().includes(word.toLowerCase()));
            const matchesExcludeWords = excludeWords.length === 0 || !excludeWords.some(word => paragraphText.toLowerCase().includes(word.toLowerCase()));

            if (matchesIncludeWords && matchesExcludeWords) {
              titles.push({ Title: paragraphText, Url: baseUrl });
              console.log(`Title Added from ${baseUrl}`);
            }
          }
        });

        // Set a delay between each site request
        await new Promise(resolve => setTimeout(resolve, crawlDelay + 500));
      } catch (err) {
        console.error(`Failed to fetch ${baseUrl}:`, err.message);
      }
    }

    // Check if titles were found
    if (titles.length > 0) {
      // Remove the file if it exists
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
      
      // Write extracted titles to CSV file
      await csvWriter.writeRecords(titles);
      console.log('Titles have been written to titles.csv');
    } else {
      // Write "no results" message to CSV
      const noResultsMessage = [{ Title: 'no results, maybe try a different search?', Url: '' }];
      
      // Overwrite existing CSV file with the "no results" message
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
      
      await csvWriter.writeRecords(noResultsMessage);
      console.log('No results message has been written to titles.csv');
    }
  } catch (err) {
    console.error('An error occurred during the scraping process:', err.message);
  }
}
