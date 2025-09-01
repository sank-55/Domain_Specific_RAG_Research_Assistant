// backend/utils/extractText.js
import axios from "axios";
import * as cheerio from "cheerio";

export async function extractTextFromUrl(url) {
  try {
    const res = await axios.get(url, {
      timeout: 20000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    const html = res.data;
    const $ = cheerio.load(html);

    const title =
      $("meta[property='og:title']").attr("content") ||
      $("title").text().trim() ||
      "";

    // Try to extract article/main content first
    let text =
      $("article").text().trim() ||
      $("main").text().trim() ||
      $("div[id*='article'], div[class*='article']").text().trim();

    // Fallback to paragraphs
    if (!text || text.length < 500) {
      text = $("p")
        .map((i, el) => $(el).text())
        .get()
        .join("\n")
        .replace(/\n{3,}/g, "\n")
        .trim();
    }

    // Final fallback to body text (strip scripts/styles)
    if (!text || text.length < 200) {
      text = $("body").text().replace(/\s+/g, " ").trim();
    }

    // Cleanup
    text = text.replace(/\s+\n/g, "\n").replace(/\n\s+/g, "\n").trim();

    const MAX_LEN = 20000;
    if (text.length > MAX_LEN) text = text.slice(0, MAX_LEN);

    if (!text || text.length < 200) {
      throw new Error("Failed to extract meaningful text (site blocked or unsupported).");
    }

    return { title, text };
  } catch (err) {
    // Include axios response info if available for debugging
    const reason = err.response ? `${err.message} (status ${err.response.status})` : err.message;
    throw new Error(`extractTextFromUrl failed for ${url}: ${reason}`);
  }
}