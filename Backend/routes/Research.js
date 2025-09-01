// routes/Research.js
import express from "express";
import Article from "../models/Article.js";
import { extractTextFromUrl } from "../utils/extractText.js";
import OpenAI from "openai";

const router = express.Router();

// Initialize OpenAI as null initially - will be initialized when needed
let openai = null;

function initializeOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("✅ OpenAI initialized successfully");
    return true;
  }
  return false;
}

// POST /api/news/process
router.post("/process", async (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ ok: false, error: "No URLs provided" });
    }

    const results = [];
    for (const url of urls) {
      if (!url) continue;
      try {
        const { title, text } = await extractTextFromUrl(url);

        // upsert by URL
        const doc = await Article.findOneAndUpdate(
          { url },
          { title, content: text },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        results.push({ url, ok: true, title: doc.title, length: doc.content.length });
      } catch (e) {
        console.error("process URL error:", url, e.message);
        results.push({ url, ok: false, error: e.message });
      }
    }

    return res.json({ ok: true, results });
  } catch (err) {
    console.error("process route error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/news/history
router.get("/history", async (_req, res) => {
  try {
    const items = await Article.find().sort({ createdAt: -1 }).limit(50);
    res.json({ ok: true, items });
  } catch (err) {
    console.error("history route error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/news/ask
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ ok: false, error: "Question is required" });
    }

    // Try to initialize OpenAI if not already initialized
    const openaiInitialized = initializeOpenAI();
    
    // Check if OpenAI is available
    if (!openai) {
      return res.status(500).json({ 
        ok: false, 
        error: "OpenAI API not configured. Please check:\n" +
               "1. OPENAI_API_KEY is set in .env file\n" +
               "2. API key starts with 'sk-'\n" +
               "3. Server was restarted after adding the key",
        debug: {
          envKeyExists: !!process.env.OPENAI_API_KEY,
          keyFormatValid: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.startsWith('sk-') : false
        }
      });
    }

    const articles = await Article.find().sort({ updatedAt: -1 }).limit(5);
    if (articles.length === 0) {
      return res.status(400).json({ ok: false, error: "No articles processed yet. Please process some URLs first." });
    }

    // Combine article content with source information
    const contextWithSources = articles.map(article => 
      `SOURCE: ${article.url}\nTITLE: ${article.title || 'No title'}\nCONTENT: ${article.content.slice(0, 1500)}`
    ).join('\n\n');

    try {
      console.log("Calling OpenAI API...");
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are RockyBot, a helpful AI assistant that answers questions based on provided news articles. 
            Always provide accurate information and cite the sources when possible. 
            If the answer cannot be found in the provided articles, clearly state "I couldn't find specific information about this in the provided articles."
            Be concise, informative, and helpful.`
          },
          {
            role: "user",
            content: `Based on the following news articles, please answer this question: "${question}"

ARTICLES CONTEXT:
${contextWithSources}

Please provide a comprehensive answer based only on the articles above.`
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const answer = completion.choices[0]?.message?.content?.trim() || "I couldn't generate an answer at this time.";

      const sources = articles.map(a => a.url);
      return res.json({ 
        ok: true, 
        answer, 
        sources,
        model: "gpt-3.5-turbo"
      });

    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError.message);
      
      if (openaiError.status === 401) {
        return res.status(401).json({ 
          ok: false, 
          error: "Invalid OpenAI API key. Please check your API key is correct and has not expired."
        });
      } else if (openaiError.status === 429) {
        return res.status(429).json({ 
          ok: false, 
          error: "Rate limit exceeded. Please try again in a moment." 
        });
      } else if (openaiError.status === 404) {
        return res.status(500).json({ 
          ok: false, 
          error: "OpenAI model not found. Please check the model name." 
        });
      }
      
      return res.status(500).json({ 
        ok: false, 
        error: "OpenAI API error: " + (openaiError.message || "Unknown error") 
      });
    }

  } catch (err) {
    console.error("Ask route error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;







// // routes/Research.js
// import express from "express";
// import Article from "../models/Article.js";
// import { extractTextFromUrl } from "../utils/extractText.js";
// import axios from "axios";

// const router = express.Router();

// // Free APIs that don't require keys
// const FREE_APIS = {
//   // Wikipedia API for general knowledge
//   WIKIPEDIA: "https://en.wikipedia.org/api/rest_v1/page/summary/",
  
//   // DuckDuckGo Instant Answer API
//   DUCKDUCKGO: "https://api.duckduckgo.com/",
  
//   // WordNet-based dictionary API
//   WORDNET: "https://api.dictionaryapi.dev/api/v2/entries/en/",
  
//   // News API (free tier - might require key but works without for basic)
//   NEWS: "https://newsapi.org/v2/",
  
//   // Free sentiment analysis API
//   SENTIMENT: "https://sentiment-analysis9.p.rapidapi.com/sentiment",
// };

// // Smart content analyzer with free API integration
// async function analyzeContentWithFreeAPIs(question, articles) {
//   const questionLower = question.toLowerCase();
//   const articleTitles = articles.map(a => a.title || 'Untitled article').filter(Boolean);
//   const articleContents = articles.map(a => a.content);
  
//   try {
//     // Try Wikipedia API first for general knowledge questions
//     if (isGeneralKnowledgeQuestion(questionLower)) {
//       const wikiResponse = await tryWikipediaAPI(question);
//       if (wikiResponse) {
//         return `${wikiResponse}\n\nAdditionally, I found ${articles.length} relevant articles including "${articleTitles.slice(0, 2).join('" and "')}" that provide current information on this topic.`;
//       }
//     }
    
//     // Try DuckDuckGo for factual questions
//     const duckDuckGoResponse = await tryDuckDuckGoAPI(question);
//     if (duckDuckGoResponse) {
//       return `${duckDuckGoResponse}\n\nI also processed ${articles.length} recent articles that may provide additional context: "${articleTitles.slice(0, 2).join('" and "')}"`;
//     }
    
//     // Fallback to our smart content analysis
//     return generateSmartResponse(question, articleTitles, articleContents);
    
//   } catch (error) {
//     console.log("Free API call failed, using fallback:", error.message);
//     return generateSmartResponse(question, articleTitles, articleContents);
//   }
// }

// function isGeneralKnowledgeQuestion(question) {
//   const generalKeywords = [
//     'what is', 'who is', 'define', 'meaning of', 'explain', 'describe',
//     'history of', 'about', 'information about'
//   ];
//   return generalKeywords.some(keyword => question.includes(keyword));
// }

// async function tryWikipediaAPI(question) {
//   try {
//     // Extract potential Wikipedia title from question
//     const searchTerm = question.replace(/^(what|who|where|when|why|how|is|are|does|do)\s+/i, '')
//                               .replace(/\?/g, '')
//                               .trim()
//                               .split(' ')[0]; // First main word
    
//     if (!searchTerm) return null;
    
//     const response = await axios.get(`${FREE_APIS.WIKIPEDIA}${encodeURIComponent(searchTerm)}`, {
//       timeout: 5000
//     });
    
//     if (response.data && response.data.extract) {
//       return `According to Wikipedia: ${response.data.extract}`;
//     }
//     return null;
//   } catch (error) {
//     return null;
//   }
// }

// async function tryDuckDuckGoAPI(question) {
//   try {
//     const response = await axios.get(FREE_APIS.DUCKDUCKGO, {
//       params: {
//         q: question,
//         format: 'json',
//         no_html: 1,
//         skip_disambig: 1
//       },
//       timeout: 5000
//     });
    
//     if (response.data && response.data.AbstractText) {
//       return response.data.AbstractText;
//     }
    
//     if (response.data && response.data.Answer) {
//       return response.data.Answer;
//     }
    
//     return null;
//   } catch (error) {
//     return null;
//   }
// }

// function generateSmartResponse(question, titles, contents) {
//   const questionLower = question.toLowerCase();
  
//   // Extract keywords for better context
//   const keywords = extractKeywords(questionLower);
//   const contentSummary = analyzeContentTopics(contents);
  
//   let response = `Based on my analysis of ${titles.length} articles including "${titles.slice(0, 2).join('" and "')}", `;
  
//   if (questionLower.includes('what') || questionLower.includes('explain')) {
//     response += `I found comprehensive information about "${question}". The articles cover ${contentSummary}. `;
//     response += `They provide detailed explanations and context that should help answer your question.`;
//   }
//   else if (questionLower.includes('who')) {
//     response += `the articles mention various individuals and organizations related to your question. `;
//     response += `You'll find specific names and roles in the processed content.`;
//   }
//   else if (questionLower.includes('when')) {
//     response += `the content includes timeline information and dates relevant to "${question}". `;
//     response += `The articles provide chronological context for better understanding.`;
//   }
//   else if (questionLower.includes('where')) {
//     response += `geographical information is covered in these articles. `;
//     response += `They discuss locations and places related to your question.`;
//   }
//   else if (questionLower.includes('why')) {
//     response += `the articles explore reasons and causes behind "${question}". `;
//     response += `They provide background context and analysis.`;
//   }
//   else if (questionLower.includes('how')) {
//     response += `the content describes processes and methods related to your question. `;
//     response += `You'll find step-by-step explanations in the articles.`;
//   }
//   else {
//     response += `I found relevant information addressing "${question}". `;
//     response += `The articles cover ${contentSummary} and provide valuable insights.`;
//   }
  
//   response += `\n\nFor the most accurate information, I recommend reviewing these articles directly.`;
  
//   if (keywords.length > 0) {
//     response += ` Look for sections discussing ${keywords.join(', ')}.`;
//   }
  
//   return response;
// }

// function extractKeywords(question) {
//   const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'what', 'who', 'when', 'where', 'why', 'how', 'does', 'do', 'did', 'can', 'could', 'will', 'would', 'should', 'might']);
  
//   return question.split(/\s+/)
//     .filter(word => word.length > 3 && !stopWords.has(word.toLowerCase()))
//     .slice(0, 5);
// }

// function analyzeContentTopics(contents) {
//   const topics = new Set();
//   const commonTopics = [
//     'technology', 'business', 'politics', 'health', 'education', 'environment',
//     'science', 'economy', 'culture', 'sports', 'entertainment', 'security'
//   ];
  
//   const combinedContent = contents.join(' ').toLowerCase();
  
//   commonTopics.forEach(topic => {
//     if (combinedContent.includes(topic)) {
//       topics.add(topic);
//     }
//   });
  
//   if (topics.size > 0) {
//     return Array.from(topics).join(', ');
//   }
  
//   return 'various important subjects';
// }

// // Enhanced text analysis with simple NLP techniques
// function enhanceWithTextAnalysis(question, articles) {
//   const contents = articles.map(a => a.content.toLowerCase());
//   const questionWords = new Set(question.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  
//   let mostRelevantArticle = null;
//   let highestMatchScore = 0;
  
//   articles.forEach((article, index) => {
//     let score = 0;
//     questionWords.forEach(word => {
//       if (contents[index].includes(word)) {
//         score++;
//       }
//     });
    
//     if (score > highestMatchScore) {
//       highestMatchScore = score;
//       mostRelevantArticle = article;
//     }
//   });
  
//   if (mostRelevantArticle && highestMatchScore > 0) {
//     const title = mostRelevantArticle.title || 'One of the articles';
//     return `The article "${title}" appears most relevant to your question. It contains specific information that directly addresses "${question}". I recommend focusing on this article for the most accurate answer.`;
//   }
  
//   return null;
// }

// // POST /api/news/process
// router.post("/process", async (req, res) => {
//   try {
//     const { urls } = req.body;
//     if (!Array.isArray(urls) || urls.length === 0) {
//       return res.status(400).json({ ok: false, error: "No URLs provided" });
//     }

//     const results = [];
//     for (const url of urls) {
//       if (!url) continue;
//       try {
//         const { title, text } = await extractTextFromUrl(url);

//         const doc = await Article.findOneAndUpdate(
//           { url },
//           { title, content: text },
//           { upsert: true, new: true, setDefaultsOnInsert: true }
//         );

//         results.push({ url, ok: true, title: doc.title, length: doc.content.length });
//       } catch (e) {
//         console.error("process URL error:", url, e.message);
//         results.push({ url, ok: false, error: e.message });
//       }
//     }

//     return res.json({ ok: true, results });
//   } catch (err) {
//     console.error("process route error:", err);
//     return res.status(500).json({ ok: false, error: err.message });
//   }
// });

// // GET /api/news/history
// router.get("/history", async (_req, res) => {
//   try {
//     const items = await Article.find().sort({ createdAt: -1 }).limit(50);
//     res.json({ ok: true, items });
//   } catch (err) {
//     console.error("history route error:", err);
//     return res.status(500).json({ ok: false, error: err.message });
//   }
// });

// // POST /api/news/ask
// router.post("/ask", async (req, res) => {
//   try {
//     const { question } = req.body;
//     if (!question || !question.trim()) {
//       return res.status(400).json({ ok: false, error: "Question is required" });
//     }

//     const articles = await Article.find().sort({ updatedAt: -1 }).limit(5);
//     if (articles.length === 0) {
//       return res.status(400).json({ ok: false, error: "No articles processed yet. Please process some URLs first." });
//     }

//     // Use free APIs and smart analysis
//     const answer = await analyzeContentWithFreeAPIs(question, articles);
//     const sources = articles.map(a => a.url);
    
//     // Add text analysis enhancement
//     const analysisNote = enhanceWithTextAnalysis(question, articles);
//     const enhancedAnswer = analysisNote ? `${answer}\n\n${analysisNote}` : answer;
    
//     return res.json({ 
//       ok: true, 
//       answer: enhancedAnswer,
//       sources,
//       model: "free-apis+content-analysis",
//       usingAI: false,
//       articlesAnalyzed: articles.length,
//       note: "Using free APIs and advanced content analysis"
//     });

//   } catch (err) {
//     console.error("Ask route error:", err);
//     return res.status(500).json({ ok: false, error: err.message });
//   }
// });

// export default router;