import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5005/api";

export default function App() {
  const [urls, setUrls] = useState(["", "", ""]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const r = await axios.get(`${API_BASE}/news/history`);
      setHistory(r.data.items || []);
    } catch { }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const processUrls = async () => {
    try {
      setProcessing(true);
      const r = await axios.post(`${API_BASE}/news/process`, { urls: urls.filter(Boolean) });
      if (r.data.ok) {
        const failed = r.data.results.filter(x => !x.ok);
        if (failed.length) {
          alert("Processed with some failures:\n" + failed.map(f => `${f.url}: ${f.error}`).join("\n"));
        } else {
          alert("All URLs processed ✅");
        }
        fetchHistory();
      } else {
        alert("Error: " + (r.data.error || "Unknown"));
      }
    } catch (err) {
      alert("Error processing URLs: " + (err.response?.data?.error || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const askQuestion = async () => {
    try {
      setLoading(true);
      const r = await axios.post(`${API_BASE}/news/ask`, { question });
      if (r.data.ok) {
        setAnswer(r.data.answer);
        setSources(r.data.sources || []);
      } else {
        setAnswer("Error: " + (r.data.error || "No answer"));
        setSources([]);
      }
    } catch (err) {
      setAnswer("Error fetching answer: " + (err.response?.data?.error || err.message));
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-x-hidden">
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 drop-shadow">
            SearchBuddy — Futuristic Articles Research AI
          </h1>
          <p className="mt-2 text-gray-300">
            Paste a few  URLs, process them, then ask natural questions. Answers use an OPENAI Chatgpt QA model.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left panel: Inputs */}
          <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-cyan-300">Enter News URLs</h2>

            <div className="mt-4 space-y-3">
              {urls.map((u, i) => (
                <input
                  key={i}
                  type="text"
                  value={u}
                  onChange={(e) => {
                    const copy = [...urls];
                    copy[i] = e.target.value;
                    setUrls(copy);
                  }}
                  placeholder={`https://example.com/article-${i + 1}`}
                  className="w-full p-3 rounded-xl bg-black/30 border border-cyan-400/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>

            <button
              onClick={processUrls}
              disabled={processing || urls.filter(Boolean).length === 0}
              className="mt-5 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-bold shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
            >
              {processing ? "Processing..." : "⚡ Process URLs"}
            </button>

            <h2 className="text-lg font-semibold text-purple-300 mt-8">Ask a Question</h2>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What are the key points?"
              className="mt-3 w-full p-3 rounded-xl bg-black/30 border border-purple-400/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={askQuestion}
              disabled={loading || !question.trim()}
              className="mt-4 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 font-bold shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
            >
              {loading ? "Thinking..." : "🤖 Ask RockyBot"}
            </button>
          </div>

          {/* Right panel: Answer & History */}
          <div className="space-y-6">
            {/* Answer */}
            <div className="rounded-3xl bg-black/40 border border-white/20 backdrop-blur-xl p-6 shadow-inner min-h-[220px]">
              <h3 className="text-xl font-bold text-cyan-300">Answer</h3>
              <p className="mt-2 text-gray-200 whitespace-pre-wrap">
                {answer || "Your answer will appear here after you ask a question."}
              </p>

              {sources.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-purple-300">Sources</h4>
                  <div className="mt-2 grid gap-2">
                    {sources.map((s, i) => (
                      <a
                        key={i}
                        href={s}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-blue-300"
                      >
                        {s}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* History */}
            <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-pink-300">Recent Articles</h3>
                <button
                  onClick={fetchHistory}
                  className="text-sm px-3 py-1 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-4 space-y-3 max-h-64 overflow-auto pr-1">
                {history.length === 0 && (
                  <p className="text-gray-300">No articles yet. Process some URLs to see history.</p>
                )}
                {history.map((h) => (
                  <div
                    key={h._id}
                    className="p-3 rounded-xl bg-black/30 border border-white/10"
                  >
                    <div className="text-sm text-gray-300">{h.title || "Untitled"}</div>
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 text-xs break-all"
                    >
                      {h.url}
                    </a>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(h.updatedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
<p><span className="text-bold text-white">Note:</span> If API Key token limit crossed, use raw website link -  </p>
        {/* Footer */}
        <footer className="mt-10 text-center text-gray-400 text-sm">
          ⚡ Powered by s@nk<span className="text-cyan-400"> MongoDB</span> •{" "}
          <span className="text-purple-400">Express</span> •{" "}
          <span className="text-pink-400">React</span> •{" "}
          <span className="text-blue-400">OpenAI</span>
        </footer>
      </div>
    </div>
  );
}